const LOCATION_STORAGE_KEY = 'trono_user_location'

// Minimum distance change (in meters) to consider a position update significant
const MIN_MOVEMENT_THRESHOLD = 10 // meters

export interface UserLocation {
    latitude: number
    longitude: number
    accuracy?: number  // GPS accuracy in meters
    timestamp?: number // When this location was captured
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
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
function haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
}

/**
 * Checks if a new position is significantly different from the previous one.
 * This filters out GPS jitter (small random variations when not moving).
 */
function isSignificantMovement(
    prev: UserLocation | null,
    next: UserLocation,
    threshold: number = MIN_MOVEMENT_THRESHOLD
): boolean {
    if (!prev) return true // No previous location, always accept

    const distance = haversineDistance(
        prev.latitude,
        prev.longitude,
        next.latitude,
        next.longitude
    )

    // Accept the new position if:
    // 1. Movement is greater than threshold
    // 2. OR new position has significantly better accuracy (more than 2x better)
    const accuracyImproved = !!(
        next.accuracy && prev.accuracy &&
        next.accuracy < prev.accuracy * 0.5
    )

    return distance >= threshold || accuracyImproved
}

/**
 * Starts watching the user's geolocation and calls the callback on updates.
 * Filters out GPS jitter to provide stable location updates.
 * Also caches the location to localStorage.
 * Returns a cleanup function to stop watching.
 */
export function initGeolocation(
    onLocationUpdate: (location: UserLocation) => void
): (() => void) | null {
    if (!('geolocation' in navigator)) {
        return null
    }

    let lastLocation: UserLocation | null = getCachedLocation()

    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            const newLocation: UserLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp,
            }

            // Only update if movement is significant (filters GPS jitter)
            if (isSignificantMovement(lastLocation, newLocation)) {
                lastLocation = newLocation
                setCachedLocation(newLocation)
                onLocationUpdate(newLocation)
            }
        },
        (error) => {
            console.error('Geolocation error:', error)
        },
        {
            enableHighAccuracy: true,
            // Maximum age of cached position (5 seconds)
            maximumAge: 5000,
            // Timeout for getting position (10 seconds)
            timeout: 10000,
        }
    )

    return () => navigator.geolocation.clearWatch(watchId)
}
