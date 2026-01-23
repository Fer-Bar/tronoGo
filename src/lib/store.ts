import { create } from 'zustand'
import type { Restroom } from './database.types'
import type { FilterState } from './types'

interface MapViewState {
    longitude: number
    latitude: number
    zoom: number
}

interface DraftLocation {
    longitude: number
    latitude: number
    address: string | null
}

interface AppState {
    // Map state
    mapViewState: MapViewState
    setMapViewState: (state: MapViewState) => void

    // Selected restroom for details sheet
    selectedRestroom: Restroom | null
    setSelectedRestroom: (restroom: Restroom | null) => void

    // User location
    userLocation: { latitude: number; longitude: number } | null
    setUserLocation: (location: { latitude: number; longitude: number } | null) => void

    // Add flow - draft location
    draftLocation: DraftLocation | null
    setDraftLocation: (location: DraftLocation | null) => void

    // UI state
    isAddModalOpen: boolean
    setIsAddModalOpen: (open: boolean) => void

    // Dark mode
    isDarkMode: boolean
    setIsDarkMode: (dark: boolean) => void

    // Filters
    filters: FilterState
    setFilters: (filters: FilterState) => void

    // Restrooms data
    restrooms: Restroom[]
    setRestrooms: (restrooms: Restroom[]) => void
    addRestroom: (restroom: Restroom) => void
}

// Default to Mexico City center
const DEFAULT_VIEW_STATE: MapViewState = {
    longitude: -99.1332,
    latitude: 19.4326,
    zoom: 13,
}

const DEFAULT_FILTERS: FilterState = {
    type: [],
    isAccessible: null,
    hasBabyChanger: null,
    hasPaper: null,
    hasSoap: null,
    isFree: null,
}

export const useAppStore = create<AppState>((set) => ({
    mapViewState: DEFAULT_VIEW_STATE,
    setMapViewState: (mapViewState) => set({ mapViewState }),

    selectedRestroom: null,
    setSelectedRestroom: (selectedRestroom) => set({ selectedRestroom }),

    userLocation: null,
    setUserLocation: (userLocation) => set({ userLocation }),

    draftLocation: null,
    setDraftLocation: (draftLocation) => set({ draftLocation }),

    isAddModalOpen: false,
    setIsAddModalOpen: (isAddModalOpen) => set({ isAddModalOpen }),

    isDarkMode: false,
    setIsDarkMode: (isDarkMode) => set({ isDarkMode }),

    filters: DEFAULT_FILTERS,
    setFilters: (filters) => set({ filters }),

    restrooms: [],
    setRestrooms: (restrooms) => set({ restrooms }),
    addRestroom: (restroom) => set((state) => ({
        restrooms: [...state.restrooms, restroom]
    })),
}))

