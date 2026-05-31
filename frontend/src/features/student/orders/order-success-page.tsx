import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Clock } from 'lucide-react'

import { getOrderDetailsOrdersIdGetOptions } from '../../../client/@tanstack/react-query.gen'
import { formatRupiah } from '../browse/format'

type OrderSuccessPageProps = {
  orderId: string
}

export function OrderSuccessPage({ orderId }: OrderSuccessPageProps) {
  const orderQuery = useQuery(
    getOrderDetailsOrdersIdGetOptions({
      path: {
        id: orderId,
      },
    }),
  )
  const order = orderQuery.data

  return (
    <main className="min-h-screen bg-[#fef7ff] text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-sm">
        <header className="bg-[#1e40af] px-4 py-5 text-white">
          <div className="flex items-center gap-4">
            <Link
              aria-label="Kembali"
              className="flex size-8 items-center justify-center rounded-full transition hover:bg-white/10"
              search={{
                status: undefined,
              }}
              to="/activity"
            >
              <ArrowLeft aria-hidden="true" className="size-6" />
            </Link>
            <h1 className="text-xl font-medium leading-7">Status pemesanan</h1>
          </div>
        </header>

        <section className="px-4 py-6 text-center">
          <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-[#1e40af] text-white">
            <Clock aria-hidden="true" className="size-12" />
          </div>
          <h2 className="mt-4 text-xl font-medium leading-7 text-slate-950">
            Menunggu Konfirmasi
          </h2>
          <p className="mt-2 text-sm leading-5 text-slate-500">
            Pesanan Anda telah diajukan.
          </p>
        </section>

        <section className="mx-4 rounded-xl bg-white p-4 shadow-md">
          <h3 className="text-base font-semibold leading-6 text-slate-950">
            Detail Pesanan
          </h3>
          <div className="mt-3 space-y-3 text-sm leading-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-700">ID Pesanan</span>
              <span className="font-mono text-xs text-slate-800">
                #{orderId.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-700">UMKM</span>
              <span className="text-right text-slate-900">
                {order?.storeId.slice(0, 8) ?? '-'}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-700">Jumlah Total</span>
                <span className="text-base font-medium leading-6 text-[#485e92]">
                  {order ? formatRupiah(order.totalPrice) : '-'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {orderQuery.isError ? (
          <p className="mx-4 mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
            Detail pesanan gagal dimuat. Pesanan tetap sudah diajukan jika
            checkout berhasil.
          </p>
        ) : null}

        <section className="mx-4 mt-6 rounded-xl bg-[#485e92]/15 p-4 text-[#485e92] shadow-md">
          <h3 className="text-xl font-medium leading-7">Selanjutnya</h3>
          <div className="mt-3 space-y-2 text-sm leading-5">
            <p>Pemilik UMKM akan mengonfirmasi pesanan Anda.</p>
            <p>Anda dapat memantau status pesanan dari halaman aktivitas.</p>
            <p>Estimasi waktu konfirmasi: 5-10 menit.</p>
          </div>
        </section>

        <section className="px-4 py-10 text-center">
          <p className="text-sm leading-6 text-slate-500">
            Terima kasih atas pesanan Anda.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#1e40af] px-4 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c]"
              params={{ orderId }}
              to="/orders/$orderId"
            >
              Lihat detail pesanan
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium leading-5 text-slate-700 transition hover:bg-slate-50"
              search={{
                status: undefined,
              }}
              to="/activity"
            >
              Lihat aktivitas
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
