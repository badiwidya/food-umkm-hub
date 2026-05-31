import { createFileRoute } from '@tanstack/react-router'

import { StoreBrowsePage } from '../features/student/browse/store-browse-page'

type StoreBrowseSearch = {
  search?: string
}

export const Route = createFileRoute('/_authenticated/stores')({
  validateSearch: (search): StoreBrowseSearch => {
    const parsedSearch =
      typeof search.search === 'string' ? search.search.trim() : ''

    return {
      search: parsedSearch || undefined,
    }
  },
  component: StoresRoute,
})

function StoresRoute() {
  const { search } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <StoreBrowsePage
      onSearchSubmit={(nextSearch) => {
        void navigate({
          search: {
            search: nextSearch || undefined,
          },
        })
      }}
      search={search ?? ''}
    />
  )
}
