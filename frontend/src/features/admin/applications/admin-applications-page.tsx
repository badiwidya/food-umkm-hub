import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  Store,
  X,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type {
  StoreApprovalStatus,
  StoreWithOwnerDetailResponse,
  StoreWithOwnerSummaryResponse,
} from '../../../client'
import {
  getStoreWithOwnerDetailsAdminStoresIdGetOptions,
  listAllAdminStoresGetOptions,
} from '../../../client/@tanstack/react-query.gen'
import {
  formatApplicationStatus,
  formatDateTime,
  formatUserStatus,
  getApplicationStatusClassName,
} from './admin-application-format'
import { useAdminApplicationActions } from './use-admin-application-actions'

const PAGE_SIZE = 20

const STATUS_FILTERS = [
  {
    label: 'Semua',
    value: undefined,
  },
  {
    label: 'Pending',
    value: 'pending',
  },
  {
    label: 'Disetujui',
    value: 'approved',
  },
  {
    label: 'Ditolak',
    value: 'rejected',
  },
] satisfies Array<{
  label: string
  value: StoreApprovalStatus | undefined
}>

type AdminApplicationsPageProps = {
  onPageChange: (page: number) => void
  onStatusChange: (status: StoreApprovalStatus | undefined) => void
  page: number
  selectedStoreId?: string
  status?: StoreApprovalStatus
}

export function AdminApplicationsPage({
  onPageChange,
  onStatusChange,
  page,
  selectedStoreId,
  status,
}: AdminApplicationsPageProps) {
  const applicationsQuery = useQuery(
    listAllAdminStoresGetOptions({
      query: {
        page,
        pageSize: PAGE_SIZE,
        status: status ?? null,
      },
    }),
  )
  const applications = applicationsQuery.data?.data ?? []
  const totalApplications = applicationsQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalApplications / PAGE_SIZE))
  const hasPreviousPage = page > 1
  const hasNextPage = page < totalPages

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1e40af]">
                <ClipboardCheck aria-hidden="true" className="size-6" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-semibold leading-8 text-slate-900">
                  Kurasi Pendaftaran UMKM
                </h2>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Tinjau dan putuskan aplikasi toko yang masuk.
                </p>
              </div>
            </div>
          </div>
          <StatusFilter onChange={onStatusChange} selectedStatus={status} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="text-base font-semibold leading-6 text-slate-900">
                Daftar Aplikasi
              </h3>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {totalApplications} aplikasi
              </p>
            </div>
          </div>

          {applicationsQuery.isPending ? <ApplicationsSkeleton /> : null}

          {applicationsQuery.isError ? (
            <div className="p-5">
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
                <p className="text-sm leading-5 text-red-700">
                  Aplikasi gagal dimuat. Coba muat ulang halaman.
                </p>
              </div>
            </div>
          ) : null}

          {applicationsQuery.isSuccess && applications.length === 0 ? (
            <div className="p-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm leading-5 text-slate-500">
                  {status
                    ? 'Tidak ada aplikasi dengan status ini.'
                    : 'Belum ada aplikasi pendaftaran UMKM.'}
                </p>
              </div>
            </div>
          ) : null}

          {applications.length > 0 ? (
            <>
              <ApplicationsTable
                applications={applications}
                page={page}
                selectedStoreId={selectedStoreId}
                status={status}
              />
              <ApplicationsCardList
                applications={applications}
                page={page}
                selectedStoreId={selectedStoreId}
                status={status}
              />
              <Pagination
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                onPageChange={onPageChange}
                page={page}
                totalPages={totalPages}
              />
            </>
          ) : null}
        </section>

        <ApplicationDetailPanel selectedStoreId={selectedStoreId} />
      </div>
    </div>
  )
}

