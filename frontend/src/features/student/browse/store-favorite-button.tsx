import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import type { MouseEvent } from 'react'

import {
  addStoreFavoriteFavoritesStoresStoreIdPostMutation,
  getStoreFavoriteStatusFavoritesStoresStoreIdStatusGetOptions,
  listFavoriteStoresFavoritesStoresGetQueryKey,
  removeStoreFavoriteFavoritesStoresStoreIdDeleteMutation,
} from '../../../client/@tanstack/react-query.gen'

type StoreFavoriteButtonProps = {
  storeId: string
}

export function StoreFavoriteButton({ storeId }: StoreFavoriteButtonProps) {
  const queryClient = useQueryClient()
  const favoriteStatusOptions =
    getStoreFavoriteStatusFavoritesStoresStoreIdStatusGetOptions({
      path: {
        store_id: storeId,
      },
    })
  const favoriteStatusQuery = useQuery(favoriteStatusOptions)
  const addFavoriteMutation = useMutation(
    addStoreFavoriteFavoritesStoresStoreIdPostMutation(),
  )
  const removeFavoriteMutation = useMutation(
    removeStoreFavoriteFavoritesStoresStoreIdDeleteMutation(),
  )
  const isFavorited = favoriteStatusQuery.data?.isFavorited ?? false
  const isPending =
    favoriteStatusQuery.isPending ||
    addFavoriteMutation.isPending ||
    removeFavoriteMutation.isPending

  async function invalidateFavoriteQueries() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: favoriteStatusOptions.queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: listFavoriteStoresFavoritesStoresGetQueryKey(),
      }),
    ])
  }

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    const mutationOptions = {
      path: {
        store_id: storeId,
      },
    }

    if (isFavorited) {
      await removeFavoriteMutation.mutateAsync(mutationOptions)
    } else {
      await addFavoriteMutation.mutateAsync(mutationOptions)
    }

    await invalidateFavoriteQueries()
  }

  return (
    <button
      aria-label={isFavorited ? 'Hapus dari favorit' : 'Tambah ke favorit'}
      className={[
        'flex size-8 shrink-0 items-center justify-center rounded-full transition',
        isFavorited
          ? 'text-red-500'
          : 'text-slate-500 hover:bg-slate-100 hover:text-[#1e40af]',
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={isPending}
      onClick={handleClick}
      type="button"
    >
      <Heart
        aria-hidden="true"
        className="size-5"
        fill={isFavorited ? 'currentColor' : 'none'}
      />
    </button>
  )
}
