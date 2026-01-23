import { IconSearch, IconSettings } from '@tabler/icons-react'
import { cn } from '../../lib/utils'

interface SearchBarProps {
  placeholder?: string
  onSettingsClick?: () => void
  className?: string
}

export function SearchBar({
  placeholder = 'Buscar en esta zona...',
  onSettingsClick,
  className,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 bg-white dark:bg-gray-900 rounded-full px-4 py-2.5',
        'shadow-lg border border-gray-100 dark:border-gray-800',
        className
      )}
    >
      <IconSearch size={20} className="text-gray-400 shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        className={cn(
          'flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
          'text-sm focus:outline-none min-w-0'
        )}
      />
      <button
        onClick={onSettingsClick}
        className={cn(
          'p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
          'hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0'
        )}
        aria-label="Settings"
      >
        <IconSettings size={18} />
      </button>
    </div>
  )
}
