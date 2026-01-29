import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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
vi.mock('../../lib/authStore', () => ({
    useAuthStore: (selector: (state: { user: any; signInWithGoogle: any }) => any) => selector({
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

// Mock createPortal since it's not supported in standard JSDOM render without a container usually,
// but testing-library handles it ok. However, defining it ensures no issues.
// Actually standard JSDOM supports it.

// Mock framer-motion to avoid animation delays in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}))

describe('RestroomComments Component', () => {
    const defaultProps = {
        restroomId: '123',
        isWritingReview: false,
        onCloseReview: vi.fn()
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders empty state when no comments', async () => {
        render(<RestroomComments {...defaultProps} />)
        expect(await screen.findByText('Aún no hay reseñas')).toBeInTheDocument()
    })

    it('renders modal when isWritingReview is true', async () => {
        render(<RestroomComments {...defaultProps} isWritingReview={true} />)
        expect(await screen.findByText("Escribe tu reseña")).toBeInTheDocument()
    })
})
