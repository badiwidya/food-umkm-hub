import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getPromoDetailsPromosIdGetOptions } from '../client/@tanstack/react-query.gen'
import { PromoFormPage, PromoFormSkeleton } from '../features/seller'
import { titleHead } from '../lib/page-title'

export const Route = createFileRoute(
  '/_authenticated/seller/promos/$promoId/edit',
)({
  head: () => titleHead('Edit Promo'),
  component: EditPromoRoute,
})

function EditPromoRoute() {
  const { promoId } = Route.useParams()
  const promoQuery = useQuery(
    getPromoDetailsPromosIdGetOptions({
      path: {
        id: promoId,
      },
    }),
  )
  const promo = promoQuery.data

  if (promoQuery.isPending) {
    return <PromoFormSkeleton />
  }

  if (promoQuery.isError || !promo) {
    return (
      <>
        <header className="bg-[#1e40af] px-4 pb-4 pt-6 text-white">
          <h1 className="text-xl font-medium leading-7">Edit Promo</h1>
          <p className="mt-1 text-sm leading-5 text-white/80">
            Data promo gagal dimuat
          </p>
        </header>
        <section className="px-4 py-5">
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
            <p className="text-sm leading-5 text-red-700">
              Promo gagal dimuat. Coba muat ulang halaman.
            </p>
          </div>
        </section>
      </>
    )
  }

  return <PromoFormPage key={promo.id} mode="edit" promo={promo} />
}
