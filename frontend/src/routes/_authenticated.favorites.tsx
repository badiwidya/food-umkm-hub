import { createFileRoute } from '@tanstack/react-router'

import {
  FavoritesPage,
  type FavoritesTab,
} from '../features/student/favorites/favorites-page'

type FavoritesSearch = {
  tab?: FavoritesTab
}

function parseFavoritesTab(value: unknown): FavoritesTab {
  return value === 'stores' ? 'stores' : 'products'
}

export const Route = createFileRoute('/_authenticated/favorites')({
  validateSearch: (search): FavoritesSearch => ({
    tab: parseFavoritesTab(search.tab),
  }),
  component: FavoritesRoute,
})

function FavoritesRoute() {
  const { tab = 'products' } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <FavoritesPage
      activeTab={tab}
      onTabChange={(nextTab) => {
        void navigate({
          search: {
            tab: nextTab,
          },
        })
      }}
    />
  )
}
