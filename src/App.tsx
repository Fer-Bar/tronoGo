import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { ExploreScreen, PinPickerScreen, AddRestroomModal, AdminScreen } from './components/features'
import { Toaster } from 'sonner'
import { useAppStore } from './lib/store'
import { useAuthStore } from './lib/authStore'
import { MapboxMap } from './components/map'
import type { MapboxMapHandle } from './components/map/MapboxMap'
import { filterAndSortRestrooms } from './lib/utils'
import { MAPBOX_TOKEN } from './lib/constants'
import { getCachedLocation, initGeolocation } from './lib/geolocation'
import type { Restroom } from './lib/database.types'

type Screen = 'explore' | 'pin-picker' | 'admin' | 'admin-pin-picker'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('explore')
  const { isAddModalOpen, setIsAddModalOpen, setDraftLocation, filters, restrooms, userLocation, mapViewState } = useAppStore()
  const [pickerAddress, setPickerAddress] = useState<string>('Cargando direccion...')
  const mapRef = useRef<MapboxMapHandle>(null)

  // Force Cyber Midnight theme (Dark Mode)
  useState(() => {
    document.documentElement.classList.add('dark')
  })

  // Initialize auth listener
  useEffect(() => {
    const cleanup = useAuthStore.getState().initialize()
    return () => cleanup()
  }, [])

  // Load cached location immediately, then start watcher for updates
  useEffect(() => {
    const { setUserLocation, setMapViewState } = useAppStore.getState()
    
    // Load cached location first for instant UX
    const cached = getCachedLocation()
    if (cached) {
      setUserLocation(cached)
      setMapViewState({
        longitude: cached.longitude,
        latitude: cached.latitude,
        zoom: 15,
      })
    }

    // Start geolocation watcher (updates store + cache automatically)
    let hasCenteredOnLive = !!cached // Don't re-center if we already centered on cache
    const cleanup = initGeolocation((location) => {
      setUserLocation(location)
      
      // Center on first live location only if we didn't have cached data
      if (!hasCenteredOnLive) {
        setMapViewState({
          longitude: location.longitude,
          latitude: location.latitude,
          zoom: 15,
        })
        hasCenteredOnLive = true
      }
    })

    return () => cleanup?.()
  }, [])

  // Fetch Restrooms (moved from ExploreScreen to persist data)
  useEffect(() => {
    // Only fetch if empty to avoid refetching? Or aggressive? 
    // Usually fetching once on app load is improved pattern.
    if (useAppStore.getState().restrooms.length > 0) return

    import('./lib/api').then(async ({ fetchRestrooms }) => {
       // Assuming Restroom type is available or we cast later
       const { data, error } = await fetchRestrooms()

      if (error) {
        console.error('Error fetching restrooms:', error)
        return
      }

      if (data) {
        useAppStore.getState().setRestrooms(data as Restroom[]) 
      }
    })
  }, [])

  // Filter Restrooms (Memoized)
  const filteredRestrooms = useMemo(() => {
      return filterAndSortRestrooms(restrooms, filters, userLocation)
  }, [restrooms, filters, userLocation])


  // Address Fetch for Pin Picker
  const fetchAddress = useCallback(async (forceScreen?: Screen, coords?: { longitude: number; latitude: number }) => {
    const screen = forceScreen ?? currentScreen
    if (screen !== 'pin-picker' && screen !== 'admin-pin-picker') return
    
    const { longitude, latitude } = coords ?? mapViewState
    setPickerAddress('Cargando...')

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&language=es`
      )
      const data = await response.json()
      
        if (data.features && data.features.length > 0) {
          // Use full address (the util function will handle formatting/shortening)
          const fullAddress = data.features[0].place_name as string
          setPickerAddress(fullAddress)
        } else {
        setPickerAddress('Ubicación seleccionada')
      }
    } catch {
      setPickerAddress('Ubicación seleccionada')
    }
  }, [mapViewState, currentScreen])


  const handleAddClick = () => {
    setCurrentScreen('pin-picker')
    fetchAddress('pin-picker') // Force correct screen to avoid stale state
  }

  const handlePinPickerBack = () => {
    setDraftLocation(null)
    if (currentScreen === 'admin-pin-picker') {
      setCurrentScreen('admin')
    } else {
      setCurrentScreen('explore')
    }
  }

  const handlePinPickerConfirm = () => {
    if (currentScreen === 'admin-pin-picker') {
      setCurrentScreen('admin')
    } else {
      setIsAddModalOpen(true)
    }
  }

  const handleModalClose = () => {
    setIsAddModalOpen(false)
  }

  const handleAddSuccess = () => {
    setIsAddModalOpen(false)
    setDraftLocation(null)
    setCurrentScreen('explore')
  }

  // Handle marker click (passed down to ExploreScreen indirectly via store selection actually, 
  // but ExploreScreen usually handles the click. 
  // We need to pass this to MapboxMap.
  // ExploreScreen sets selectedRestroom. 
  // So we can define the handler here)
  const handleMarkerClick = useCallback((id: string) => {
      const restroom = restrooms.find((r) => r.id === id)
        if (restroom) {
          useAppStore.getState().setSelectedRestroom(restroom)
          // Use flyTo for smooth animation
          mapRef.current?.flyTo(restroom.longitude, restroom.latitude, 16)
        }
  }, [restrooms])

  // Fly to user location with smooth animation
  const handleFlyToUser = useCallback(() => {
    if (!userLocation) return
    mapRef.current?.flyTo(userLocation.longitude, userLocation.latitude, 16)
  }, [userLocation])

  // Fly to a specific restroom with smooth animation (used by ExploreScreen list)
  const handleFlyToRestroom = useCallback((longitude: number, latitude: number) => {
    mapRef.current?.flyTo(longitude, latitude, 16)
  }, [])


  // Navigate to admin screen
  const handleAdminClick = useCallback(() => {
    setCurrentScreen('admin')
  }, [])

  // Navigate back from admin
  const handleAdminBack = useCallback(() => {
    setCurrentScreen('explore')
  }, [])

  const handleAdminPickLocation = useCallback(() => {
    setCurrentScreen('admin-pin-picker')
    fetchAddress('admin-pin-picker')
  }, [fetchAddress])

  return (
    <div className="h-dvh w-screen overflow-hidden relative bg-gray-900">
      
      {/* Persistent Map Layer */}
      <div className="absolute inset-0 z-0">
          <MapboxMap 
             ref={mapRef}
             restrooms={filteredRestrooms} 
             mode={(currentScreen === 'pin-picker' || currentScreen === 'admin-pin-picker') ? 'pin-picker' : 'explore'}
             onMoveEnd={(coords) => fetchAddress(undefined, coords)}
             onMarkerClick={handleMarkerClick}
          />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
          {currentScreen === 'explore' && (
            <div className="w-full h-full">
               <ExploreScreen 
                 filteredRestrooms={filteredRestrooms}
                 onAddClick={handleAddClick} 
                 onFlyToUser={handleFlyToUser}
                 onFlyToRestroom={handleFlyToRestroom}
                 onAdminClick={handleAdminClick}
               />
            </div>
          )}

          {(currentScreen === 'pin-picker' || currentScreen === 'admin-pin-picker') && (
            <div className="w-full h-full">
                <PinPickerScreen
                  address={pickerAddress}
                  onBack={handlePinPickerBack}
                  onConfirm={handlePinPickerConfirm}
                />
            </div>
          )}

          {(currentScreen === 'admin' || currentScreen === 'admin-pin-picker') && (
            <div className={currentScreen === 'admin-pin-picker' ? 'hidden' : 'block'}>
              <AdminScreen
                onBack={handleAdminBack}
                onPickLocation={handleAdminPickLocation}
              />
            </div>
          )}
      </div>

      <AddRestroomModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onSuccess={handleAddSuccess}
      />
      <Toaster richColors position="top-center" closeButton theme="dark" />
    </div>
  )
}

export default App
