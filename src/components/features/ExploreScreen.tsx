import { useCallback, useState } from 'react'
import { IconPlus, IconCurrentLocation, IconList, IconMap } from '@tabler/icons-react'
import { FilterBar } from './FilterBar'
import { RestroomDetail } from './RestroomDetail'
import { NearbyList } from './NearbyList'
import { ProfileButton } from '../auth/ProfileButton'
import { useAppStore } from '../../lib/store'
import { useAuthStore } from '../../lib/authStore'
import { filterAndSortRestrooms } from '../../lib/utils'

interface ExploreScreenProps {
  onAddClick: () => void
  onFlyToUser?: () => void
  onFlyToRestroom?: (longitude: number, latitude: number) => void
  onAdminClick?: () => void
}

export function ExploreScreen({ onAddClick, onFlyToUser, onFlyToRestroom, onAdminClick }: ExploreScreenProps) {
  const { restrooms, selectedRestroom, setSelectedRestroom, setMapViewState, userLocation, filters, setFilters } =
    useAppStore()
  const user = useAuthStore(state => state.user)
  
  // View mode is still local UI state for switching list/map overlay buttons
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  
  const handleMarkerClick = useCallback(
    (id: string) => {
      const restroom = restrooms.find((r) => r.id === id)
      if (restroom) {
        setSelectedRestroom(restroom)
        // Use flyTo for smooth animation if available, otherwise fall back to state update
        if (onFlyToRestroom) {
          onFlyToRestroom(restroom.longitude, restroom.latitude)
        } else {
          setMapViewState({
            longitude: restroom.longitude,
            latitude: restroom.latitude,
            zoom: 16, 
          })
        }
      }
      setViewMode('map') 
    },
    [restrooms, setSelectedRestroom, setMapViewState, onFlyToRestroom]
  )

  const handleCloseDetails = useCallback(() => {
    setSelectedRestroom(null)
  }, [setSelectedRestroom])

  const handleCenterOnUser = useCallback(() => {
    if (!userLocation) return
    // Use flyTo callback if provided, otherwise fall back to direct state update
    if (onFlyToUser) {
      onFlyToUser()
    } else {
      setMapViewState({
        longitude: userLocation.longitude,
        latitude: userLocation.latitude,
        zoom: 15,
      })
    }
  }, [userLocation, onFlyToUser, setMapViewState])

  // Filter logic moved to App/utils - we just display the count based on raw or filtered?
  // Use filterAndSortRestrooms here just for the count passed to FilterBar? 
  // Yes, FilterBar needs count.
  // We can re-use the util.
  const filteredRestrooms = filterAndSortRestrooms(restrooms, filters, userLocation)

  return (
    <div className="relative h-full w-full bg-transparent pointer-events-none">
      {/* Map is now in App.tsx */}

      {/* Interactive Elements Wrapper */}
      <div className="contents pointer-events-auto">

      {/* Filter Bar */}
      <div className="pointer-events-auto">
        <FilterBar 
            filters={filters} 
            onFiltersChange={setFilters} 
            bathroomCount={filteredRestrooms.length} 
        />
      </div>

      {/* Profile Button - Bottom left for ergonomic mobile access */}
      <div className="absolute bottom-6 left-6 z-30 pointer-events-auto">
        <ProfileButton onAdminClick={onAdminClick} />
      </div>

      {/* Map Mode Toggle Button */}
      <div className="absolute top-[4.5rem] right-3 z-30 pointer-events-auto">
            <button
            onClick={() => {
              if (viewMode === 'map') {
                setSelectedRestroom(null)
                setViewMode('list')
              } else {
                setViewMode('map')
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur border border-gray-200 dark:border-gray-800 rounded-full shadow-lg text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95"
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

      {/* FAB Buttons Container */}
      {viewMode === 'map' && (
        <div className="absolute bottom-6 right-6 flex flex-col gap-3 items-end z-20 pointer-events-auto">
          <button
            onClick={handleCenterOnUser}
            className="flex size-11 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-transform hover:scale-105 active:scale-95"
            aria-label="Center on my location"
          >
            <IconCurrentLocation size={22} />
          </button>
          {user && (
            <button
              onClick={onAddClick}
              className="flex size-14 items-center justify-center rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-600/30 transition-transform hover:scale-105 active:scale-95"
              aria-label="Add restroom"
            >
              <IconPlus size={32} />
            </button>
          )}
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

      {/* Restroom details bottom sheet */}
      <div className="pointer-events-auto">
        <RestroomDetail
            restroom={selectedRestroom}
            isOpen={!!selectedRestroom}
            onClose={handleCloseDetails}
        />
      </div>
      
      </div>
    </div>
  )
}
