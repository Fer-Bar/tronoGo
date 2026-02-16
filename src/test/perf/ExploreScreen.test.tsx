import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ExploreScreen } from '../../components/features/ExploreScreen'
import * as utils from '../../lib/utils'

// 1. Mock the store first
vi.mock('../../lib/store', () => ({
  useAppStore: () => ({
    restrooms: [
      {
        id: '1',
        name: 'R1',
        latitude: 0,
        longitude: 0,
        amenities: [],
        verified: true,
        is_free: true
      }
    ],
    selectedRestroom: null,
    setSelectedRestroom: vi.fn(),
    setMapViewState: vi.fn(),
    userLocation: { latitude: 0, longitude: 0 },
    filters: {
      type: [],
      isAccessible: null,
      hasBabyChanger: null,
      hasPaper: null,
      hasSoap: null,
      hasSink: null,
      isFree: null
    },
    setFilters: vi.fn(),
  }),
}))

// 2. Mock auth store
vi.mock('../../lib/authStore', () => ({
  useAuthStore: (selector: unknown) => {
      // Mock selector behavior if passed
      if (typeof selector === 'function') {
          return (selector as (state: unknown) => unknown)({ user: null })
      }
      return { user: null }
  },
}))

// 3. Spy on the utils function
vi.mock('../../lib/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/utils')>()
  return {
    ...actual,
    filterAndSortRestrooms: vi.fn((a, b, c) => actual.filterAndSortRestrooms(a, b, c)),
  }
})

describe('ExploreScreen Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does NOT call filterAndSortRestrooms on render (receives props instead)', () => {
    render(
      <ExploreScreen
        filteredRestrooms={[]}
        onAddClick={() => {}}
        onFlyToUser={() => {}}
        onFlyToRestroom={() => {}}
      />
    )

    // Verify it was NOT called
    expect(utils.filterAndSortRestrooms).not.toHaveBeenCalled()
  })
})
