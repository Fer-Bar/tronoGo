import { useCallback, useRef, useImperativeHandle, forwardRef } from 'react'
import Map, { GeolocateControl } from 'react-map-gl/mapbox'
import type { ViewStateChangeEvent, MapRef } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MAPBOX_TOKEN, MAP_STYLE } from '../../lib/constants'
import { useAppStore } from '../../lib/store'
import type { Restroom } from '../../lib/database.types'
import { RestroomMarker } from './RestroomMarker'
import { LocationMarker } from './LocationMarker'

interface MapboxMapProps {
  restrooms?: Restroom[]
  onMarkerClick?: (id: string) => void
  mode?: 'explore' | 'pin-picker'
  onMoveEnd?: () => void
}

export interface MapboxMapHandle {
  flyTo: (longitude: number, latitude: number, zoom?: number) => void
}

export const MapboxMap = forwardRef<MapboxMapHandle, MapboxMapProps>(
  function MapboxMap({ restrooms = [], onMarkerClick, mode = 'explore', onMoveEnd }, ref) {
    const { mapViewState, setMapViewState, userLocation } = useAppStore()
    const mapRef = useRef<MapRef>(null)

    // Expose flyTo method to parent components
    useImperativeHandle(ref, () => ({
      flyTo: (longitude: number, latitude: number, zoom = 16) => {
        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom,
          duration: 1500,
          essential: true,
        })
      },
    }))

    const handleMove = useCallback(
      (evt: ViewStateChangeEvent) => {
        setMapViewState({
          longitude: evt.viewState.longitude,
          latitude: evt.viewState.latitude,
          zoom: evt.viewState.zoom,
        })
      },
      [setMapViewState]
    )

    return (
      <Map
        ref={mapRef}
        {...mapViewState}
        onMove={handleMove}
        onMoveEnd={onMoveEnd}
        mapStyle={MAP_STYLE}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {/* Geolocate control - Hidden, we use custom button */}
        <GeolocateControl
          position="bottom-right"
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation
          showUserHeading
          style={{ display: 'none' }} 
        />

        {/* User location marker */}
        {userLocation && (
          <LocationMarker latitude={userLocation.latitude} longitude={userLocation.longitude} />
        )}

        {/* Restroom markers - Only show in Explore Mode */}
        {mode === 'explore' && restrooms.map((restroom) => (
          <RestroomMarker
            key={restroom.id}
            restroom={restroom}
            onClick={() => onMarkerClick?.(restroom.id)}
          />
        ))}
      </Map>
    )
  }
)

