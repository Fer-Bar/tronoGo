import { useEffect, useState, useCallback } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../../lib/supabase'
import type { Database, TablesInsert } from '../../lib/database.types'
import { IconUser, IconSend, IconX } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useAuthStore } from '../../lib/authStore'
import { toast } from 'sonner'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'
import { StarRating } from '../ui'
import { motion, AnimatePresence } from 'framer-motion'

dayjs.extend(relativeTime)
dayjs.locale('es')

type Comment = Database['public']['Tables']['comments']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'avatar_url'> | null
}

interface RestroomCommentsProps {
  restroomId: string
  isWritingReview: boolean
  onCloseReview: () => void
}

export function RestroomComments({ restroomId, isWritingReview, onCloseReview }: RestroomCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [expanded, setExpanded] = useState(false)
  
  // Form State
  const [newComment, setNewComment] = useState('')
  const [rating, setRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  
  const user = useAuthStore(state => state.user)
  // signIn handled by parent/actions

  const fetchComments = useCallback(async () => {
    try {
      // Fetch one extra to check if there are more
      const limit = 3
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(full_name, avatar_url)')
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
        .select('*, profiles(full_name, avatar_url)')
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
    if (!user || rating === 0) {
        if (rating === 0) toast.error('Por favor califica con estrellas')
        return
    }

    setSubmitting(true)
    try {
        const commentData: TablesInsert<'comments'> = {
            restroom_id: restroomId,
            user_id: user.id,
            content: newComment.trim(),
            rating: rating
        }

        const { data, error } = await supabase
            .from('comments')
            // @ts-expect-error Supabase type inference failing for insert
            .insert(commentData)
            .select('*, profiles(full_name, avatar_url)')
            .single()

        if (error) throw error

        setNewComment('')
        setRating(0)
        onCloseReview()
        toast.success('Reseña publicada')
        
        if (data) {
            setComments(prev => [data as Comment, ...prev])
        }
    } catch (err) {
        console.error('Error submitting comment:', err)
        toast.error('Error al enviar reseña')
    } finally {
        setSubmitting(false)
    }
  }

  const handleCancel = () => {
      setNewComment('')
      setRating(0)
      onCloseReview()
  }

  if (loading && comments.length === 0) {
    return <div className="text-center text-gray-500 py-4">Cargando comentarios...</div>
  }

  return (
    <div className="space-y-6 relative">
        {/* Review Form Modal/Overlay - Using Portal */}
        {createPortal(
            <AnimatePresence>
                {isWritingReview && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                        onClick={handleCancel}
                        style={{ touchAction: 'none' }}
                    >
                         {/* Centered Modal */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()} 
                            className="bg-gray-900 border border-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Escribe tu reseña</h3>
                                <button onClick={handleCancel} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                                    <IconX size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="flex flex-col items-center gap-2 py-4 bg-gray-800/30 rounded-2xl border border-white/5">
                                    <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Tu calificación</span>
                                    <StarRating 
                                        value={rating} 
                                        onChange={setRating} 
                                        size={40}
                                        className="gap-3"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Comparte tu experiencia... ¿Qué tal la limpieza? ¿El precio?"
                                        className="w-full bg-gray-900/50 border border-white/10 rounded-xl p-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 resize-none h-32 text-base transition-all"
                                        disabled={submitting}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-5 py-2.5 rounded-xl font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                                        disabled={submitting}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={rating === 0 || submitting}
                                        className="bg-primary-500 text-gray-950 font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                                    >
                                        {submitting ? 'Publicando...' : (
                                            <>
                                                <IconSend className="size-4" />
                                                Publicar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>,
            document.body
        )}

      {comments.length === 0 ? (
        <div className="text-center py-8 bg-gray-900/50 rounded-2xl border border-white/5 border-dashed">
            <p className="text-gray-500 mb-2">Aún no hay reseñas</p>
            <p className="text-sm text-gray-600">Sé el primero en calificar este baño</p>
        </div>
      ) : (
        <div className="space-y-4">
            <div className="space-y-3">
                {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-900/50 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-start gap-3">
                    <div className="shrink-0">
                        {comment.profiles?.avatar_url ? (
                            <img 
                                src={comment.profiles.avatar_url} 
                                alt={comment.profiles.full_name || 'Usuario'} 
                                className="size-10 rounded-full object-cover bg-gray-800 ring-2 ring-gray-800"
                            />
                        ) : (
                            <div className="bg-gray-800 p-2 rounded-full">
                                <IconUser className="size-6 text-gray-500" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                            <div>
                                <h4 className="text-sm font-bold text-gray-200">
                                    {comment.profiles?.full_name || 'Usuario'}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {comment.rating ? (
                                        <StarRating value={comment.rating} size={14} readOnly />
                                    ) : (
                                        <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">Sin calificación</span>
                                    )}
                                    <span className="text-[10px] text-gray-500">•</span>
                                    <span className="text-[10px] text-gray-500">
                                        {dayjs(comment.created_at).fromNow()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {comment.content && (
                            <p className="text-sm text-gray-300 leading-relaxed break-words mt-2">{comment.content}</p>
                        )}
                    </div>
                    </div>
                </div>
                ))}
            </div>

            {(hasMore || (expanded && comments.length > 3)) && (
                <button 
                onClick={expanded ? () => { setExpanded(false); fetchComments(); } : fetchAllComments}
                className="w-full py-3 text-sm font-bold text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-xl transition-all"
                >
                {expanded ? 'Ver menos reseñas' : 'Cargar más reseñas'}
                </button>
            )}
        </div>
      )}
    </div>
  )
}
