import { describe, it, expect } from 'vitest'
import {
    formatDistance,
    formatPrice,
    formatRating,
    calculateDistance,
    filterAndSortRestrooms,
    cn,
} from '../../lib/utils'
import type { Restroom } from '../../lib/database.types'
import type { FilterState } from '../../lib/types'

describe('cn (classnames utility)', () => {
    it('merges class strings', () => {
        expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('handles conditional classes', () => {
        const showHidden = false
        const showVisible = true
        expect(cn('base', showHidden && 'hidden', showVisible && 'visible')).toBe('base visible')
    })
})

describe('formatDistance', () => {
    it('formats meters under 1000 as meters', () => {
        expect(formatDistance(500)).toBe('500m')
        expect(formatDistance(999)).toBe('999m')
    })

    it('formats 1000+ meters as kilometers', () => {
        expect(formatDistance(1000)).toBe('1.0km')
        expect(formatDistance(1500)).toBe('1.5km')
        expect(formatDistance(2345)).toBe('2.3km')
    })

    it('rounds meters to whole numbers', () => {
        expect(formatDistance(123.7)).toBe('124m')
    })
})

describe('formatPrice', () => {
    it('returns "Gratis" for free (0)', () => {
        expect(formatPrice(0)).toBe('Gratis')
    })

    it('formats price with Bs suffix', () => {
        expect(formatPrice(5)).toBe('5 Bs')
        expect(formatPrice(10.5)).toBe('11 Bs') // Rounds
    })
})

describe('formatRating', () => {
    it('formats rating to 1 decimal place', () => {
        expect(formatRating(4.567)).toBe('4.6')
        expect(formatRating(3)).toBe('3.0')
    })
})

describe('calculateDistance (Haversine)', () => {
    it('returns 0 for same coordinates', () => {
        expect(calculateDistance(19.4326, -99.1332, 19.4326, -99.1332)).toBe(0)
    })

    it('calculates distance between two known points', () => {
        // Approx 1km apart in Mexico City
        const dist = calculateDistance(19.4326, -99.1332, 19.4416, -99.1332)
        expect(dist).toBeGreaterThan(900)
        expect(dist).toBeLessThan(1100)
    })
})

describe('filterAndSortRestrooms', () => {
    const mockRestrooms: Restroom[] = [
        {
            id: '1',
            created_at: '2024-01-01',
            name: 'Free Accessible',
            latitude: 19.432,
            longitude: -99.133,
            address: null,
            price: 0,
            is_free: true,
            rating: 4.5,
            vote_count: 10,
            status: 'open',
            type: 'public',
            amenities: ['accessible', 'paper'],
            verified: true,
            opening_time: null,
            closing_time: null,
            description: null,
            photos: null,
        },
        {
            id: '2',
            created_at: '2024-01-01',
            name: 'Paid Baby Changer',
            latitude: 19.430,
            longitude: -99.130,
            address: null,
            price: 5,
            is_free: false,
            rating: 3.0,
            vote_count: 5,
            status: 'open',
            type: 'commerce',
            amenities: ['baby_changing', 'soap'],
            verified: false,
            opening_time: null,
            closing_time: null,
            description: null,
            photos: null,
        },
    ]

    const defaultFilters: FilterState = {
        type: [],
        isAccessible: null,
        hasBabyChanger: null,
        hasPaper: null,
        hasSoap: null,
        hasSink: null,
        isFree: null,
    }

    it('returns all restrooms with no filters', () => {
        const result = filterAndSortRestrooms(mockRestrooms, defaultFilters, null)
        expect(result).toHaveLength(2)
    })

    it('filters by accessibility', () => {
        const filters = { ...defaultFilters, isAccessible: true }
        const result = filterAndSortRestrooms(mockRestrooms, filters, null)
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Free Accessible')
    })

    it('filters by baby changer', () => {
        const filters = { ...defaultFilters, hasBabyChanger: true }
        const result = filterAndSortRestrooms(mockRestrooms, filters, null)
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Paid Baby Changer')
    })

    it('filters by free/paid', () => {
        const freeFilters = { ...defaultFilters, isFree: true }
        expect(filterAndSortRestrooms(mockRestrooms, freeFilters, null)).toHaveLength(1)

        const paidFilters = { ...defaultFilters, isFree: false }
        expect(filterAndSortRestrooms(mockRestrooms, paidFilters, null)).toHaveLength(1)
    })

    it('filters by paper amenity', () => {
        const filters = { ...defaultFilters, hasPaper: true }
        const result = filterAndSortRestrooms(mockRestrooms, filters, null)
        expect(result).toHaveLength(1)
        expect(result[0].amenities).toContain('paper')
    })

    it('sorts by distance when user location provided', () => {
        const userLocation = { latitude: 19.429, longitude: -99.129 }
        const result = filterAndSortRestrooms(mockRestrooms, defaultFilters, userLocation)
        // Second restroom is closer to this location
        expect(result[0].name).toBe('Paid Baby Changer')
    })
})
