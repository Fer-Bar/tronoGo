import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

// Mock child components to test screen switching logic (UC-01 & UC-02)
vi.mock('./components/features', () => ({
  ExploreScreen: ({ onAddClick }: { onAddClick: () => void }) => (
    <div data-testid="explore-screen">
      <h1>Explore Screen</h1>
      <button onClick={onAddClick} data-testid="add-btn">Add Restroom</button>
    </div>
  ),
  PinPickerScreen: ({ onConfirm }: { onConfirm: () => void }) => (
    <div data-testid="pin-picker-screen">
      <h1>Pin Picker Screen</h1>
      <button onClick={onConfirm} data-testid="confirm-location-btn">Confirm Location</button>
    </div>
  ),
  AddRestroomModal: ({ isOpen, onSuccess }: { isOpen: boolean; onSuccess: () => void }) => (
    isOpen ? (
      <div data-testid="add-restroom-modal">
        <h1>Add Restroom Modal</h1>
        <button onClick={onSuccess} data-testid="save-restroom-btn">Save</button>
      </div>
    ) : null
  )
}))

vi.mock('./components/map', () => ({
  MapboxMap: () => <div data-testid="mapbox-map">Mapbox Map</div>
}))

// Mock Supabase
vi.mock('./lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        limit: () => Promise.resolve({ data: [], error: null })
      })
    })
  }
}))

// Mock geolocation
vi.mock('./lib/geolocation', () => ({
  getCachedLocation: () => null,
  initGeolocation: () => () => {}
}))

describe('TronoGo App Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('UC-01: Renders Explore Screen and Map initially', async () => {
        render(<App />)
        
        expect(screen.getByTestId('mapbox-map')).toBeInTheDocument()
        expect(screen.getByTestId('explore-screen')).toBeInTheDocument()
        expect(screen.queryByTestId('pin-picker-screen')).not.toBeInTheDocument()
    })

    it('UC-02: Switches to Pin Picker when Add button is clicked', async () => {
        render(<App />)

        // User clicks Add in Explore Screen
        const addBtn = screen.getByTestId('add-btn')
        fireEvent.click(addBtn)

        // Should switch to Pin Picker
        expect(screen.getByTestId('pin-picker-screen')).toBeInTheDocument()
        expect(screen.queryByTestId('explore-screen')).not.toBeInTheDocument()
        
        // Map should still be visible
        expect(screen.getByTestId('mapbox-map')).toBeInTheDocument()
    })

    it('UC-02 (Cont): Opens Add Modal after confirming location', async () => {
        render(<App />)

        // Navigate to Pin Picker
        fireEvent.click(screen.getByTestId('add-btn'))

        // Confirm Location
        const confirmBtn = screen.getByTestId('confirm-location-btn')
        fireEvent.click(confirmBtn)

        // Modal should open
        expect(screen.getByTestId('add-restroom-modal')).toBeInTheDocument()
    })
    
    it('UC-02 (Cont): Returns to Explore Screen after saving', async () => {
         render(<App />)

        // Go to Modal
        fireEvent.click(screen.getByTestId('add-btn'))
        fireEvent.click(screen.getByTestId('confirm-location-btn'))

        // Click Save in Modal
        const saveBtn = screen.getByTestId('save-restroom-btn')
        fireEvent.click(saveBtn)

        // Should be back to Explore
        expect(screen.getByTestId('explore-screen')).toBeInTheDocument()
        expect(screen.queryByTestId('add-restroom-modal')).not.toBeInTheDocument()
    })
})
