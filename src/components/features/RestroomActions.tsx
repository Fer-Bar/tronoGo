import { IconNavigation, IconBookmark, IconMessagePlus } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useAuthStore } from '../../lib/authStore'
import { supabase } from '../../lib/supabase'
import type { Restroom, TablesInsert } from '../../lib/database.types'
import { useState, useEffect } from 'react'

interface RestroomActionsProps {
  restroom: Restroom
  onWriteReview: () => void
}

export function RestroomActions({ restroom, onWriteReview }: RestroomActionsProps) {
  const user = useAuthStore(state => state.user)
  const signIn = useAuthStore(state => state.signInWithGoogle)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch initial bookmark status
  useEffect(() => {
    if (!user) {
      setIsBookmarked(false)
      return
    }

    const checkBookmark = async () => {
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('restroom_id', restroom.id)
          .maybeSingle()

        if (!error && data) {
          setIsBookmarked(true)
        } else {
          setIsBookmarked(false)
        }
      } catch (err) {
        console.error('Error checking bookmark:', err)
      }
    }

    checkBookmark()
  }, [user, restroom.id])

  const openGoogleMaps = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `https://www.google.com/maps/dir/?api=1&destination=${restroom.latitude},${restroom.longitude}&travelmode=walking`
    window.open(url, "_blank")
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      toast.error('Debes iniciar sesión para guardar favoritos')
      return
    }

    if (loading) return
    setLoading(true)

    // Optimistic update
    const previousState = isBookmarked
    setIsBookmarked(!previousState)

    try {
      if (previousState) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('restroom_id', restroom.id)
        
        if (error) throw error
        toast.success('Eliminado de favoritos')
      } else {
        // Add bookmark
        const bookmarkData: TablesInsert<'bookmarks'> = {
          user_id: user.id,
          restroom_id: restroom.id
        }
        
        const { error } = await supabase
          .from('bookmarks')
          // @ts-expect-error Supabase type inference failing for insert
          .insert(bookmarkData)
          .select()
          .single()
        
        if (error) throw error
        toast.success('Guardado en favoritos')
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err)
      toast.error('Error al actualizar favoritos')
      setIsBookmarked(previousState) // Revert on error
    } finally {
      setLoading(false)
    }
  }

  const handleReviewClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!user) {
          signIn()
          return
      }
      onWriteReview()
  }
  
  return (
    <div className="flex items-center gap-3 w-full">
      <button 
        onClick={openGoogleMaps}
        className="flex-1 h-12 md:h-10 bg-primary-500 hover:bg-primary-400 text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 cursor-pointer"
      >
        <IconNavigation className="size-5 md:size-4" />
        <span className="text-sm md:text-xs">Ir Ahora</span>
      </button>
      
      <button 
        onClick={handleBookmark}
        disabled={loading}
        className={`h-12 md:h-10 w-12 md:w-10 flex items-center justify-center rounded-xl border transition-colors cursor-pointer disabled:opacity-50 ${
            isBookmarked 
                ? 'bg-primary-500/20 border-primary-500/50 text-primary-400' 
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
        }`}
      >
        <IconBookmark className={`size-5 md:size-4 ${isBookmarked ? 'fill-current' : ''}`} />
      </button>
      
      <button 
        onClick={handleReviewClick}
        className="h-12 md:h-10 w-12 md:w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
      >
        <IconMessagePlus className="size-5 md:size-4" />
      </button>
    </div>
  )
}