function StatusFilter({
  onChange,
  selectedStatus,
}: {
  onChange: (status: StoreApprovalStatus | undefined) => void
  selectedStatus: StoreApprovalStatus | undefined
}) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 sm:flex">
      {STATUS_FILTERS.map((filter) => (
        <button
          className={[
            'h-9 rounded-md px-3 text-sm font-medium leading-5 transition',
            selectedStatus === filter.value
              ? 'bg-white text-[#1e40af] shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          ].join(' ')}
          key={filter.label}
          onClick={() => onChange(filter.value)}
          type="button"
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

function ApplicationsTable({
  applications,
  page,
  selectedStoreId,
  status,
}: {
  applications: Array<StoreWithOwnerSummaryResponse>
  page: number
  selectedStoreId: string | undefined
  status: StoreApprovalStatus | undefined
}) {
  return (
    <div className="hidden overflow-x-auto lg:block">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="w-[36%] px-5 py-3">Toko</th>
            <th className="w-[30%] px-5 py-3">Pemilik</th>
            <th className="w-[18%] px-5 py-3">Status</th>
            <th className="w-[16%] px-5 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr
              className={[
                'border-b border-slate-100 transition last:border-b-0',
                selectedStoreId === application.id
                  ? 'bg-blue-50/60'
                  : 'hover:bg-slate-50',
              ].join(' ')}
              key={application.id}
            >
              <td className="px-5 py-4">
                <StoreIdentity application={application} />
              </td>
              <td className="px-5 py-4">
                <OwnerSummary application={application} />
              </td>
              <td className="px-5 py-4">
                <StatusBadge status={application.approvalStatus} />
              </td>
              <td className="px-5 py-4 text-right">
                <DetailLink
                  application={application}
                  page={page}
                  status={status}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ApplicationsCardList({
  applications,
  page,
  selectedStoreId,
  status,
}: {
  applications: Array<StoreWithOwnerSummaryResponse>
  page: number
  selectedStoreId: string | undefined
  status: StoreApprovalStatus | undefined
}) {
  return (
    <div className="space-y-3 p-4 lg:hidden">
      {applications.map((application) => (
        <article
          className={[
            'rounded-lg border p-4 transition',
            selectedStoreId === application.id
              ? 'border-blue-200 bg-blue-50/60'
              : 'border-slate-200 bg-white',
          ].join(' ')}
          key={application.id}
        >
          <div className="flex items-start justify-between gap-3">
            <StoreIdentity application={application} />
            <StatusBadge status={application.approvalStatus} />
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <OwnerSummary application={application} />
          </div>
          <div className="mt-4">
            <DetailLink application={application} page={page} status={status} />
          </div>
        </article>
      ))}
    </div>
  )
}

function StoreIdentity({
  application,
}: {
  application: StoreWithOwnerSummaryResponse
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-center text-xs leading-4 text-slate-400">
        {application.photoUrl ? (
          <img
            alt={application.name}
            className="size-full object-cover"
            src={application.photoUrl}
          />
        ) : (
          <Store aria-hidden="true" className="size-5" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium leading-5 text-slate-900">
          {application.name}
        </p>
        <p className="mt-1 truncate text-sm leading-5 text-slate-500">
          ID {application.id.slice(0, 8)}
        </p>
      </div>
    </div>
  )
}

function OwnerSummary({
  application,
}: {
  application: StoreWithOwnerSummaryResponse
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium leading-5 text-slate-800">
        {application.owner.fullName}
      </p>
      <p className="mt-1 truncate text-sm leading-5 text-slate-500">
        {application.owner.email}
      </p>
      <p className="mt-1 truncate text-xs leading-4 text-slate-400">
        {application.owner.phoneNumber}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: StoreApprovalStatus }) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium leading-4',
        getApplicationStatusClassName(status),
      ].join(' ')}
    >
      {formatApplicationStatus(status)}
    </span>
  )
}

function DetailLink({
  application,
  page,
  status,
}: {
  application: StoreWithOwnerSummaryResponse
  page: number
  status: StoreApprovalStatus | undefined
}) {
  return (
    <Link
      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#1e40af] px-3 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c]"
      params={{
        storeId: application.id,
      }}
      search={{
        page,
        status,
      }}
      to="/admin/stores/$storeId"
    >
      Detail
      <ChevronRight aria-hidden="true" className="size-4" />
    </Link>
  )
}

function Pagination({
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  page,
  totalPages,
}: {
  hasNextPage: boolean
  hasPreviousPage: boolean
  onPageChange: (page: number) => void
  page: number
  totalPages: number
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-5 py-4">
      <p className="text-sm leading-5 text-slate-500">
        Halaman {page} dari {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium leading-5 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          Sebelumnya
        </button>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium leading-5 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          Berikutnya
          <ChevronRight aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  )
}

function ApplicationDetailPanel({
  selectedStoreId,
}: {
  selectedStoreId: string | undefined
}) {
  if (!selectedStoreId) {
    return (
      <aside className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm lg:sticky lg:top-6 lg:self-start">
        <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
          <Store aria-hidden="true" className="size-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold leading-6 text-slate-900">
          Pilih aplikasi
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Pilih salah satu aplikasi untuk melihat detail pendaftaran UMKM.
        </p>
      </aside>
    )
  }

  return <ApplicationDetail storeId={selectedStoreId} />
}

function ApplicationDetail({ storeId }: { storeId: string }) {
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const detailQuery = useQuery(
    getStoreWithOwnerDetailsAdminStoresIdGetOptions({
      path: {
        id: storeId,
      },
    }),
  )
  const actions = useAdminApplicationActions()
  const detail = detailQuery.data
  const isApproving =
    actions.pendingAction?.action === 'approve' &&
    actions.pendingAction.storeId === storeId
  const isRejecting =
    actions.pendingAction?.action === 'reject' &&
    actions.pendingAction.storeId === storeId

  return (
    <aside className="rounded-lg border border-slate-200 bg-white shadow-sm lg:sticky lg:top-6 lg:self-start">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold leading-6 text-slate-900">
          Detail Aplikasi
        </h3>
      </div>

      {detailQuery.isPending ? <ApplicationDetailSkeleton /> : null}

      {detailQuery.isError ? (
        <div className="p-5">
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
            <p className="text-sm leading-5 text-red-700">
              Detail aplikasi gagal dimuat.
            </p>
          </div>
        </div>
      ) : null}

      {detail ? (
        <div className="space-y-5 p-5">
          <ApplicationDetailContent detail={detail} />

          {detail.approvalStatus === 'pending' ? (
            <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-5">
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-medium leading-5 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={Boolean(actions.pendingAction)}
                onClick={() => setIsRejectDialogOpen(true)}
                type="button"
              >
                <X aria-hidden="true" className="size-4" />
                Tolak
              </button>
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1e40af] px-4 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={Boolean(actions.pendingAction)}
                onClick={() => setIsApproveDialogOpen(true)}
                type="button"
              >
                <Check aria-hidden="true" className="size-4" />
                Setujui
              </button>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm leading-5 text-slate-600">
                Aplikasi ini sudah{' '}
                {formatApplicationStatus(detail.approvalStatus).toLowerCase()}.
              </p>
            </div>
          )}

          {isApproveDialogOpen ? (
            <AdminConfirmationDialog
              confirmLabel="Setujui"
              description={`Aplikasi "${detail.name}" akan disetujui dan toko dapat tampil sesuai aturan backend.`}
              errorMessage={actions.errorMessage}
              isPending={isApproving}
              onClose={() => setIsApproveDialogOpen(false)}
              onConfirm={() => {
                void actions
                  .approveApplication(detail.id)
                  .then(() => setIsApproveDialogOpen(false))
                  .catch(() => undefined)
              }}
              title="Setujui aplikasi?"
            />
          ) : null}

          {isRejectDialogOpen ? (
            <RejectApplicationDialog
              application={detail}
              errorMessage={actions.errorMessage}
              isPending={isRejecting}
              onClose={() => setIsRejectDialogOpen(false)}
              onReject={(reason) =>
                actions
                  .rejectApplication(detail.id, reason)
                  .then(() => setIsRejectDialogOpen(false))
              }
            />
          ) : null}
        </div>
      ) : null}
    </aside>
  )
}

function AdminConfirmationDialog({
  cancelLabel = 'Batal',
  confirmLabel,
  description,
  errorMessage,
  isPending,
  onClose,
  onConfirm,
  title,
  variant = 'default',
}: {
  cancelLabel?: string
  confirmLabel: string
  description: string
  errorMessage: string | null
  isPending: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  variant?: 'default' | 'destructive'
}) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 py-6"
      onClick={isPending ? undefined : onClose}
      role="dialog"
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-base font-semibold leading-6 text-slate-900">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        {errorMessage ? (
          <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
            <p className="text-sm leading-5 text-red-700">{errorMessage}</p>
          </div>
        ) : null}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-medium leading-5 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            disabled={isPending}
            onClick={onClose}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={[
              'h-11 rounded-lg px-4 text-sm font-medium leading-5 text-white transition disabled:opacity-50',
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#1e40af] hover:bg-[#1d3a9c]',
            ].join(' ')}
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {isPending ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function ApplicationDetailContent({
  detail,
}: {
  detail: StoreWithOwnerDetailResponse
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-lg font-semibold leading-7 text-slate-900">
            {detail.name}
          </h4>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            Diajukan {formatDateTime(detail.createdAt)}
          </p>
        </div>
        <StatusBadge status={detail.approvalStatus} />
      </div>

      <ImagePreview alt={detail.name} label="Foto toko" src={detail.photoUrl} />

      <DetailSection title="Pemilik">
        <InfoRow label="Nama" value={detail.owner.fullName} />
        <InfoRow label="Email" value={detail.owner.email} />
        <InfoRow label="Telepon" value={detail.owner.phoneNumber} />
        <InfoRow
          label="Status akun"
          value={formatUserStatus(detail.owner.status)}
        />
      </DetailSection>

      <DetailSection title="Informasi Toko">
        <InfoRow label="Deskripsi" value={detail.description} />
        <InfoRow label="Alamat" value={detail.address} />
        <InfoRow label="Diperbarui" value={formatDateTime(detail.updatedAt)} />
        {detail.mapsLink ? (
          <a
            className="inline-flex items-center gap-2 text-sm font-medium leading-5 text-[#1e40af] hover:underline"
            href={detail.mapsLink}
            rel="noreferrer"
            target="_blank"
          >
            Buka tautan maps
            <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        ) : null}
      </DetailSection>

      <ImagePreview
        alt={`QRIS ${detail.name}`}
        label="QRIS"
        src={detail.qrisImageUrl}
      />

      {detail.approvalNotes ? (
        <DetailSection title="Catatan">
          <p className="text-sm leading-6 text-slate-600">
            {detail.approvalNotes}
          </p>
        </DetailSection>
      ) : null}
    </>
  )
}

function DetailSection({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <section className="space-y-3 rounded-lg border border-slate-200 p-4">
      <h5 className="text-sm font-semibold leading-5 text-slate-900">
        {title}
      </h5>
      {children}
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {value}
      </p>
    </div>
  )
}

function ImagePreview({
  alt,
  label,
  src,
}: {
  alt: string
  label: string
  src: string | null
}) {
  return (
    <section>
      <p className="mb-2 text-sm font-semibold leading-5 text-slate-900">
        {label}
      </p>
      <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 text-sm leading-5 text-slate-400">
        {src ? (
          <img alt={alt} className="size-full object-cover" src={src} />
        ) : (
          <span>Tidak tersedia</span>
        )}
      </div>
    </section>
  )
}

const rejectApplicationSchema = z.object({
  reason: z.string().trim().min(1, 'Alasan penolakan wajib diisi.'),
})

type RejectApplicationFormValues = z.infer<typeof rejectApplicationSchema>

function RejectApplicationDialog({
  application,
  errorMessage,
  isPending,
  onClose,
  onReject,
}: {
  application: StoreWithOwnerDetailResponse
  errorMessage: string | null
  isPending: boolean
  onClose: () => void
  onReject: (reason: string) => Promise<void>
}) {
  const form = useForm<RejectApplicationFormValues>({
    defaultValues: {
      reason: '',
    },
  })
  const reasonError = form.formState.errors.reason?.message
  const onSubmit = form.handleSubmit(async (values) => {
    const parsedValues = rejectApplicationSchema.safeParse(values)

    if (!parsedValues.success) {
      const issue = parsedValues.error.issues[0]

      form.setError('reason', {
        message: issue?.message ?? 'Alasan penolakan wajib diisi.',
        type: 'validate',
      })

      return
    }

    await onReject(parsedValues.data.reason)
    form.reset()
  })

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 py-6"
      onClick={isPending ? undefined : onClose}
      role="dialog"
    >
      <form
        className="w-full max-w-lg rounded-lg bg-white p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          void onSubmit(event)
        }}
      >
        <h3 className="text-base font-semibold leading-6 text-slate-900">
          Tolak aplikasi?
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Aplikasi "{application.name}" akan ditolak. Alasan wajib diisi.
        </p>

        {errorMessage ? (
          <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
            <p className="text-sm leading-5 text-red-700">{errorMessage}</p>
          </div>
        ) : null}

        <div className="mt-4">
          <label
            className="text-sm font-medium leading-5 text-slate-700"
            htmlFor="reject-reason"
          >
            Alasan penolakan
          </label>
          <textarea
            className="mt-2 min-h-32 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1e40af] focus:ring-2 focus:ring-blue-100"
            disabled={isPending}
            id="reject-reason"
            placeholder="Contoh: Foto toko belum jelas atau data alamat belum lengkap."
            {...form.register('reason')}
          />
          {reasonError ? (
            <p className="mt-2 text-sm leading-5 text-red-600">{reasonError}</p>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-medium leading-5 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            disabled={isPending}
            onClick={onClose}
            type="button"
          >
            Batal
          </button>
          <button
            className="h-11 rounded-lg bg-red-600 px-4 text-sm font-medium leading-5 text-white transition hover:bg-red-700 disabled:opacity-50"
            disabled={isPending}
            type="submit"
          >
            {isPending ? 'Memproses...' : 'Tolak'}
          </button>
        </div>
      </form>
    </div>
  )
}

function ApplicationsSkeleton() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          className="h-16 animate-pulse rounded-lg bg-slate-100"
          key={index}
        />
      ))}
    </div>
  )
}

function ApplicationDetailSkeleton() {
  return (
    <div className="space-y-4 p-5">
      <div className="h-7 w-2/3 animate-pulse rounded bg-slate-100" />
      <div className="aspect-video animate-pulse rounded-lg bg-slate-100" />
      <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
      <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
    </div>
  )
}
