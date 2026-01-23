import { motion, AnimatePresence } from 'framer-motion'
import { IconX, IconMoon } from '@tabler/icons-react'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../lib/store'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { isDarkMode, setIsDarkMode } = useAppStore()

  const handleToggleDarkMode = () => {
    const newValue = !isDarkMode
    setIsDarkMode(newValue)
    if (newValue) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleTermsClick = () => {
    // Open terms page or show terms modal
    window.open('https://example.com/terms', '_blank')
  }

  const handleSupportClick = () => {
    // Open email client or support page
    window.open('mailto:soporte@tronogo.com', '_blank')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative bg-white dark:bg-gray-900 w-full max-w-[340px] rounded-2xl shadow-2xl p-6 pointer-events-auto border border-gray-100 dark:border-gray-800">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
                aria-label="Cerrar"
              >
                <IconX size={20} />
              </button>

              {/* Content */}
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-6">
                  Configuración
                </h2>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between mb-8 px-1">
                  <div className="flex items-center gap-2">
                    <IconMoon size={20} className="text-gray-600 dark:text-gray-400" />
                    <span className="text-base font-semibold text-gray-700 dark:text-gray-200">
                      Modo Noche
                    </span>
                  </div>
                  <button
                    onClick={handleToggleDarkMode}
                    className={cn(
                      'relative w-12 h-7 rounded-full transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
                      isDarkMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    )}
                    role="switch"
                    aria-checked={isDarkMode}
                  >
                    <span
                      className={cn(
                        'absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200',
                        isDarkMode ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mb-8">
                  <button
                    onClick={handleTermsClick}
                    className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-sm transition-colors"
                  >
                    Términos y Condiciones
                  </button>
                  <button
                    onClick={handleSupportClick}
                    className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-sm transition-colors"
                  >
                    Contactar Soporte
                  </button>
                </div>

                {/* Version footer */}
                <div className="text-center">
                  <p className="text-xs text-gray-400 font-medium tracking-wide">
                    Versión 1.0 - TronoGo
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
