import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IconX, IconCheck, IconUser } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useAuthStore } from '../../lib/authStore'
import { supabase } from '../../lib/supabase'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const user = useAuthStore(state => state.user)
  const profile = useAuthStore(state => state.profile)
  const refreshSession = useAuthStore(state => state.refreshSession)
  
  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      // 1. Update Auth Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      if (authError) throw authError

      // 2. Update Public Profile Table
      const { error: profileError } = await supabase
        .from('profiles')
        // @ts-expect-error Supabase inference issue with partial update
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (profileError) throw profileError

      // 3. Refresh Local State
      await refreshSession()
      
      toast.success('Perfil actualizado correctamente')
      onClose()
    } catch (err) {
      console.error('Error updating profile:', err)
      toast.error('Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Editar Perfil</h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <IconX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Nombre Completo</label>
                <div className="relative">
                  <IconUser className="absolute left-4 top-3.5 text-gray-500 size-5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre..."
                    className="w-full bg-gray-800/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-gray-200 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all font-medium"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary-500 text-gray-950 font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary-400 disabled:opacity-50 transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                >
                  {loading ? 'Guardando...' : (
                    <>
                      <IconCheck className="size-4" />
                      Guardar
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
  )
}
