import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { cn } from '../../lib/utils'



interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  expandedContent?: React.ReactNode
  className?: string
  collapsedHeight?: number
  isExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}

const DEFAULT_COLLAPSED_HEIGHT = 160
const EXPANDED_HEIGHT_VH = 85
const DRAG_THRESHOLD = 80

export function BottomSheet({
  isOpen,
  onClose,
  children,
  expandedContent,
  className,
  collapsedHeight = DEFAULT_COLLAPSED_HEIGHT,
  isExpanded: controlledExpanded,
  onExpandedChange,
}: BottomSheetProps) {
  const [internalExpanded, setInternalExpanded] = useState(false)
  const isControlled = controlledExpanded !== undefined
  const isExpanded = isControlled ? controlledExpanded : internalExpanded

  const setExpanded = useCallback((expanded: boolean) => {
    if (onExpandedChange) {
      onExpandedChange(expanded)
    }
    if (!isControlled) {
      setInternalExpanded(expanded)
    }
  }, [isControlled, onExpandedChange])

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    const { offset, velocity } = info

    if (!isExpanded) {
      // Swiping up to expand
      if (offset.y < -DRAG_THRESHOLD || velocity.y < -500) {
        setExpanded(true)
      }
      // Swiping down to close
      else if (offset.y > DRAG_THRESHOLD || velocity.y > 500) {
        onClose()
        setExpanded(false)
      }
    } else {
      // Swiping down to collapse or close
      if (offset.y > DRAG_THRESHOLD * 2 || velocity.y > 800) {
        onClose()
        setExpanded(false)
      } else if (offset.y > DRAG_THRESHOLD || velocity.y > 400) {
        setExpanded(false)
      }
    }
  }, [isExpanded, onClose, setExpanded])

  const handleClose = useCallback(() => {
    onClose()
    setExpanded(false)
  }, [onClose, setExpanded])

  const toggleExpand = useCallback(() => {
    setExpanded(!isExpanded)
  }, [isExpanded, setExpanded])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isExpanded ? 0.6 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            style={{ pointerEvents: isExpanded ? 'auto' : 'none' }}
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ 
              y: 0,
              height: isExpanded ? `${EXPANDED_HEIGHT_VH}vh` : collapsedHeight 
            }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50',
              'bg-gray-900/95 backdrop-blur-xl',
              'rounded-t-[2rem] shadow-2xl',
              'border-t border-white/10',
              'ring-1 ring-white/5',
              'overflow-hidden',
              'flex flex-col',
              // Tablet/Desktop: centered floating card
              'md:max-w-xl md:mx-auto md:rounded-3xl md:bottom-4 md:left-4 md:right-4 md:!h-auto',
              'lg:max-w-2xl',
              className
            )}
          >
            {/* Drag handle (Overlay) */}
            <div
              className="absolute top-3 left-0 right-0 z-50 flex justify-center cursor-grab active:cursor-grabbing"
              onClick={toggleExpand}
            >
              <div className="w-12 h-1.5 bg-white/30 backdrop-blur-md rounded-full shadow-sm transition-colors hover:bg-white/50" />
            </div>

            {/* Content */}
            <div 
              className={cn(
                'flex-1 overflow-hidden flex flex-col',
                !isExpanded && 'cursor-pointer' // Add pointer cursor to indicate clickability
              )}
              onClick={() => !isExpanded && setExpanded(true)}
            >
              {isExpanded && expandedContent ? expandedContent : children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
