import { useEffect, useState, useCallback } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import type { Database, TablesInsert } from '../../lib/database.types'
import { IconUser, IconSend } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useAuthStore } from '../../lib/authStore'
import { toast } from 'sonner'
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
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  const user = useAuthStore(state => state.user)
  const signIn = useAuthStore(state => state.signInWithGoogle)

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setSubmitting(true)
    try {
        const commentData: TablesInsert<'comments'> = {
            restroom_id: restroomId,
            user_id: user.id,
            content: newComment.trim()
        }

        const { error } = await supabase
            .from('comments')
            // @ts-expect-error Supabase type inference failing for insert
            .insert(commentData)

        if (error) throw error

        setNewComment('')
        toast.success('Comentario agregado')
        fetchComments() // Refresh list
    } catch (err) {
        console.error('Error submitting comment:', err)
        toast.error('Error al enviar comentario')
    } finally {
        setSubmitting(false)
    }
  }

  if (loading && comments.length === 0) {
    return <div className="text-center text-gray-500 py-4">Cargando comentarios...</div>
  }

  return (
    <div className="space-y-6">
        {/* Comment Form */}
        <div className="bg-gray-800/40 p-4 rounded-xl border border-white/5">
            {user ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Comparte tu opinión sobre este baño..."
                        className="w-full bg-gray-900/50 border border-white/10 rounded-lg p-3 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 resize-none h-24"
                        disabled={submitting}
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!newComment.trim() || submitting}
                            className="bg-primary-500 text-gray-900 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting ? 'Enviando...' : (
                                <>
                                    <IconSend className="size-3" />
                                    Enviar
                                </>
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="text-center space-y-3">
                    <p className="text-sm text-gray-400">Inicia sesión para compartir tu opinión</p>
                    <button
                        onClick={signIn}
                        className="text-primary-400 text-sm font-semibold hover:text-primary-300 transition-colors"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            )}
        </div>

      {comments.length === 0 ? (
        <div className="text-center py-4">
            <p className="text-sm text-gray-500">Sé el primero en comentar sobre este baño.</p>
        </div>
      ) : (
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

            {(hasMore || (expanded && comments.length > 3)) && (
                <button 
                onClick={expanded ? () => { setExpanded(false); fetchComments(); } : fetchAllComments}
                className="w-full py-2 text-sm font-semibold text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors"
                >
                {expanded ? 'Ver menos' : 'Ver más comentarios'}
                </button>
            )}
        </div>
      )}
    </div>
  )
}
