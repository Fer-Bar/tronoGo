import { IconStar, IconStarFilled } from '@tabler/icons-react'
import { cn } from '../../lib/utils'

interface StarRatingProps {
  value: number // 0 to 5
  onChange?: (value: number) => void
  size?: number
  readOnly?: boolean
  className?: string
}

export function StarRating({ 
  value, 
  onChange, 
  size = 20, 
  readOnly = false,
  className 
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= value
        const isInteractive = !readOnly && onChange

        return (
          <button
            key={star}
            type="button"
            onClick={() => isInteractive && onChange(star)}
            className={cn(
              "transition-all duration-200",
              isInteractive ? "hover:scale-110 cursor-pointer" : "cursor-default",
              isInteractive && !isFilled && "text-gray-600 hover:text-yellow-400"
            )}
            disabled={readOnly}
          >
            {isFilled ? (
              <IconStarFilled 
                size={size} 
                className="text-yellow-400" 
              />
            ) : (
              <IconStar 
                size={size} 
                className={cn(
                  "text-gray-600",
                  // Add a subtle fill for empty stars in read-only mode for better visibility? 
                  // No, outline is standard.
                )} 
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
