const LOCATION_STORAGE_KEY = 'trono_user_location'

export interface UserLocation {
    latitude: number
    longitude: number
}

/**
 * Retrieves the cached user location from localStorage
 */
export function getCachedLocation(): UserLocation | null {
    try {
        const stored = localStorage.getItem(LOCATION_STORAGE_KEY)
        if (!stored) return null

        const parsed = JSON.parse(stored) as UserLocation
        if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
            return parsed
        }
        return null
    } catch {
        return null
    }
}

/**
 * Saves the user location to localStorage
 */
export function setCachedLocation(location: UserLocation): void {
    try {
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location))
    } catch {
        // Silently fail if localStorage is not available
    }
}

/**
 * Starts watching the user's geolocation and calls the callback on updates.
 * Also caches the location to localStorage.
 * Returns a cleanup function to stop watching.
 */
export function initGeolocation(
    onLocationUpdate: (location: UserLocation) => void
): (() => void) | null {
    if (!('geolocation' in navigator)) {
        return null
    }

    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            const location: UserLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            }
            setCachedLocation(location)
            onLocationUpdate(location)
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
}
