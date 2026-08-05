export function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse bg-spark-peach/60 dark:bg-white/10 rounded-xl ${className}`} />
}

export function SkeletonCards({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} className="h-28" />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 6 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonBlock key={i} className="h-11" />
      ))}
    </div>
  )
}
