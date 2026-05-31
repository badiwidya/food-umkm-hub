import { Search } from 'lucide-react'

type SearchInputProps = {
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

export function SearchInput({
  onChange,
  placeholder = 'Cari data...',
  value,
}: SearchInputProps) {
  return (
    <label className="relative block">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      />
      <input
        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#006B3F] focus:ring-2 focus:ring-[#006B3F]/10"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  )
}
