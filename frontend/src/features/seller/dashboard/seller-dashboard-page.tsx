import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  Ban,
  ClipboardList,
  ImagePlus,
  PackageCheck,
  Star,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import {
  getMeStoresMeGetOptions,
  getMyDashboardStoresMeDashboardGetOptions,
} from '../../../client/@tanstack/react-query.gen'
import { SellerDashboardHeader } from '../layout'
import { formatRating, formatRupiah } from './format'
import { SellerDashboardSkeleton } from './seller-dashboard-skeleton'
import { SellerMetricCard } from './seller-metric-card'
import { TopSellingProductsCard } from './top-selling-products-card'
import { useStoreOperationalStatus } from './use-store-operational-status'
import { useStoreRegistrationResubmit } from './use-store-registration-resubmit'

export function SellerDashboardPage() {
  const storeQuery = useQuery(getMeStoresMeGetOptions())
  const dashboardQuery = useQuery(getMyDashboardStoresMeDashboardGetOptions())
  const storeStatus = useStoreOperationalStatus()
  const storeRegistration = useStoreRegistrationResubmit()
  const dashboard = dashboardQuery.data
  const store = storeQuery.data
  const isApprovalPending = store?.approvalStatus === 'pending'
  const isApprovalRejected = store?.approvalStatus === 'rejected'
  const isStoreProfileIncomplete = Boolean(
    store && (!store.photoUrl || !store.qrisImageUrl),
  )

  return (
    <>
      <SellerDashboardHeader
        errorMessage={storeStatus.errorMessage}
        isError={storeQuery.isError}
        isPending={storeQuery.isPending}
        isStatusPending={storeStatus.isPending}
        onStatusToggle={(isOpen) => {
          void storeStatus.toggleStatus(isOpen)
        }}
        store={store}
      />

      {store ? (
        <section className="space-y-3 px-4 pt-5">
          {isApprovalRejected ? (
            <SellerDashboardNotice
              actionLabel="Edit Profil Toko"
              actionTo="/seller/profile/edit-store"
              buttonLabel="Ajukan Ulang Pendaftaran"
              errorMessage={storeRegistration.errorMessage}
              icon={Ban}
              isButtonPending={storeRegistration.isPending}
              message="Lengkapi atau perbaiki informasi toko Anda, lalu ajukan kembali pendaftaran untuk ditinjau oleh admin."
              note={store.approvalNotes}
              onButtonClick={() => {
                void storeRegistration.resubmit()
              }}
              title="Pendaftaran UMKM Anda ditolak."
              tone="danger"
            />
          ) : null}

          {isApprovalPending ? (
            <SellerDashboardNotice
              icon={AlertCircle}
              message="Pendaftaran UMKM Anda sedang menunggu persetujuan admin. Toko belum dapat beroperasi sampai proses kurasi selesai."
              tone="warning"
            />
          ) : null}

          {isStoreProfileIncomplete ? (
            <SellerDashboardNotice
              actionLabel="Lengkapi Profil Toko"
              actionTo="/seller/profile/edit-store"
              icon={ImagePlus}
              message="Lengkapi profil toko Anda agar pembeli dapat melihat informasi toko dan melakukan pembayaran dengan QRIS."
              tone="info"
            />
          ) : null}
        </section>
      ) : null}

      {dashboardQuery.isPending ? <SellerDashboardSkeleton /> : null}

      {dashboardQuery.isError ? (
        <section className="px-4 py-5">
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
            <p className="text-sm leading-5 text-red-700">
              Dashboard gagal dimuat. Coba muat ulang halaman.
            </p>
          </div>
        </section>
      ) : null}

      {dashboard ? (
        <section className="space-y-4 px-4 py-5">
          <div className="grid grid-cols-2 gap-3">
            <SellerMetricCard
              accentClassName="bg-blue-50 text-[#1e40af]"
              icon={Wallet}
              label="Pendapatan Hari Ini"
              value={formatRupiah(dashboard.todayRevenue)}
            />
            <SellerMetricCard
              accentClassName="bg-orange-50 text-orange-500"
              icon={ClipboardList}
              label="Total Pesanan"
              value={String(dashboard.totalOrders)}
            />
            <SellerMetricCard
              accentClassName="bg-purple-50 text-purple-500"
              icon={PackageCheck}
              label="Produk Terjual"
              value={String(dashboard.totalProductsSold)}
            />
            <SellerMetricCard
              accentClassName="bg-yellow-50 text-amber-500"
              helperText={`${dashboard.reviewCount} ulasan`}
              icon={Star}
              label="Rating Toko"
              value={formatRating(dashboard.storeRating)}
            />
          </div>

          <TopSellingProductsCard products={dashboard.topSellingProducts} />
        </section>
      ) : null}
    </>
  )
}

type SellerDashboardNoticeProps = {
  actionLabel?: string
  actionTo?: '/seller/profile/edit-store'
  buttonLabel?: string
  errorMessage?: string | null
  icon: LucideIcon
  isButtonPending?: boolean
  message: string
  note?: string | null
  onButtonClick?: () => void
  title?: string
  tone: 'danger' | 'info' | 'warning'
}

function SellerDashboardNotice({
  actionLabel,
  actionTo,
  buttonLabel,
  errorMessage,
  icon: Icon,
  isButtonPending = false,
  message,
  note,
  onButtonClick,
  title,
  tone,
}: SellerDashboardNoticeProps) {
  const toneClasses = getNoticeToneClasses(tone)

  return (
    <div
      className={[
        'rounded-lg border px-4 py-4',
        toneClasses.container,
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <Icon
          aria-hidden="true"
          className={['mt-0.5 size-5 shrink-0', toneClasses.icon].join(' ')}
        />
        <div className="min-w-0 flex-1">
          {title ? (
            <p
              className={[
                'text-sm font-semibold leading-6',
                toneClasses.text,
              ].join(' ')}
            >
              {title}
            </p>
          ) : null}
          {note ? (
            <p
              className={['mt-1 text-sm leading-6', toneClasses.text].join(
                ' ',
              )}
            >
              Catatan admin: {note}
            </p>
          ) : null}
          <p
            className={[
              'text-sm leading-6',
              title || note ? 'mt-1' : '',
              toneClasses.text,
            ].join(' ')}
          >
            {message}
          </p>
          {errorMessage ? (
            <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm leading-5 text-red-700">
              {errorMessage}
            </p>
          ) : null}
          {actionLabel && actionTo ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Link
                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#1e40af] px-4 py-2 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c]"
                to={actionTo}
              >
                {actionLabel}
              </Link>
              {buttonLabel && onButtonClick ? (
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#1e40af] px-4 py-2 text-sm font-medium leading-5 text-[#1e40af] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isButtonPending}
                  onClick={onButtonClick}
                  type="button"
                >
                  {isButtonPending ? 'Mengajukan...' : buttonLabel}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function getNoticeToneClasses(tone: SellerDashboardNoticeProps['tone']) {
  if (tone === 'danger') {
    return {
      container: 'border-red-200 bg-red-50',
      icon: 'text-red-600',
      text: 'text-red-900',
    }
  }

  if (tone === 'warning') {
    return {
      container: 'border-amber-200 bg-amber-50',
      icon: 'text-amber-600',
      text: 'text-amber-900',
    }
  }

  return {
    container: 'border-blue-200 bg-blue-50',
    icon: 'text-[#1e40af]',
    text: 'text-blue-900',
  }
}
