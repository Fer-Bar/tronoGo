export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type RestroomStatus = 'open' | 'closed' | 'unknown'
export type RestroomType = 'public' | 'commerce' | 'restaurant' | 'gas_station' | 'other'
export type Amenity = 'accessible' | 'unisex' | 'baby_changing' | 'paper' | 'soap' | 'sink' | 'private' | 'male' | 'female'

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
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    latitude: number
                    longitude: number
                    address?: string | null
                    price: number
                    is_free?: boolean
                    rating: number
                    vote_count: number
                    status: RestroomStatus
                    type: RestroomType
                    amenities: Amenity[]
                    verified: boolean
                    opening_time?: string | null
                    closing_time?: string | null
                    description?: string | null
                    photos?: string[] | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    latitude?: number
                    longitude?: number
                    address?: string | null
                    price?: number
                    is_free?: boolean
                    rating?: number
                    vote_count?: number
                    status?: RestroomStatus
                    type?: RestroomType
                    amenities?: Amenity[]
                    verified?: boolean
                    opening_time?: string | null
                    closing_time?: string | null
                    description?: string | null
                    photos?: string[] | null
                }
            }
            bookmarks: {
                Row: {
                    id: string
                    created_at: string
                    user_id: string
                    restroom_id: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    user_id: string
                    restroom_id: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    user_id?: string
                    restroom_id?: string
                }
            }
            comments: {
                Row: {
                    id: string
                    created_at: string
                    user_id: string
                    restroom_id: string
                    content: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    user_id: string
                    restroom_id: string
                    content: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    user_id?: string
                    restroom_id?: string
                    content?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
