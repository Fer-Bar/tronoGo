import { clsx, type ClassValue } from 'clsx'
import type { Restroom } from './database.types'
import type { FilterState } from './types'

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
}

export function formatPrice(price: number): string {
    if (price === 0) return 'Gratis'
    return `${price.toFixed(0)} Bs`
}

export function formatRating(rating: number): string {
    return rating.toFixed(1)
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
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

export function filterAndSortRestrooms(
    restrooms: Restroom[],
    filters: FilterState,
    userLocation: { latitude: number; longitude: number } | null
): Restroom[] {
    return restrooms.filter((restroom) => {
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
}
