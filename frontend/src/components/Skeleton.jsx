export function SkeletonLine({ className = '' }) {
  return <div className={`h-4 skeleton rounded ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
      <div className="h-5 skeleton rounded w-1/3 mb-4" />
      <div className="space-y-2">
        <div className="h-4 skeleton rounded w-full" />
        <div className="h-4 skeleton rounded w-4/5" />
        <div className="h-4 skeleton rounded w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 skeleton rounded flex-1" />
        ))}
      </div>
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 skeleton rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
