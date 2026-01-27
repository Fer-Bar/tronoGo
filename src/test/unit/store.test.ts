import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '../../lib/store'
import type { Restroom } from '../../lib/database.types'

describe('useAppStore', () => {
    beforeEach(() => {
        // Reset store to initial state
        useAppStore.setState({
            mapViewState: { longitude: -99.1332, latitude: 19.4326, zoom: 13 },
            selectedRestroom: null,
            userLocation: null,
            draftLocation: null,
            isAddModalOpen: false,
            isDarkMode: false,
            filters: {
                type: [],
                isAccessible: null,
                hasBabyChanger: null,
                hasPaper: null,
                hasSoap: null,
                hasSink: null,
                isFree: null,
            },
            restrooms: [],
        })
    })

    describe('mapViewState', () => {
        it('has default map view state', () => {
            const state = useAppStore.getState()
            expect(state.mapViewState.longitude).toBe(-99.1332)
            expect(state.mapViewState.latitude).toBe(19.4326)
            expect(state.mapViewState.zoom).toBe(13)
        })

        it('updates map view state', () => {
            useAppStore.getState().setMapViewState({
                longitude: -100,
                latitude: 20,
                zoom: 15,
            })
            const state = useAppStore.getState()
            expect(state.mapViewState.longitude).toBe(-100)
            expect(state.mapViewState.zoom).toBe(15)
        })
    })

    describe('selectedRestroom', () => {
        it('starts with null', () => {
            expect(useAppStore.getState().selectedRestroom).toBeNull()
        })

        it('sets and clears selected restroom', () => {
            const mockRestroom: Restroom = {
                id: 'test-1',
                created_at: '2024-01-01',
                name: 'Test Restroom',
                latitude: 19.4326,
                longitude: -99.1332,
                address: 'Test Address',
                price: 0,
                is_free: true,
                rating: 4.5,
                vote_count: 10,
                status: 'open',
                type: 'public',
                amenities: [],
                verified: true,
                opening_time: null,
                closing_time: null,
                description: null,
                photos: null,
            }

            useAppStore.getState().setSelectedRestroom(mockRestroom)
            expect(useAppStore.getState().selectedRestroom?.id).toBe('test-1')

            useAppStore.getState().setSelectedRestroom(null)
            expect(useAppStore.getState().selectedRestroom).toBeNull()
        })
    })

    describe('userLocation', () => {
        it('sets user location', () => {
            useAppStore.getState().setUserLocation({ latitude: 19.5, longitude: -99.2 })
            const location = useAppStore.getState().userLocation
            expect(location?.latitude).toBe(19.5)
            expect(location?.longitude).toBe(-99.2)
        })
    })

    describe('draftLocation', () => {
        it('sets draft location for add flow', () => {
            useAppStore.getState().setDraftLocation({
                latitude: 19.4,
                longitude: -99.1,
                address: 'Draft Address',
            })
            const draft = useAppStore.getState().draftLocation
            expect(draft?.address).toBe('Draft Address')
        })
    })

    describe('isAddModalOpen', () => {
        it('toggles add modal state', () => {
            expect(useAppStore.getState().isAddModalOpen).toBe(false)

            useAppStore.getState().setIsAddModalOpen(true)
            expect(useAppStore.getState().isAddModalOpen).toBe(true)

            useAppStore.getState().setIsAddModalOpen(false)
            expect(useAppStore.getState().isAddModalOpen).toBe(false)
        })
    })

    describe('isDarkMode', () => {
        it('toggles dark mode', () => {
            expect(useAppStore.getState().isDarkMode).toBe(false)
            useAppStore.getState().setIsDarkMode(true)
            expect(useAppStore.getState().isDarkMode).toBe(true)
        })
    })

    describe('filters', () => {
        it('updates filter state', () => {
            useAppStore.getState().setFilters({
                type: ['male'],
                isAccessible: true,
                hasBabyChanger: null,
                hasPaper: true,
                hasSoap: null,
                hasSink: null,
                isFree: true,
            })
            const filters = useAppStore.getState().filters
            expect(filters.type).toContain('male')
            expect(filters.isAccessible).toBe(true)
            expect(filters.isFree).toBe(true)
        })
    })

    describe('restrooms', () => {
        it('sets restrooms list', () => {
            const mockList: Restroom[] = [
                {
                    id: 'r1',
                    created_at: '2024-01-01',
                    name: 'Restroom 1',
                    latitude: 19.4,
                    longitude: -99.1,
                    address: null,
                    price: 0,
                    is_free: true,
                    rating: 4.0,
                    vote_count: 5,
                    status: 'open',
                    type: 'public',
                    amenities: [],
                    verified: false,
                    opening_time: null,
                    closing_time: null,
                    description: null,
                    photos: null,
                },
            ]

            useAppStore.getState().setRestrooms(mockList)
            expect(useAppStore.getState().restrooms).toHaveLength(1)
        })

        it('adds a single restroom', () => {
            const newRestroom: Restroom = {
                id: 'new-1',
                created_at: '2024-01-01',
                name: 'New Restroom',
                latitude: 19.5,
                longitude: -99.2,
                address: null,
                price: 5,
                is_free: false,
                rating: 0,
                vote_count: 0,
                status: 'open',
                type: 'commerce',
                amenities: ['accessible'],
                verified: false,
                opening_time: null,
                closing_time: null,
                description: null,
                photos: null,
            }

            useAppStore.getState().addRestroom(newRestroom)
            const restrooms = useAppStore.getState().restrooms
            expect(restrooms).toHaveLength(1)
            expect(restrooms[0].id).toBe('new-1')
        })
    })
})
