import { useState, useEffect } from 'react'
import { 
    IconArrowLeft, 
    IconLayoutDashboard, 
    IconToiletPaper, 
    IconMessage,
    IconTrash,
    IconEdit,
    IconSearch,
    IconX,
    IconCheck
} from '@tabler/icons-react'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../lib/store'
import type { Restroom } from '../../lib/database.types'

interface AdminScreenProps {
    onBack: () => void
}

type AdminTab = 'dashboard' | 'restrooms' | 'comments'

interface Comment {
    id: string
    created_at: string
    content: string
    rating: number | null
    restroom_id: string
    user_id: string
    profiles: {
        full_name: string | null
        avatar_url: string | null
    } | null
    restrooms: {
        name: string
    } | null
}

export function AdminScreen({ onBack }: AdminScreenProps) {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
    const { restrooms, setRestrooms } = useAppStore()
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [editingRestroom, setEditingRestroom] = useState<Restroom | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    // Fetch comments on mount
    useEffect(() => {
        async function fetchComments() {
            const { data, error } = await supabase
                .from('comments')
                .select(`
                    *,
                    profiles:user_id (full_name, avatar_url),
                    restrooms:restroom_id (name)
                `)
                .order('created_at', { ascending: false })

            if (!error && data) {
                setComments(data as Comment[])
            }
            setLoading(false)
        }
        fetchComments()
    }, [])

    // Delete restroom
    const handleDeleteRestroom = async (id: string) => {
        const { error } = await supabase.from('restrooms').delete().eq('id', id)
        if (!error) {
            setRestrooms(restrooms.filter(r => r.id !== id))
            setDeleteConfirm(null)
        }
    }

    // Update restroom
    const handleUpdateRestroom = async (restroom: Restroom) => {
        const updateData = {
            name: restroom.name,
            address: restroom.address,
            price: restroom.price,
            status: restroom.status,
            type: restroom.type,
            verified: restroom.verified,
        }
        
        // Workaround for Supabase-js type inference issue with 'never' type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const client = supabase as any
        const { error } = await client.from('restrooms').update(updateData).eq('id', restroom.id)

        if (!error) {
            setRestrooms(restrooms.map(r => r.id === restroom.id ? restroom : r))
            setEditingRestroom(null)
        }
    }

    // Delete comment
    const handleDeleteComment = async (id: string) => {
        const { error } = await supabase.from('comments').delete().eq('id', id)
        if (!error) {
            setComments(comments.filter(c => c.id !== id))
        }
    }

    // Filter restrooms by search
    const filteredRestrooms = restrooms.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.address?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const tabs = [
        { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: IconLayoutDashboard },
        { id: 'restrooms' as AdminTab, label: 'Banos', icon: IconToiletPaper },
        { id: 'comments' as AdminTab, label: 'Comentarios', icon: IconMessage },
    ]

    return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col pointer-events-auto">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    <IconArrowLeft className="size-5 text-white" />
                </button>
                <h1 className="text-xl font-bold text-white">Panel de Administracion</h1>
            </header>

            {/* Tab Navigation */}
            <nav className="bg-gray-800/50 border-b border-gray-700 px-4">
                <div className="flex gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                                activeTab === tab.id
                                    ? 'text-primary-400 border-primary-400'
                                    : 'text-gray-400 border-transparent hover:text-white'
                            }`}
                        >
                            <tab.icon className="size-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Content */}
            <main className="flex-1 overflow-auto p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="size-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Dashboard Tab */}
                        {activeTab === 'dashboard' && (
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                    <div className="flex items-center gap-3 mb-2">
                                        <IconToiletPaper className="size-6 text-primary-400" />
                                        <h3 className="text-lg font-semibold text-white">Banos</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{restrooms.length}</p>
                                    <p className="text-sm text-gray-400 mt-1">Total registrados</p>
                                </div>
                                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                    <div className="flex items-center gap-3 mb-2">
                                        <IconMessage className="size-6 text-blue-400" />
                                        <h3 className="text-lg font-semibold text-white">Comentarios</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{comments.length}</p>
                                    <p className="text-sm text-gray-400 mt-1">Total en el sistema</p>
                                </div>
                                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                    <div className="flex items-center gap-3 mb-2">
                                        <IconCheck className="size-6 text-green-400" />
                                        <h3 className="text-lg font-semibold text-white">Verificados</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-white">
                                        {restrooms.filter(r => r.verified).length}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">Banos verificados</p>
                                </div>
                            </div>
                        )}

                        {/* Restrooms Tab */}
                        {activeTab === 'restrooms' && (
                            <div className="space-y-4">
                                {/* Search */}
                                <div className="relative">
                                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar banos..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                {/* Restroom List */}
                                <div className="space-y-2">
                                    {filteredRestrooms.map(restroom => (
                                        <div
                                            key={restroom.id}
                                            className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-white truncate">{restroom.name}</h4>
                                                <p className="text-sm text-gray-400 truncate">{restroom.address || 'Sin direccion'}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                                        restroom.status === 'open' ? 'bg-green-500/20 text-green-400' :
                                                        restroom.status === 'closed' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                        {restroom.status}
                                                    </span>
                                                    {restroom.verified && (
                                                        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                                            Verificado
                                                        </span>
                                                    )}
                                                    <span className="text-xs px-2 py-0.5 rounded bg-gray-500/20 text-gray-300">
                                                        {restroom.is_free ? 'Gratis' : `$${restroom.price}`}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => setEditingRestroom(restroom)}
                                                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                                                >
                                                    <IconEdit className="size-4 text-white" />
                                                </button>
                                                {deleteConfirm === restroom.id ? (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleDeleteRestroom(restroom.id)}
                                                            className="p-2 rounded-lg bg-red-600 hover:bg-red-500 transition-colors"
                                                        >
                                                            <IconCheck className="size-4 text-white" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                                                        >
                                                            <IconX className="size-4 text-white" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirm(restroom.id)}
                                                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                                                    >
                                                        <IconTrash className="size-4 text-red-400" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments Tab */}
                        {activeTab === 'comments' && (
                            <div className="space-y-2">
                                {comments.length === 0 ? (
                                    <p className="text-gray-400 text-center py-8">No hay comentarios</p>
                                ) : (
                                    comments.map(comment => (
                                        <div
                                            key={comment.id}
                                            className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-white">
                                                            {comment.profiles?.full_name || 'Usuario'}
                                                        </span>
                                                        {comment.rating && (
                                                            <span className="text-xs text-yellow-400">
                                                                {'★'.repeat(comment.rating)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-300 text-sm">{comment.content}</p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        En: {comment.restrooms?.name || 'Bano eliminado'} | {new Date(comment.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors shrink-0"
                                                >
                                                    <IconTrash className="size-4 text-red-400" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Edit Restroom Modal */}
            {editingRestroom && (
                <EditRestroomModal
                    restroom={editingRestroom}
                    onClose={() => setEditingRestroom(null)}
                    onSave={handleUpdateRestroom}
                />
            )}
        </div>
    )
}

// Edit Restroom Modal Component
interface EditRestroomModalProps {
    restroom: Restroom
    onClose: () => void
    onSave: (restroom: Restroom) => void
}

function EditRestroomModal({ restroom, onClose, onSave }: EditRestroomModalProps) {
    const [form, setForm] = useState({ ...restroom })
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        await onSave(form)
        setSaving(false)
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl w-full max-w-md border border-gray-700">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Editar Bano</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
                        <IconX className="size-5 text-gray-400" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Direccion</label>
                        <input
                            type="text"
                            value={form.address || ''}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Precio</label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                min="0"
                                step="0.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value as Restroom['status'] })}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="open">Abierto</option>
                                <option value="closed">Cerrado</option>
                                <option value="unknown">Desconocido</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
                        <select
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value as Restroom['type'] })}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="public">Publico</option>
                            <option value="commerce">Comercio</option>
                            <option value="restaurant">Restaurante</option>
                            <option value="gas_station">Gasolinera</option>
                            <option value="other">Otro</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="verified"
                            checked={form.verified}
                            onChange={(e) => setForm({ ...form, verified: e.target.checked })}
                            className="size-4 rounded border-gray-600 bg-gray-700 text-primary-500 focus:ring-primary-500"
                        />
                        <label htmlFor="verified" className="text-sm text-gray-300">Verificado</label>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
