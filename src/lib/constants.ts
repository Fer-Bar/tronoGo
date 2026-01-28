// Mapbox configuration
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

// Map style - using a clean light style
export const MAP_STYLE = 'mapbox://styles/mapbox/navigation-night-v1'

// Default map center (Mexico City)
export const DEFAULT_CENTER = {
    longitude: -99.1332,
    latitude: 19.4326,
}

export const DEFAULT_ZOOM = 13

// Marker colors based on status/price
export const MARKER_COLORS = {
    free: '#22c55e',      // Green for free
    paid: '#3b82f6',      // Blue for paid
    closed: '#ef4444',    // Red for closed
    user: '#3b82f6',      // Blue for user location
} as const

// Filter options
export const FILTER_OPTIONS = [
    { id: 'all', label: 'All', icon: 'category' },
    { id: 'free', label: 'Gratis', icon: 'currency-off' },
    { id: 'accessible', label: 'Accesible', icon: 'wheelchair' },
    { id: 'rating', label: '4.0+', icon: 'star' },
] as const

// Restroom type labels (Spanish)
export const TYPE_LABELS: Record<string, { label: string; sublabel: string }> = {
    public: { label: 'Público', sublabel: 'Gratis' },
    commerce: { label: 'Comercio', sublabel: 'Pago' },
    restaurant: { label: 'Restaurante', sublabel: 'Clientes' },
    gas_station: { label: 'Gasolinera', sublabel: '' },
    other: { label: 'Otro', sublabel: '' },
}

// Amenity labels (Spanish)
export const AMENITY_LABELS: Record<string, string> = {
    accessible: 'Accesible',
    unisex: 'Unisex',
    baby_changing: 'Cambiador',
    paper: 'Papel',
    soap: 'Jabón',
    private: 'Privado',
    sink: 'Lavamanos',
}

// Icons for consistency across app
import {
    IconBuilding,
    IconBuildingStore,
    IconToolsKitchen2,
    IconGasStation,
    IconWheelchair,
    IconBabyCarriage,
    IconToiletPaper,
    IconDroplet,
    IconWash,
    IconGenderBigender,
    IconGenderAgender
} from '@tabler/icons-react'

export const TYPE_ICONS: Record<string, any> = {
    public: IconBuilding,
    commerce: IconBuildingStore,
    restaurant: IconToolsKitchen2,
    gas_station: IconGasStation,
    other: IconBuilding,
}

export const AMENITY_ICONS: Record<string, any> = {
    accessible: IconWheelchair,
    baby_changing: IconBabyCarriage,
    paper: IconToiletPaper,
    soap: IconDroplet,
    sink: IconWash,
    private: IconGenderBigender,
    unisex: IconGenderAgender,
}
