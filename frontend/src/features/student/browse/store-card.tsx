import { Link } from '@tanstack/react-router'
import { MapPin, Star } from 'lucide-react'

import type { AppStoresSchemaStoreSummaryResponse } from '../../../client'
import { formatRating } from './format'
import { StoreFavoriteButton } from './store-favorite-button'

type StoreCardProps = {
  store: AppStoresSchemaStoreSummaryResponse
}

export function StoreCard({ store }: StoreCardProps) {
  return (
    <Link
      className="block rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
      params={{
        storeId: store.id,
      }}
      to="/stores/$storeId"
    >
      <div className="flex gap-3">
        <div className="size-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {store.photoUrl ? (
            <img
              alt={store.name}
              className="size-full object-cover"
              src={store.photoUrl}
            />
          ) : (
            <div className="flex size-full items-center justify-center px-2 text-center text-xs leading-4 text-slate-400">
              Tidak ada foto
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-medium leading-5 text-slate-800">
              {store.name}
            </h3>
            <span
              className={[
                'shrink-0 rounded-full px-2 py-0.5 text-xs leading-4',
                store.isOpen
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {store.isOpen ? 'Buka' : 'Tutup'}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-4 text-slate-500">
            {store.totalReviews > 0
              ? `${store.totalReviews} ulasan`
              : 'Belum ada ulasan'}
          </p>
          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3 text-xs leading-4 text-slate-500">
              <span className="flex items-center gap-1">
                <Star
                  aria-hidden="true"
                  className="size-3.5 text-amber-400"
                  fill="currentColor"
                />
                {formatRating(store.rating)}
              </span>
              <span className="flex min-w-0 items-center gap-1">
                <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                <span className="truncate">Kampus IPB</span>
              </span>
            </div>
            <StoreFavoriteButton storeId={store.id} />
          </div>
        </div>
      </div>
    </Link>
  )
}
