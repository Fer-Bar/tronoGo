import { useCallback, useEffect, useState } from 'react'
import { IconPlus, IconCurrentLocation, IconList, IconMap } from '@tabler/icons-react'
import { MapboxMap } from '../map'
import { FilterBar } from './FilterBar'
import { RestroomDetail } from './RestroomDetail'
import { NearbyList } from './NearbyList'
import { useAppStore } from '../../lib/store'
import { supabase } from '../../lib/supabase'
import type { Restroom } from '../../lib/database.types'
import type { FilterState } from '../../lib/types'
import { calculateDistance } from '../../lib/utils'

export function ExploreScreen({ onAddClick }: { onAddClick: () => void }) {
  const { restrooms, setRestrooms, selectedRestroom, setSelectedRestroom, setMapViewState, userLocation } =
    useAppStore()
  
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  // const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null) // Removed
  
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    isAccessible: null,
    hasBabyChanger: null,
    hasPaper: null,
    hasSoap: null,
    isFree: null,
  })

  // Fetch restrooms on mount
  useEffect(() => {
    async function fetchRestrooms() {
      const { data, error } = await supabase
        .from('restrooms')
        .select('*')
        .limit(100)

      if (error) {
        console.error('Error fetching restrooms:', error)
        return
      }

      if (data) {
        setRestrooms(data as Restroom[])
      }
    }

    fetchRestrooms()
  }, [setRestrooms])

  // Get User Location - REMOVED (Handled in App.tsx)
  // useEffect(() => { ... }, [])

  const handleMarkerClick = useCallback(
    (id: string) => {
      const restroom = restrooms.find((r) => r.id === id)
      if (restroom) {
        setSelectedRestroom(restroom)
      }
      setViewMode('map') // Switch to map when picking from list or marker
    },
    [restrooms, setSelectedRestroom]
  )

  const handleCloseDetails = useCallback(() => {
    setSelectedRestroom(null)
  }, [setSelectedRestroom])

  const handleCenterOnUser = useCallback(() => {
    if (userLocation) {
        setMapViewState({
          longitude: userLocation.longitude,
          latitude: userLocation.latitude,
          zoom: 15,
        })
    } else {
        // Fallback or message if location not yet available
        alert("Obteniendo ubicación...")
    }
  }, [setMapViewState, userLocation])

  // Advanced Filtering Logic
  const filteredRestrooms = restrooms.filter((restroom) => {
    // 1. Accessibility
    if (filters.isAccessible && !restroom.amenities.includes('accessible')) {
      return false
    }

    // 2. Baby Changer
    if (filters.hasBabyChanger && !restroom.amenities.includes('baby_changing')) {
      return false
    }

    // New: Paper
    if (filters.hasPaper && !restroom.amenities.includes('paper')) {
      return false
    }

    // New: Soap
    if (filters.hasSoap && !restroom.amenities.includes('soap')) {
      return false
    }

    // 3. Price (Free / Paid)
    if (filters.isFree !== null && restroom.is_free !== filters.isFree) {
      return false
    }

    // 4. Type (Male/Female/Unisex) - OR logic for selected types
    if (filters.type.length > 0) {
      if (filters.type.length === 1 && filters.type.includes('unisex')) {
        return restroom.amenities.includes('unisex')
      }
      const isUnisex = restroom.amenities.includes('unisex')
      const matchesGender = filters.type.some(t => {
        if (t === 'unisex') return isUnisex
        if (t === 'male') return restroom.amenities.includes('male') || !isUnisex 
        if (t === 'female') return restroom.amenities.includes('female') || !isUnisex
        return false
      })
      
      if (!matchesGender) return false
    }

    return true
  }).sort((a, b) => {
    // Sort by distance if user location is known
    if (userLocation) {
        const distA = calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude)
        const distB = calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude)
        return distA - distB
    }
    return 0
  })

  return (
    <div className="relative h-full w-full bg-gray-100 dark:bg-gray-950">
      {/* Map - Full screen background */}
      <div className="absolute inset-0">
        <MapboxMap restrooms={filteredRestrooms} onMarkerClick={handleMarkerClick} />
      </div>

      {/* Filter Bar */}
      <FilterBar 
        filters={filters} 
        onFiltersChange={setFilters} 
        bathroomCount={filteredRestrooms.length} 
      />

      {/* Map Mode Toggle Button */}
      <div className="absolute top-[4.5rem] right-3 z-30">
          <button
            onClick={() => setViewMode(prev => prev === 'map' ? 'list' : 'map')}
            className="flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur border border-gray-200 dark:border-gray-800 rounded-full shadow-lg text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95"
          >
             {viewMode === 'map' ? (
                <>
                  <IconList className="size-4" /> Lista
                </>
             ) : (
                <>
                  <IconMap className="size-4" /> Mapa
                </>
             )}
          </button>
      </div>

      {/* FAB Buttons Container (Map Mode Only) */}
      {viewMode === 'map' && (
        <div className="absolute bottom-6 right-6 flex flex-col gap-3 items-end pointer-events-auto z-20">
          <button
            onClick={handleCenterOnUser}
            className="flex size-11 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-transform hover:scale-105 active:scale-95"
            aria-label="Center on my location"
          >
            <IconCurrentLocation size={22} />
          </button>
          <button
            onClick={onAddClick}
            className="flex size-14 items-center justify-center rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-600/30 transition-transform hover:scale-105 active:scale-95"
            aria-label="Add restroom"
          >
            <IconPlus size={32} />
          </button>
        </div>
      )}

      {/* Nearby List Overlay - Shows when viewMode is list */}
      {viewMode === 'list' && (
        <NearbyList 
            restrooms={filteredRestrooms}
            userLocation={userLocation}
            onRestroomSelect={(r) => handleMarkerClick(r.id)}
            onClose={() => setViewMode('map')}
        />
      )}

      {/* Restroom details bottom sheet (Map Mode Only OR when selected via list but switch happens above) */}
      <RestroomDetail
        restroom={selectedRestroom}
        isOpen={!!selectedRestroom}
        onClose={handleCloseDetails}
      />
    </div>
  )
}
