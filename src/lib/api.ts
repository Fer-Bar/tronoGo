import { supabase } from './supabase'

export async function fetchRestrooms() {
    return await supabase
        .from('restrooms')
        .select(
            'id, name, latitude, longitude, address, price, is_free, rating, vote_count, status, type, amenities, verified, opening_time, closing_time, description, photos'
        )
        .limit(100)
}
