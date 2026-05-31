import { Search } from 'lucide-react'
import { useState } from 'react'

type StoreSearchFormProps = {
  defaultSearch: string
  onSubmit: (search: string) => void
}

export function StoreSearchForm({
  defaultSearch,
  onSubmit,
}: StoreSearchFormProps) {
  const [search, setSearch] = useState(defaultSearch)

  return (
    <form
      className="relative"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(search.trim())
      }}
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400"
      />
      <input
        className="h-12 w-full rounded-lg border-0 bg-white pl-10 pr-4 text-base leading-6 text-slate-800 outline-none ring-1 ring-transparent transition placeholder:text-slate-400 focus:ring-blue-200"
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Cari UMKM..."
        type="search"
        value={search}
      />
    </form>
  )
}
