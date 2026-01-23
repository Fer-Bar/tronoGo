import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon' | 'action' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Variants
        variant === 'primary' && [
          'bg-primary-600 text-white rounded-full',
          'hover:bg-primary-700 active:bg-primary-800',
          'shadow-lg shadow-primary-600/25',
        ],
        variant === 'secondary' && [
          'bg-white text-gray-900 rounded-full border border-gray-200',
          'hover:bg-gray-50 active:bg-gray-100',
          'shadow-md',
        ],
        variant === 'icon' && [
          'bg-white text-gray-700 rounded-full',
          'hover:bg-gray-50 active:bg-gray-100',
          'shadow-lg',
        ],
        variant === 'action' && [
          'bg-action-500 text-white rounded-full',
          'hover:bg-action-600 active:bg-action-700',
          'shadow-lg shadow-action-500/25',
        ],
        variant === 'ghost' && [
            'bg-transparent text-gray-700 dark:text-gray-300',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
        ],
        // Sizes
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-5 py-2.5 text-base',
        size === 'lg' && 'px-6 py-3 text-lg',
        variant === 'icon' && size === 'md' && 'p-3',
        variant === 'icon' && size === 'lg' && 'p-4',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
