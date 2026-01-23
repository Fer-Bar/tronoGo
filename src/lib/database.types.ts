export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type RestroomStatus = 'open' | 'closed' | 'unknown'
export type RestroomType = 'public' | 'commerce' | 'restaurant' | 'gas_station' | 'other'
export type Amenity = 'accessible' | 'unisex' | 'baby_changing' | 'paper' | 'soap' | 'private' | 'male' | 'female'

export interface Restroom {
    id: string
    created_at: string
    name: string
    latitude: number
    longitude: number
    address: string | null
    price: number
    is_free: boolean
    rating: number
    vote_count: number
    status: RestroomStatus
    type: RestroomType
    amenities: Amenity[]
    verified: boolean
    opening_time: string | null
    closing_time: string | null
    description: string | null
    photos: string[] | null
}

export interface Database {
    public: {
        Tables: {
            restrooms: {
                Row: Restroom
                Insert: Omit<Restroom, 'id' | 'created_at'>
                Update: Partial<Omit<Restroom, 'id' | 'created_at' | 'is_free'>>
            }
        }
    }
}
