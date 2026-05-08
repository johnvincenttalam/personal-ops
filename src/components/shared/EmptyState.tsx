interface Props {
  title: string
  hint?: string
  action?: React.ReactNode
}

export default function EmptyState({ title, hint, action }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h3 className="text-base font-semibold text-gray-700 dark:text-zinc-200">
        {title}
      </h3>
      {hint && (
        <p className="mt-1 max-w-sm text-sm text-gray-400 dark:text-zinc-500">
          {hint}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
