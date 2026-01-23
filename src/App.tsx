import { useState } from 'react'
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
    <div className="h-screen w-screen overflow-hidden">
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
