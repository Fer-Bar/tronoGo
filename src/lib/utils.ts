import { clsx, type ClassValue } from 'clsx'
import type { Restroom } from './database.types'
import type { FilterState } from './types'

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

/**  
 * Formats distance for display with stable rounding to avoid UI jitter.
 * - Under 100m: rounds to nearest 10m
 * - 100m-1km: rounds to nearest 50m
 * - Over 1km: shows 1 decimal place km
 */
export function formatDistance(meters: number): string {
    if (meters < 100) {
        // Round to nearest 10m for short distances
        const rounded = Math.round(meters / 10) * 10
        return `${Math.max(10, rounded)}m`
    }
    if (meters < 1000) {
        // Round to nearest 50m for medium distances
        const rounded = Math.round(meters / 50) * 50
        return `${rounded}m`
    }
    // For km, use 1 decimal place with proper rounding
    const km = Math.round(meters / 100) / 10
    return `${km.toFixed(1)}km`
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
    const filtered = restrooms.filter((restroom) => {
        // Only show verified restrooms to users
        if (!restroom.verified) {
            return false
        }

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

        // New: Sink
        if (filters.hasSink && !restroom.amenities.includes('sink')) {
            return false
        }

        // 3. Price (Free / Paid)
        if (filters.isFree !== null && restroom.is_free !== filters.isFree) {
            return false
        }

        // 4. Type (Male/Female/Unisex) - OR logic for selected types
        if (filters.type.length > 0) {
            const matchesType = filters.type.some((t) => restroom.amenities.includes(t))
            if (!matchesType) return false
        }

        return true
    })

    if (userLocation) {
        return filtered
            .map((restroom) => ({
                restroom,
                distance: calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    restroom.latitude,
                    restroom.longitude
                ),
            }))
            .sort((a, b) => a.distance - b.distance)
            .map((item) => item.restroom)
    }

    return filtered
}

// --- Address Parsing Utilities ---

/**
 * Represents a parsed address with individual components.
 * Useful for displaying different levels of detail in various UI contexts.
 */
export interface ParsedAddress {
    street: string | null      // e.g., "123 Main St"
    city: string | null        // e.g., "Santa Cruz"
    state: string | null       // e.g., "SCZ" or "California"
    country: string | null     // e.g., "Bolivia"
    postalCode: string | null  // e.g., "10001"
    full: string               // The original full address string
}

/**
 * Parses a full address string into its components.
 * Assumes a common format like: "Street, City, State, Country" or similar.
 * This is a heuristic parser and may not work for all address formats.
 * 
 * @param fullAddress The full address string (e.g., from geocoding API)
 * @returns A ParsedAddress object with extracted components
 */
export function parseAddress(fullAddress: string | null | undefined): ParsedAddress {
    const defaultResult: ParsedAddress = {
        street: null,
        city: null,
        state: null,
        country: null,
        postalCode: null,
        full: fullAddress || '',
    }

    if (!fullAddress) return defaultResult

    // Split by comma and trim whitespace
    const parts = fullAddress.split(',').map(p => p.trim()).filter(Boolean)

    if (parts.length === 0) return defaultResult

    // Common patterns:
    // 1 part:  "City" or "Street"
    // 2 parts: "Street, City"
    // 3 parts: "Street, City, Country" or "Street, City, State"
    // 4+ parts: "Street, City, State, Country" (and possibly more)

    if (parts.length >= 1) {
        defaultResult.street = parts[0]
    }
    if (parts.length >= 2) {
        defaultResult.city = parts[1]
    }
    if (parts.length >= 3) {
        defaultResult.state = parts[2]
    }
    if (parts.length >= 4) {
        defaultResult.country = parts[3]
    }
    // Postal code often embedded with city or state, not extracted here.

    return defaultResult
}

/**
 * Formats an address for short display (typically "Street, City").
 * Falls back to the full address if parsing yields insufficient parts.
 * 
 * @param fullAddress The full address string
 * @param fallback Text to show if address is empty
 * @returns A short formatted address string
 */
export function formatShortAddress(fullAddress: string | null | undefined, fallback = 'Sin dirección'): string {
    const parsed = parseAddress(fullAddress)

    if (parsed.street && parsed.city) {
        return `${parsed.street}, ${parsed.city}`
    }
    if (parsed.street) {
        return parsed.street
    }
    if (parsed.full) {
        return parsed.full
    }
    return fallback
}

