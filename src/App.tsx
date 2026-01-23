import { useState, useEffect } from 'react'
import { ExploreScreen, PinPickerScreen, AddRestroomModal } from './components/features'
import { useAppStore } from './lib/store'

type Screen = 'explore' | 'pin-picker'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('explore')
  const { isAddModalOpen, setIsAddModalOpen, setDraftLocation } = useAppStore()

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

  const handleAddClick = () => {
    setCurrentScreen('pin-picker')
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

  return (
    <div className="h-dvh w-screen overflow-hidden">
      {currentScreen === 'explore' && (
        <ExploreScreen onAddClick={handleAddClick} />
      )}

      {currentScreen === 'pin-picker' && (
        <PinPickerScreen
          onBack={handlePinPickerBack}
          onConfirm={handlePinPickerConfirm}
        />
      )}

      <AddRestroomModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onSuccess={handleAddSuccess}
      />
    </div>
  )
}

export default App
