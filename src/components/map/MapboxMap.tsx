import { useCallback, useEffect, useState } from 'react'
import Map, { GeolocateControl } from 'react-map-gl/mapbox'
import type { ViewStateChangeEvent } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MAPBOX_TOKEN, MAP_STYLE } from '../../lib/constants'
import { useAppStore } from '../../lib/store'
import type { Restroom } from '../../lib/database.types'
import { RestroomMarker } from './RestroomMarker'
import { LocationMarker } from './LocationMarker'

interface MapboxMapProps {
  restrooms: Restroom[]
  onMarkerClick?: (id: string) => void
}

export function MapboxMap({ restrooms, onMarkerClick }: MapboxMapProps) {
  const { mapViewState, setMapViewState } = useAppStore()
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

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

  // Get user location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          // Center map on user location
          setMapViewState({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            zoom: 15,
          })
        },
        () => {
          // Geolocation denied or failed, use default
          console.log('Geolocation not available, using default location')
        }
      )
    }
  }, [setMapViewState])

  return (
    <Map
      {...mapViewState}
      onMove={handleMove}
      mapStyle={MAP_STYLE}
      mapboxAccessToken={MAPBOX_TOKEN}
      style={{ width: '100%', height: '100%' }}
      attributionControl={false}
    >
      {/* Geolocate control */}
      <GeolocateControl
        position="bottom-right"
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation
        showUserHeading
        style={{ display: 'none' }} // Hidden, we'll use custom button
      />

      {/* User location marker */}
      {userLocation && (
        <LocationMarker latitude={userLocation.lat} longitude={userLocation.lng} />
      )}

      {/* Restroom markers */}
      {restrooms.map((restroom) => (
        <RestroomMarker
          key={restroom.id}
          restroom={restroom}
          onClick={() => onMarkerClick?.(restroom.id)}
        />
      ))}
    </Map>
  )
}
