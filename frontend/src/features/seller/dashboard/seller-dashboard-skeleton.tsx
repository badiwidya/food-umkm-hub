export function SellerDashboardSkeleton() {
  return (
    <section className="space-y-4 px-4 py-5">
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            key={index}
          >
            <div className="size-10 animate-pulse rounded-lg bg-slate-100" />
            <div className="mt-3 h-3 w-24 animate-pulse rounded bg-slate-100" />
            <div className="mt-3 h-6 w-20 animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-3 w-16 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="h-6 w-32 animate-pulse rounded bg-slate-100" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="flex items-center gap-3" key={index}>
              <div className="size-12 animate-pulse rounded-md bg-slate-100" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="h-4 w-14 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
