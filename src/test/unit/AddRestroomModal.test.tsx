import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AddRestroomModal } from '../../components/features/AddRestroomModal'
import type { ReactNode } from 'react'

// Hoist all variables accessed in mocks
const {
    mockInsert,
    mockSelect,
    mockSingle,
    mockAddRestroom,
    mockToastSuccess,
    mockDraftLocation,
    mockAuthStoreState
} = vi.hoisted(() => {
    return {
        mockInsert: vi.fn(),
        mockSelect: vi.fn(),
        mockSingle: vi.fn(),
        mockAddRestroom: vi.fn(),
        mockToastSuccess: vi.fn(),
        mockDraftLocation: {
            latitude: 10,
            longitude: 20,
            address: 'Test Address'
        },
        mockAuthStoreState: { isAdmin: false }
    }
})

// Setup Mock Supabase Chain (can be done here or in beforeEach, but defining return values on the spy works anywhere)
mockInsert.mockReturnValue({ select: mockSelect })
mockSelect.mockReturnValue({ single: mockSingle })

// Mock Modules
vi.mock('../../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            insert: mockInsert,
        })),
    }
}))

vi.mock('../../lib/store', () => ({
    useAppStore: () => ({
        draftLocation: mockDraftLocation,
        addRestroom: mockAddRestroom
    })
}))

vi.mock('../../lib/authStore', () => ({
    useAuthStore: () => ({
        isAdmin: mockAuthStoreState.isAdmin
    })
}))

vi.mock('sonner', () => ({
    toast: {
        success: mockToastSuccess,
        error: vi.fn(),
        loading: vi.fn()
    }
}))

vi.mock('../../utils/upload', () => ({
    uploadImageToR2: vi.fn().mockResolvedValue('https://example.com/photo.jpg')
}))

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>
    },
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>
}))

describe('AddRestroomModal', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockAuthStoreState.isAdmin = false // Reset

        // Setup successful Supabase response default
        mockSingle.mockResolvedValue({
            data: { id: '123', name: 'New Restroom', verified: false },
            error: null
        })
    })

    it('submits verified=false for non-admin users', async () => {
        mockAuthStoreState.isAdmin = false

        render(<AddRestroomModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />)

        const saveButton = screen.getByText('Guardar ubicación')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockInsert).toHaveBeenCalled()
        })

        const insertedData = mockInsert.mock.calls[0][0]
        expect(insertedData.verified).toBe(false)
        expect(mockToastSuccess).toHaveBeenCalledWith(expect.stringContaining('revisión'))
    })

    it('submits verified=true for admin users', async () => {
        mockAuthStoreState.isAdmin = true

        render(<AddRestroomModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />)

        const saveButton = screen.getByText('Guardar ubicación')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockInsert).toHaveBeenCalled()
        })

        const insertedData = mockInsert.mock.calls[0][0]
        expect(insertedData.verified).toBe(true)
        expect(mockToastSuccess).toHaveBeenCalledWith(expect.stringContaining('exitosamente'))
    })
})
