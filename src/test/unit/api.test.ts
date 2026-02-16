import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchRestrooms } from '../../lib/api'

// Mock Supabase with stable references
const { mockSupabase, selectMock } = vi.hoisted(() => {
    const select = vi.fn(() => ({
        limit: vi.fn().mockResolvedValue({ data: [], error: null })
    }))

    return {
        mockSupabase: {
            from: vi.fn(() => ({
                select
            }))
        },
        selectMock: select
    }
})

vi.mock('../../lib/supabase', () => ({
    supabase: mockSupabase
}))

describe('API Utils', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('fetchRestrooms calls correct endpoint and selects specific columns', async () => {
        await fetchRestrooms()

        expect(mockSupabase.from).toHaveBeenCalledWith('restrooms')

        // Verify select was called
        expect(selectMock).toHaveBeenCalledTimes(1)

        // Verify exact columns
        const expectedColumns = 'id, name, latitude, longitude, address, price, is_free, rating, vote_count, status, type, amenities, verified, opening_time, closing_time, description, photos'
        expect(selectMock).toHaveBeenCalledWith(expectedColumns)
    })
})
