import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  CalendarClock,
  Clock3,
  Hash,
  Percent,
  Tag,
  TicketPercent,
  Wallet,
} from 'lucide-react'

import {
  ManagementFormField,
  ManagementSelectField,
} from '../../../components/common/management-form-field'
import type { PromoDetailResponse } from '../../../client'
import { usePromoForm } from './use-promo-form'

type PromoFormPageProps =
  | {
      mode: 'create'
    }
  | {
      mode: 'edit'
      promo: PromoDetailResponse
    }

export function AddPromoPage() {
  return <PromoFormPage mode="create" />
}

export function PromoFormPage(props: PromoFormPageProps) {
  const { form, formError, isPending, onSubmit } = usePromoForm(
    props.mode === 'edit'
      ? {
          kind: 'edit',
          promo: props.promo,
        }
      : {
          kind: 'create',
        },
  )
  const errors = form.formState.errors
  const type = form.watch('type')
  const isEditMode = props.mode === 'edit'

  return (
    <>
      <header className="bg-[#1e40af] px-4 pb-4 pt-6 text-white">
        <div className="flex items-center gap-3">
          <Link
            aria-label="Kembali ke promo"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
            to="/seller/promos"
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-medium leading-7">
              {isEditMode ? 'Edit Promo' : 'Tambah Promo'}
            </h1>
            <p className="mt-1 truncate text-sm leading-5 text-white/80">
              {isEditMode
                ? 'Perbarui detail promo toko'
                : 'Lengkapi detail promo toko'}
            </p>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
            <TicketPercent aria-hidden="true" className="size-6" />
          </div>
        </div>
      </header>

      <form className="pb-32" onSubmit={onSubmit}>
        <section className="space-y-5 px-4 py-5">
          {formError ? (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-sm leading-5 text-red-700">{formError}</p>
            </div>
          ) : null}

          {props.mode === 'edit' ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-medium leading-5 text-slate-800">
                Penggunaan Promo
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <PromoInfoTile
                  label="Terpakai"
                  value={`${props.promo.usageCount} kali`}
                />
                <PromoInfoTile
                  label="Batas"
                  value={
                    props.promo.maxUsage === null
                      ? 'Tidak dibatasi'
                      : `${props.promo.maxUsage} kali`
                  }
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <ManagementFormField
              error={errors.code?.message}
              icon={<Hash aria-hidden="true" className="size-5" />}
              label="Kode Promo"
              placeholder="Contoh: HEMAT20"
              type="text"
              {...form.register('code')}
            />
            <ManagementSelectField
              error={errors.type?.message}
              icon={<Tag aria-hidden="true" className="size-5" />}
              label="Jenis Promo"
              {...form.register('type')}
            >
              <option value="fixed">Potongan Harga</option>
              <option value="percentage">Persentase</option>
            </ManagementSelectField>
            <ManagementFormField
              error={errors.value?.message}
              icon={
                type === 'percentage' ? (
                  <Percent aria-hidden="true" className="size-5" />
                ) : (
                  <Wallet aria-hidden="true" className="size-5" />
                )
              }
              inputMode="numeric"
              label={type === 'percentage' ? 'Persentase Diskon' : 'Nominal'}
              min={1}
              placeholder={
                type === 'percentage' ? 'Contoh: 20' : 'Contoh: 5000'
              }
              type="number"
              {...form.register('value')}
            />
            <ManagementFormField
              error={errors.minOrderAmount?.message}
              icon={<Wallet aria-hidden="true" className="size-5" />}
              inputMode="numeric"
              label="Minimum Belanja"
              min={0}
              placeholder="Opsional, contoh: 25000"
              type="number"
              {...form.register('minOrderAmount')}
            />
            {type === 'percentage' ? (
              <ManagementFormField
                error={errors.maxDiscountAmount?.message}
                icon={<Wallet aria-hidden="true" className="size-5" />}
                inputMode="numeric"
                label="Maksimum Diskon"
                min={0}
                placeholder="Opsional, contoh: 10000"
                type="number"
                {...form.register('maxDiscountAmount')}
              />
            ) : null}
            <ManagementFormField
              error={errors.maxUsage?.message}
              icon={<Clock3 aria-hidden="true" className="size-5" />}
              inputMode="numeric"
              label="Batas Penggunaan"
              min={0}
              placeholder="Opsional, contoh: 100"
              type="number"
              {...form.register('maxUsage')}
            />
          </div>

          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <ManagementFormField
              error={errors.startDate?.message}
              icon={<CalendarClock aria-hidden="true" className="size-5" />}
              label="Mulai Berlaku"
              type="datetime-local"
              {...form.register('startDate')}
            />
            <ManagementFormField
              error={errors.endDate?.message}
              icon={<CalendarClock aria-hidden="true" className="size-5" />}
              label="Selesai Berlaku"
              type="datetime-local"
              {...form.register('endDate')}
            />
          </div>
        </section>

        <footer className="fixed inset-x-0 bottom-16 z-20 mx-auto w-full max-w-sm border-t border-slate-200 bg-white px-4 py-4 shadow-[0_-8px_20px_rgba(15,23,42,0.08)]">
          <div className="grid grid-cols-2 gap-3">
            <Link
              className="flex min-h-12 items-center justify-center rounded-lg border border-slate-200 px-4 py-3 text-base font-medium leading-6 text-slate-700 transition hover:bg-slate-50"
              to="/seller/promos"
            >
              Batal
            </Link>
            <button
              className="min-h-12 rounded-lg bg-[#1e40af] px-4 py-3 text-base font-medium leading-6 text-white transition hover:bg-[#1d3a9c] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </footer>
      </form>
    </>
  )
}

function PromoInfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-xs leading-4 text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-medium leading-5 text-slate-800">
        {value}
      </p>
    </div>
  )
}

export function PromoFormSkeleton() {
  return (
    <>
      <header className="bg-[#1e40af] px-4 pb-4 pt-6 text-white">
        <div className="h-7 w-32 animate-pulse rounded bg-white/20" />
        <div className="mt-2 h-5 w-44 animate-pulse rounded bg-white/20" />
      </header>
      <section className="space-y-5 px-4 py-5">
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
        </div>
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </section>
    </>
  )
}
