export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-spark-peach dark:bg-white/10 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-spark-orange" />
        </div>
      )}
      <h3 className="font-display font-bold text-spark-ink dark:text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-spark-ink/50 dark:text-white/50 max-w-sm">{description}</p>}
    </div>
  )
}
