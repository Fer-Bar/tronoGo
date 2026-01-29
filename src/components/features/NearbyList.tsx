import { IconX, IconNavigation, IconStar, IconCash } from '@tabler/icons-react'
import { Button } from '../ui/Button'
import { formatDistance, calculateDistance } from '../../lib/utils'
import { TYPE_LABELS } from '../../lib/constants'
import type { Restroom } from '../../lib/database.types'

interface NearbyListProps {
  restrooms: Restroom[]
  userLocation: { latitude: number; longitude: number } | null
  onRestroomSelect: (restroom: Restroom) => void
  onClose: () => void
}

export function NearbyList({
  restrooms,
  userLocation,
  onRestroomSelect,
  onClose,
}: NearbyListProps) {
  const handleStartRoute = (r: Restroom) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}&travelmode=walking`
    window.open(url, "_blank")
  }

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-end">
      {/* Lista - Solo esta parte bloquea el mapa */}
      <div className="pointer-events-auto max-h-[50vh] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300 md:max-w-xl md:mx-auto md:rounded-3xl md:mb-4 lg:max-w-2xl w-full">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between shrink-0 z-10">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Baños cercanos ({restrooms.length})</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
          >
            <IconX className="size-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {restrooms.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No se encontraron baños con los filtros seleccionados
            </div>
          ) : (
            <div className="space-y-1">
              {restrooms.map((restroom) => (
                <div
                  key={restroom.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-colors cursor-pointer active:scale-[0.98] duration-200"
                  onClick={() => onRestroomSelect(restroom)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">{restroom.name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                          {TYPE_LABELS[restroom.type]?.label || restroom.type}
                        </span>
                        {/* Calculate and show distance if user location is available */}
                        {userLocation && (
                          <span className="text-gray-500 text-xs text-nowrap">
                            {formatDistance(
                              calculateDistance(
                                userLocation.latitude, 
                                userLocation.longitude, 
                                restroom.latitude, 
                                restroom.longitude
                              )
                            )}
                          </span>
                        )}
                        {restroom.address && !userLocation && (
                           <span className="truncate max-w-[120px]">{restroom.address}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        {restroom.vote_count > 0 && (
                          <div className="flex items-center gap-1">
                            <IconStar className="size-3.5 text-amber-400 fill-amber-400" />
                            <span className="font-bold text-gray-700 dark:text-gray-300">{restroom.rating.toFixed(1)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <IconCash className="size-3.5 text-gray-400" />
                          <span className={restroom.is_free ? "text-emerald-500 font-bold" : "text-gray-600 dark:text-gray-400"}>
                            {restroom.is_free ? "Gratis" : `${restroom.price} Bs`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0 gap-1 rounded-full px-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartRoute(restroom)
                      }}
                    >
                      <IconNavigation className="size-4" />
                      Ir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
