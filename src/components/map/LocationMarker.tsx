import { Marker } from 'react-map-gl/mapbox'

interface LocationMarkerProps {
  latitude: number
  longitude: number
}

export function LocationMarker({ latitude, longitude }: LocationMarkerProps) {
  return (
    <Marker latitude={latitude} longitude={longitude} anchor="center">
      <div className="relative">
        {/* Outer pulse animation */}
        <div className="absolute inset-0 w-6 h-6 bg-primary-500/30 rounded-full animate-ping" />
        {/* Inner solid dot */}
        <div className="relative w-6 h-6 bg-primary-600 rounded-full border-3 border-white shadow-lg" />
      </div>
    </Marker>
  )
}
