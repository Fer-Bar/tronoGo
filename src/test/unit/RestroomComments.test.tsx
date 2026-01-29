
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RestroomComments } from '../../components/features/RestroomComments'
import React from 'react'

// Mock Dependencies
const { mockSupabase, mockSignIn, mockUser } = vi.hoisted(() => {
    return {
        mockSupabase: {
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        order: vi.fn(() => ({
                            limit: vi.fn().mockResolvedValue({ data: [], error: null })
                        }))
                    }))
                })),
                insert: vi.fn().mockResolvedValue({ error: null })
            })),
        },
        mockSignIn: vi.fn(),
        mockUser: { id: 'test-user', email: 'test@test.com' }
    }
})

vi.mock('../../lib/supabase', () => ({
    supabase: mockSupabase
}))

// Mock store with a simple implementation we can control
const mockUseAuthStore = vi.fn()
vi.mock('../../lib/authStore', () => ({
    useAuthStore: (selector: any) => selector({
        user: mockUser, // Default to logged in
        signInWithGoogle: mockSignIn
    })
}))

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}))

describe('RestroomComments Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders "Write Review" button', async () => {
        render(<RestroomComments restroomId="123" />)
        expect(await screen.findByText('¡Escribe una reseña!')).toBeInTheDocument()
    })

    it('opens modal when "Write Review" is clicked', async () => {
        render(<RestroomComments restroomId="123" />)
        
        const button = await screen.findByText('¡Escribe una reseña!')
        fireEvent.click(button)

        expect(await screen.findByText('Escribe tu reseña')).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Comparte tu experiencia/i)).toBeInTheDocument()
    })
})
