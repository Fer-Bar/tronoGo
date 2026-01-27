import { IconX, IconNavigation, IconMapPin, IconCash, IconStar, IconWheelchair, IconBabyCarriage, IconGenderBigender, IconBuildingStore, IconToolsKitchen2, IconExternalLink, IconLock, IconStarFilled } from '@tabler/icons-react'
import { Button } from '../ui/Button'
import { BottomSheet } from '../ui/BottomSheet'
import { TYPE_LABELS, AMENITY_LABELS } from '../../lib/constants'
import type { Restroom } from '../../lib/database.types'

interface RestroomDetailProps {
  restroom: Restroom | null
  isOpen: boolean
  onClose: () => void
}

const AMENITY_ICONS: Record<string, React.ElementType> = {
  accessible: IconWheelchair,
  unisex: IconGenderBigender,
  baby_changing: IconBabyCarriage,
  paper: IconBuildingStore, // Placeholder
  soap: IconToolsKitchen2, // Placeholder
  private: IconLock,
}

export function RestroomDetail({ restroom, isOpen, onClose }: RestroomDetailProps) {
  if (!restroom) return null

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${restroom.latitude},${restroom.longitude}&travelmode=walking`
    window.open(url, "_blank")
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="p-0">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white truncate">{restroom.name}</h3>
              <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-500">
                <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                  {TYPE_LABELS[restroom.type]?.label || restroom.type}
                </span>
                {/* Add distance if available */}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0 -mr-2 -mt-2"
            >
              <IconX className="size-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-6 space-y-5">
          {/* Rating & Price */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <IconStarFilled className="size-5 text-amber-400" />
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                {restroom.vote_count > 0 ? restroom.rating.toFixed(1) : "N/A"}
              </span>
              <span className="text-gray-400 text-sm">({restroom.vote_count})</span>
            </div>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center gap-1.5">
              <IconCash className="size-5 text-gray-400" />
              <span className={restroom.is_free ? "text-emerald-500 font-bold" : "text-gray-900 dark:text-white font-medium"}>
                {restroom.is_free ? "Gratis" : `${restroom.price} Bs`}
              </span>
            </div>
          </div>

          {/* Address */}
          {restroom.address && (
            <div className="flex items-start gap-3 text-sm group">
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
                 <IconMapPin className="size-4 text-gray-500 dark:text-gray-400" />
              </div>
              <span className="text-gray-600 dark:text-gray-300 mt-1.5 leading-relaxed">{restroom.address}</span>
            </div>
          )}

          {/* Amenities */}
          {restroom.amenities && restroom.amenities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Servicios</h4>
              <div className="flex flex-wrap gap-2">
                {restroom.amenities.map((amenity) => {
                  const Icon = AMENITY_ICONS[amenity] || IconStar
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm border-2 border-gray-200 dark:border-gray-700"
                    >
                      <Icon className="size-[18px] text-violet-500" />
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {AMENITY_LABELS[amenity] || amenity}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="p-6 pt-2 flex flex-col gap-3">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full gap-2 shadow-xl shadow-primary-600/20 text-lg font-bold" 
            onClick={openGoogleMaps}
          >
            <IconNavigation className="size-5" />
            Ir Ahora
          </Button>
          <Button 
             variant="ghost"
             size="sm"
             onClick={openGoogleMaps}
             className="w-full text-gray-400 font-medium"
          >
             Abrir en Google Maps <IconExternalLink className="size-4 ml-1" />
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
