import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { cn } from '../../lib/utils'

type SheetState = 'collapsed' | 'expanded'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  expandedContent?: React.ReactNode
  className?: string
}

const COLLAPSED_HEIGHT = 140 // Reduced from 200px per user feedback
const EXPANDED_HEIGHT_VH = 90
const DRAG_THRESHOLD = 80

export function BottomSheet({
  isOpen,
  onClose,
  children,
  expandedContent,
  className,
}: BottomSheetProps) {
  const [sheetState, setSheetState] = useState<SheetState>('collapsed')

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    const { offset, velocity } = info

    if (sheetState === 'collapsed') {
      // Swiping up to expand
      if (offset.y < -DRAG_THRESHOLD || velocity.y < -500) {
        setSheetState('expanded')
      }
      // Swiping down to close
      else if (offset.y > DRAG_THRESHOLD || velocity.y > 500) {
        onClose()
        setSheetState('collapsed')
      }
    } else {
      // Swiping down to collapse or close
      if (offset.y > DRAG_THRESHOLD * 2 || velocity.y > 800) {
        onClose()
        setSheetState('collapsed')
      } else if (offset.y > DRAG_THRESHOLD || velocity.y > 400) {
        setSheetState('collapsed')
      }
    }
  }, [sheetState, onClose])

  const handleClose = useCallback(() => {
    onClose()
    setSheetState('collapsed')
  }, [onClose])

  const isExpanded = sheetState === 'expanded'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isExpanded ? 1 : 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ 
              y: 0,
              height: isExpanded ? `${EXPANDED_HEIGHT_VH}vh` : COLLAPSED_HEIGHT 
            }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50',
              'bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl',
              'overflow-hidden',
              className
            )}
          >
            {/* Drag handle */}
            <div
              className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0"
              onClick={() => sheetState === 'collapsed' && setSheetState('expanded')}
            >
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Content */}
            <div className={cn(
              'overflow-y-auto px-5 pb-8',
              isExpanded ? 'h-[calc(100%-3rem)]' : 'h-[calc(100%-2.5rem)]'
            )}>
              {isExpanded && expandedContent ? expandedContent : children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
