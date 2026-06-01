import { createFileRoute } from '@tanstack/react-router'

import {
  FavoritesPage,
  type FavoritesTab,
} from '../features/student/favorites/favorites-page'
import { titleHead } from '../lib/page-title'

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
  head: () => titleHead('Favorit'),
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
          resetScroll: false,
          search: {
            tab: nextTab,
          },
        })
      }}
    />
  )
}
