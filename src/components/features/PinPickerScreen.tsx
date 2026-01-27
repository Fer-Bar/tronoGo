import { IconArrowLeft, IconMapPin } from '@tabler/icons-react'
import { motion } from 'framer-motion'
import { Button } from '../ui'
import { useAppStore } from '../../lib/store'

interface PinPickerScreenProps {
  onConfirm: () => void
  onBack: () => void
  address: string
}

export function PinPickerScreen({ onConfirm, onBack, address }: PinPickerScreenProps) {
  const { setDraftLocation, mapViewState } = useAppStore()

  const handleConfirm = () => {
    // Current map view state is the location
    setDraftLocation({
      longitude: mapViewState.longitude,
      latitude: mapViewState.latitude,
      address,
    })
    onConfirm()
  }

  return (
    <div className="relative h-full w-full pointer-events-none">
      
      {/* Interactive UI Elements */}
      <div className="contents pointer-events-auto">

      {/* Fixed center pin (Visual Only) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10 w-fit h-fit">
        <motion.div
           initial={{ y: -20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ type: 'spring', damping: 15 }}
        >
          <div className="relative">
            <svg
              width="40"
              height="52"
              viewBox="0 0 40 52"
              fill="none"
              className="drop-shadow-xl"
            >
              <path
                d="M20 0C8.954 0 0 8.954 0 20c0 15 20 32 20 32s20-17 20-32c0-11.046-8.954-20-20-20z"
                fill="#3b82f6"
              />
              <circle cx="20" cy="20" r="8" fill="white" />
            </svg>
            {/* Pin shadow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 rounded-full blur-sm" />
          </div>
        </motion.div>
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 h-12 w-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg z-20 pointer-events-auto
                   hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700"
        aria-label="Volver"
      >
        <IconArrowLeft size={24} className="text-gray-700 dark:text-gray-200" />
      </button>

      {/* Address bar */}
      <div className="absolute top-4 left-20 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-auto z-20 pointer-events-none">
        <div className="h-12 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-5 shadow-lg w-full md:w-auto md:min-w-[300px] border border-gray-100 dark:border-gray-700 pointer-events-auto box-border">
          <IconMapPin size={20} className="text-primary-600 dark:text-primary-400 shrink-0" />
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">{address}</span>
        </div>
      </div>

      {/* Confirm button */}
      <div className="absolute bottom-8 inset-x-4 z-20 pointer-events-auto flex justify-center">
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleConfirm}
          className="w-full max-w-sm"
        >
          <IconMapPin size={20} />
          Confirmar Ubicación
        </Button>
      </div>

      </div>
    </div>
  )
}
