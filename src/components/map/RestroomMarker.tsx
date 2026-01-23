import { Marker } from 'react-map-gl/mapbox'
import { cn } from '../../lib/utils'
import { formatPrice } from '../../lib/utils'
import type { Restroom } from '../../lib/database.types'

interface RestroomMarkerProps {
  restroom: Restroom
  onClick?: () => void
}

export function RestroomMarker({ restroom, onClick }: RestroomMarkerProps) {
  const isClosed = restroom.status === 'closed'
  const isFree = restroom.is_free

  // Determine marker color
  const markerColor = isClosed
    ? 'bg-red-500'
    : isFree
    ? 'bg-green-500'
    : 'bg-primary-600'

  return (
    <Marker
      latitude={restroom.latitude}
      longitude={restroom.longitude}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation()
        onClick?.()
      }}
    >
      <button
        className="flex flex-col items-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
        aria-label={`${restroom.name} - ${isFree ? 'Gratis' : formatPrice(restroom.price)}`}
      >
        {/* Price/Status label */}
        <div
          className={cn(
            'px-2 py-0.5 rounded-full text-xs font-semibold text-white mb-0.5',
            'shadow-md',
            markerColor
          )}
        >
          {isClosed ? 'Cerrado' : isFree ? 'Gratis' : formatPrice(restroom.price)}
        </div>

        {/* Pin */}
        <div className="relative">
          <svg
            width="24"
            height="32"
            viewBox="0 0 24 32"
            fill="none"
            className="drop-shadow-lg"
          >
            <path
              d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z"
              className={cn(
                isClosed
                  ? 'fill-red-500'
                  : isFree
                  ? 'fill-green-500'
                  : 'fill-primary-600'
              )}
            />
            <circle cx="12" cy="12" r="5" fill="white" />
          </svg>
        </div>
      </button>
    </Marker>
  )
}
