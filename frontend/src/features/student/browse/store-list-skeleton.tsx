export function StoreListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3"
          key={index}
        >
          <div className="size-24 shrink-0 animate-pulse rounded-lg bg-slate-100" />
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}
