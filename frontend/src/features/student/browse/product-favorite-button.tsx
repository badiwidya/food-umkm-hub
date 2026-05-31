import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import type { MouseEvent } from 'react'

import {
  addProductFavoriteFavoritesProductsProductIdPostMutation,
  getProductFavoriteStatusFavoritesProductsProductIdStatusGetOptions,
  listFavoriteProductsFavoritesProductsGetQueryKey,
  removeProductFavoriteFavoritesProductsProductIdDeleteMutation,
} from '../../../client/@tanstack/react-query.gen'

type ProductFavoriteButtonProps = {
  className?: string
  productId: string
}

export function ProductFavoriteButton({
  className,
  productId,
}: ProductFavoriteButtonProps) {
  const queryClient = useQueryClient()
  const favoriteStatusOptions =
    getProductFavoriteStatusFavoritesProductsProductIdStatusGetOptions({
      path: {
        product_id: productId,
      },
    })
  const favoriteStatusQuery = useQuery(favoriteStatusOptions)
  const addFavoriteMutation = useMutation(
    addProductFavoriteFavoritesProductsProductIdPostMutation(),
  )
  const removeFavoriteMutation = useMutation(
    removeProductFavoriteFavoritesProductsProductIdDeleteMutation(),
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
        queryKey: listFavoriteProductsFavoritesProductsGetQueryKey(),
      }),
    ])
  }

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    const mutationOptions = {
      path: {
        product_id: productId,
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
        className ??
          'absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/95 shadow-sm transition',
        isFavorited ? 'text-red-500' : 'text-slate-500 hover:text-[#1e40af]',
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
