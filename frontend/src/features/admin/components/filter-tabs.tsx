type FilterTab<T extends string> = {
  label: string
  value: T
}

type FilterTabsProps<T extends string> = {
  tabs: FilterTab<T>[]
  activeValue: T
  onChange: (value: T) => void
}

export function FilterTabs<T extends string>({
  activeValue,
  onChange,
  tabs,
}: FilterTabsProps<T>) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-2">
        {tabs.map((tab) => (
          <button
            className={[
              'rounded-full px-4 py-2 text-sm font-medium transition',
              activeValue === tab.value
                ? 'bg-[#006B3F] text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
            ].join(' ')}
            key={tab.value}
            onClick={() => onChange(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
