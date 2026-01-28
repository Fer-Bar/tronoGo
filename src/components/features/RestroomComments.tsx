import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'
import { IconUser } from '@tabler/icons-react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'

dayjs.extend(relativeTime)
dayjs.locale('es')

type Comment = Database['public']['Tables']['comments']['Row']

interface RestroomCommentsProps {
  restroomId: string
}

export function RestroomComments({ restroomId }: RestroomCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const fetchComments = useCallback(async () => {
    try {
      // Fetch one extra to check if there are more
      const limit = 3
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('restroom_id', restroomId)
        .order('created_at', { ascending: false })
        .limit(limit + 1)

      if (error) throw error

      if (data) {
        setHasMore(data.length > limit)
        setComments(data.slice(0, limit))
      }
    } catch (err) {
      console.error('Error fetching comments:', err)
    } finally {
      setLoading(false)
    }
  }, [restroomId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const fetchAllComments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('restroom_id', restroomId)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        setComments(data)
        setHasMore(false)
        setExpanded(true)
      }
    } catch (err) {
      console.error('Error fetching all comments:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && comments.length === 0) {
    return <div className="text-center text-gray-500 py-4">Cargando comentarios...</div>
  }

  if (comments.length === 0) {
    return (
        <div className="bg-gray-800/40 p-4 rounded-xl border border-white/5 text-center">
            <p className="text-sm text-gray-500">Sé el primero en comentar sobre este baño.</p>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-800/40 p-3 rounded-xl border border-white/5">
            <div className="flex items-start gap-3">
              <div className="bg-gray-700/50 p-1.5 rounded-full shrink-0">
                <IconUser className="size-4 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-bold text-gray-300">Usuario</span>
                    <span className="text-[10px] text-gray-500">
                        {dayjs(comment.created_at).fromNow()}
                    </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed break-words">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show "See More" if there are more comments initially, OR if we are expanded (to potentially show "Show Less" - though simpler to just keep expanded or toggle) 
          The requirement adds "boton de ver mas". I'll implement "Ver todos" which loads everything.
      */}
      {(hasMore || (expanded && comments.length > 3)) && (
        <button 
          onClick={expanded ? () => { setExpanded(false); fetchComments(); } : fetchAllComments}
          className="w-full py-2 text-sm font-semibold text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors"
        >
          {expanded ? 'Ver menos' : 'Ver más comentarios'}
        </button>
      )}
    </div>
  )
}
