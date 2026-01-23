import { cn } from '../../lib/utils'

interface ChipProps {
  label: string
  icon?: React.ReactNode
  isActive?: boolean
  onClick?: () => void
}

export function Chip({ label, icon, isActive = false, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
        'transition-all duration-200 whitespace-nowrap',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        isActive
          ? 'bg-primary-600 text-white shadow-md'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700'
      )}
    >
      {icon && <span className="text-current">{icon}</span>}
      {label}
    </button>
  )
}
