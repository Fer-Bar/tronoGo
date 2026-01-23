import { useState, useEffect, useCallback, useMemo } from 'react'
import { ExploreScreen, PinPickerScreen, AddRestroomModal } from './components/features'
import { Toaster } from 'sonner'
import { useAppStore } from './lib/store'
import { MapboxMap } from './components/map'
import { filterAndSortRestrooms } from './lib/utils'
import { MAPBOX_TOKEN } from './lib/constants'
import type { Restroom } from './lib/database.types'

type Screen = 'explore' | 'pin-picker'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('explore')
  const { isAddModalOpen, setIsAddModalOpen, setDraftLocation, filters, restrooms, userLocation, mapViewState } = useAppStore()
  const [pickerAddress, setPickerAddress] = useState<string>('Cargando dirección...')

  // Force Cyber Midnight theme (Dark Mode)
  useState(() => {
    document.documentElement.classList.add('dark')
  })

  // Geolocation Watcher
  useEffect(() => {
    if (!('geolocation' in navigator)) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const { userLocation, setUserLocation, setMapViewState } = useAppStore.getState()
        
        // Update store
        setUserLocation({ latitude, longitude })

        // Initial center on user (only if not already set or first run logic could be improved here, 
        // but checking if we just got a location and it's the first one is good)
        if (!userLocation) {
             setMapViewState({
               longitude,
               latitude,
               zoom: 15,
             })
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  // Fetch Restrooms (moved from ExploreScreen to persist data)
  useEffect(() => {
    // Only fetch if empty to avoid refetching? Or aggressive? 
    // Usually fetching once on app load is improved pattern.
    if (useAppStore.getState().restrooms.length > 0) return

    import('./lib/supabase').then(async ({ supabase }) => {
       // Assuming Restroom type is available or we cast later
       const { data, error } = await supabase
        .from('restrooms')
        .select('*')
        .limit(100)

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
  const fetchAddress = useCallback(async () => {
    if (currentScreen !== 'pin-picker') return
    
    const { longitude, latitude } = mapViewState
    setPickerAddress('Cargando...')

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&language=es`
      )
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        setPickerAddress(data.features[0].place_name)
      } else {
        setPickerAddress('Ubicación seleccionada')
      }
    } catch {
      setPickerAddress('Ubicación seleccionada')
    }
  }, [mapViewState, currentScreen])


  const handleAddClick = () => {
    setCurrentScreen('pin-picker')
    fetchAddress() // Fetch immediately on switch
  }

  const handlePinPickerBack = () => {
    setDraftLocation(null)
    setCurrentScreen('explore')
  }

  const handlePinPickerConfirm = () => {
    setIsAddModalOpen(true)
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
          useAppStore.getState().setMapViewState({
            longitude: restroom.longitude,
            latitude: restroom.latitude,
            zoom: 16,
          })
          // Ensure view mode is map? ExploreScreen listens to this changes?
          // ExploreScreen manages 'viewMode'. 
          // If we click a marker, we are already on map.
        }
  }, [restrooms])


  return (
    <div className="h-dvh w-screen overflow-hidden relative bg-gray-900">
      
      {/* Persistent Map Layer */}
      <div className="absolute inset-0 z-0">
          <MapboxMap 
             restrooms={filteredRestrooms} 
             mode={currentScreen} 
             onMoveEnd={fetchAddress}
             onMarkerClick={handleMarkerClick}
          />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
          {currentScreen === 'explore' && (
            <div className="w-full h-full">
               <ExploreScreen onAddClick={handleAddClick} />
            </div>
          )}

          {currentScreen === 'pin-picker' && (
            <div className="w-full h-full">
                <PinPickerScreen
                  address={pickerAddress}
                  onBack={handlePinPickerBack}
                  onConfirm={handlePinPickerConfirm}
                />
            </div>
          )}
      </div>

      <AddRestroomModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onSuccess={handleAddSuccess}
      />
      <Toaster richColors position="top-center" />
    </div>
  )
}

export default App
