
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StarRating } from '../../components/ui/StarRating'
import React from 'react'

describe('StarRating Component', () => {
    it('renders correct number of stars', () => {
        render(<StarRating value={0} />)
        // Should have 5 buttons
        const startButtons = screen.getAllByRole('button')
        expect(startButtons).toHaveLength(5)
    })

    it('renders correct value (filled stars)', () => {
        // We can't visually test "filled" easily without custom matchers or checking classes
        // But we can check calls if it were a controlled component, or snapshot
        const { container } = render(<StarRating value={3} />)
        // Check if classes related to filled state are present
        const filledStars = container.querySelectorAll('.text-yellow-400')
        // Typically value 3 means stars 1, 2, 3 are filled. 
        // Note: IconStarFilled has text-yellow-400, IconStar has text-gray-600 logic.
        // Let's assume implementation details: 
        // 5 buttons total. 3 Should have StarFilled (yellow), 2 Should have Star (gray).
        expect(filledStars.length).toBeGreaterThanOrEqual(3) 
    })

    it('triggers onChange when clicked', () => {
        const handleChange = vi.fn()
        render(<StarRating value={0} onChange={handleChange} />)
        
        const stars = screen.getAllByRole('button')
        // Click 4th star (index 3)
        fireEvent.click(stars[3])
        
        expect(handleChange).toHaveBeenCalledWith(4)
    })

    it('does not trigger onChange when readOnly', () => {
        const handleChange = vi.fn()
        render(<StarRating value={0} onChange={handleChange} readOnly />)
        
        const stars = screen.getAllByRole('button')
        fireEvent.click(stars[3])
        
        expect(handleChange).not.toHaveBeenCalled()
    })

    it('disables buttons when readOnly', () => {
        render(<StarRating value={3} readOnly />)
        const stars = screen.getAllByRole('button')
        stars.forEach(star => {
            expect(star).toBeDisabled()
        })
    })
})
