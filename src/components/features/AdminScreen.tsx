import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { 
    IconArrowLeft, 
    IconLayoutDashboard, 
    IconToiletPaper, 
    IconTrash,
    IconSearch,
    IconX,
    IconCheck,
    IconChevronDown,
    IconChevronUp,
    IconPhotoPlus,
    IconGenderMale,
    IconGenderFemale,
    IconGenderBigender,
    IconStar,
    IconClock,
    IconAlertCircle,
    IconMapPin
} from '@tabler/icons-react'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../lib/store'
import { cn } from '../../lib/utils'
import { uploadImageToR2 } from '../../utils/upload'
import type { Restroom, Amenity, RestroomType } from '../../lib/database.types'
import { TYPE_ICONS, AMENITY_ICONS } from '../../lib/constants'

interface AdminScreenProps {
    onBack: () => void
    onPickLocation: () => void
}

type FilterType = 'all' | 'verified' | 'pending'

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
}

const RESTROOM_TYPES: { id: RestroomType; label: string; icon: React.ReactNode }[] = [
    { id: 'public', label: 'Publico', icon: <TYPE_ICONS.public size={20} /> },
    { id: 'commerce', label: 'Comercio', icon: <TYPE_ICONS.commerce size={20} /> },
    { id: 'restaurant', label: 'Comida', icon: <TYPE_ICONS.restaurant size={20} /> },
    { id: 'gas_station', label: 'Gasolinera', icon: <TYPE_ICONS.gas_station size={20} /> },
]

const AMENITIES: { id: Amenity; label: string; icon: React.ReactNode }[] = [
    { id: 'accessible', label: 'Accesible', icon: <AMENITY_ICONS.accessible size={16} /> },
    { id: 'baby_changing', label: 'Cambiador', icon: <AMENITY_ICONS.baby_changing size={16} /> },
    { id: 'paper', label: 'Papel', icon: <AMENITY_ICONS.paper size={16} /> },
    { id: 'soap', label: 'Jabon', icon: <AMENITY_ICONS.soap size={16} /> },
    { id: 'sink', label: 'Lavamanos', icon: <AMENITY_ICONS.sink size={16} /> },
    { id: 'private', label: 'Privado', icon: <AMENITY_ICONS.private size={16} /> },
]

export function AdminScreen({ onBack, onPickLocation }: AdminScreenProps) {
    const [activeView, setActiveView] = useState<'dashboard' | 'restrooms'>('dashboard')
    const { restrooms, setRestrooms } = useAppStore()
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<FilterType>('all')
    const [expandedRestroom, setExpandedRestroom] = useState<string | null>(null)
    const [editingRestroom, setEditingRestroom] = useState<Restroom | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    // Fetch comments on mount
    useEffect(() => {
        async function fetchComments() {
            const { data, error } = await supabase
                .from('comments')
                .select(`
                    id, created_at, content, rating, restroom_id, user_id,
                    profiles:user_id (full_name, avatar_url)
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
            toast.success('Baño eliminado')
        } else {
            toast.error('Error al eliminar')
        }
    }

    // Delete comment
    const handleDeleteComment = async (id: string) => {
        const { error } = await supabase.from('comments').delete().eq('id', id)
        if (!error) {
            setComments(comments.filter(c => c.id !== id))
            toast.success('Comentario eliminado')
        }
    }

    // Filter restrooms
    const filteredRestrooms = useMemo(() => restrooms.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.address?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filterType === 'all' ||
            (filterType === 'verified' && r.verified) ||
            (filterType === 'pending' && !r.verified)
        return matchesSearch && matchesFilter
    }), [restrooms, searchQuery, filterType])

    // Get comments for a specific restroom
    const getRestroomComments = (restroomId: string) => 
        comments.filter(c => c.restroom_id === restroomId)

    // Stats
    const stats = {
        total: restrooms.length,
        verified: restrooms.filter(r => r.verified).length,
        pending: restrooms.filter(r => !r.verified).length,
        comments: comments.length,
    }

    // Dashboard card click handler
    const handleStatClick = (filter: FilterType) => {
        setFilterType(filter)
        setActiveView('restrooms')
    }

    return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col pointer-events-auto">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-4 shrink-0">
                <button
                    onClick={activeView === 'dashboard' ? onBack : () => setActiveView('dashboard')}
                    className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    <IconArrowLeft className="size-5 text-white" />
                </button>
                <h1 className="text-xl font-bold text-white">
                    {activeView === 'dashboard' ? 'Panel de Administracion' : 'Gestion de Baños'}
                </h1>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-auto p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="size-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Dashboard View */}
                        {activeView === 'dashboard' && (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <button
                                    onClick={() => handleStatClick('all')}
                                    className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-primary-500 transition-colors text-left group"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <IconToiletPaper className="size-6 text-primary-400" />
                                        <h3 className="text-lg font-semibold text-white">Total Baños</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                                    <p className="text-sm text-gray-400 mt-1 group-hover:text-primary-400 transition-colors">Ver todos →</p>
                                </button>

                                <button
                                    onClick={() => handleStatClick('verified')}
                                    className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-colors text-left group"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <IconCheck className="size-6 text-green-400" />
                                        <h3 className="text-lg font-semibold text-white">Verificados</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{stats.verified}</p>
                                    <p className="text-sm text-gray-400 mt-1 group-hover:text-green-400 transition-colors">Ver verificados →</p>
                                </button>

                                <button
                                    onClick={() => handleStatClick('pending')}
                                    className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-amber-500 transition-colors text-left group"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <IconAlertCircle className="size-6 text-amber-400" />
                                        <h3 className="text-lg font-semibold text-white">Pendientes</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{stats.pending}</p>
                                    <p className="text-sm text-gray-400 mt-1 group-hover:text-amber-400 transition-colors">Revisar →</p>
                                </button>

                                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                    <div className="flex items-center gap-3 mb-2">
                                        <IconLayoutDashboard className="size-6 text-blue-400" />
                                        <h3 className="text-lg font-semibold text-white">Comentarios</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{stats.comments}</p>
                                    <p className="text-sm text-gray-400 mt-1">En el sistema</p>
                                </div>
                            </div>
                        )}

                        {/* Restrooms View */}
                        {activeView === 'restrooms' && (
                            <div className="space-y-4">
                                {/* Search and Filter */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar baños..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        {(['all', 'verified', 'pending'] as FilterType[]).map(filter => (
                                            <button
                                                key={filter}
                                                onClick={() => setFilterType(filter)}
                                                className={cn(
                                                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                                    filterType === filter
                                                        ? 'bg-primary-600 text-white'
                                                        : 'bg-gray-800 text-gray-400 hover:text-white'
                                                )}
                                            >
                                                {filter === 'all' ? 'Todos' : filter === 'verified' ? 'Verificados' : 'Pendientes'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Restroom List */}
                                <div className="space-y-3">
                                    {filteredRestrooms.length === 0 ? (
                                        <p className="text-gray-400 text-center py-8">No se encontraron baños</p>
                                    ) : (
                                        filteredRestrooms.map(restroom => {
                                            const restroomComments = getRestroomComments(restroom.id)
                                            const isExpanded = expandedRestroom === restroom.id

                                            return (
                                                <div
                                                    key={restroom.id}
                                                    className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden"
                                                >
                                                    {/* Restroom Header */}
                                                    <div className="p-4 flex items-center gap-4">
                                                        {/* Photo thumbnail */}
                                                        <div className="size-16 rounded-lg bg-gray-700 overflow-hidden shrink-0">
                                                            {restroom.photos?.[0] ? (
                                                                <img
                                                                    src={restroom.photos[0]}
                                                                    alt={restroom.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <IconToiletPaper className="size-6 text-gray-500" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-white truncate">{restroom.name}</h4>
                                                            <p className="text-sm text-gray-400 truncate">{restroom.address || 'Sin direccion'}</p>
                                                            <div className="flex flex-wrap gap-2 mt-1.5">
                                                                <span className={cn(
                                                                    'text-xs px-2 py-0.5 rounded',
                                                                    restroom.verified 
                                                                        ? 'bg-green-500/20 text-green-400'
                                                                        : 'bg-amber-500/20 text-amber-400'
                                                                )}>
                                                                    {restroom.verified ? 'Verificado' : 'Pendiente'}
                                                                </span>
                                                                <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                                                                    {restroom.is_free ? 'Gratis' : `$${restroom.price}`}
                                                                </span>
                                                                {restroomComments.length > 0 && (
                                                                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                                                        {restroomComments.length} comentario{restroomComments.length > 1 ? 's' : ''}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex gap-2 items-center">
                                                            <button
                                                                onClick={() => setEditingRestroom(restroom)}
                                                                className="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors"
                                                            >
                                                                Editar
                                                            </button>
                                                            {deleteConfirm === restroom.id ? (
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={() => handleDeleteRestroom(restroom.id)}
                                                                        className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 transition-colors"
                                                                    >
                                                                        <IconCheck className="size-4 text-white" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setDeleteConfirm(null)}
                                                                        className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                                                                    >
                                                                        <IconX className="size-4 text-white" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setDeleteConfirm(restroom.id)}
                                                                    className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                                                                >
                                                                    <IconTrash className="size-4 text-red-400" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => setExpandedRestroom(isExpanded ? null : restroom.id)}
                                                                className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                                                            >
                                                                {isExpanded ? (
                                                                    <IconChevronUp className="size-4 text-white" />
                                                                ) : (
                                                                    <IconChevronDown className="size-4 text-white" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Details */}
                                                    {isExpanded && (
                                                        <div className="border-t border-gray-700 p-4 space-y-4">
                                                            {/* Details Grid */}
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                                                <div>
                                                                    <span className="text-gray-500">Tipo:</span>
                                                                    <span className="text-white ml-2">{restroom.type}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">Estado:</span>
                                                                    <span className="text-white ml-2">{restroom.status}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">Rating:</span>
                                                                    <span className="text-white ml-2">{restroom.rating.toFixed(1)} ({restroom.vote_count})</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">Fotos:</span>
                                                                    <span className="text-white ml-2">{restroom.photos?.length || 0}</span>
                                                                </div>
                                                            </div>

                                                            {/* Amenities */}
                                                            {restroom.amenities.length > 0 && (
                                                                <div>
                                                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Amenities:</span>
                                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                                        {restroom.amenities.map(a => (
                                                                            <span key={a} className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                                                                                {a}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Comments Section */}
                                                            <div>
                                                                <span className="text-xs text-gray-500 uppercase tracking-wide">
                                                                    Comentarios ({restroomComments.length})
                                                                </span>
                                                                {restroomComments.length === 0 ? (
                                                                    <p className="text-gray-500 text-sm mt-2">Sin comentarios</p>
                                                                ) : (
                                                                    <div className="space-y-2 mt-2">
                                                                        {restroomComments.map(comment => (
                                                                            <div
                                                                                key={comment.id}
                                                                                className="bg-gray-700/50 rounded-lg p-3 flex items-start gap-3"
                                                                            >
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="text-sm font-medium text-white">
                                                                                            {comment.profiles?.full_name || 'Usuario'}
                                                                                        </span>
                                                                                        {comment.rating && (
                                                                                            <span className="text-xs text-yellow-400">
                                                                                                {'★'.repeat(comment.rating)}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    <p className="text-sm text-gray-300 mt-0.5">{comment.content}</p>
                                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                                        {new Date(comment.created_at).toLocaleDateString()}
                                                                                    </p>
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => handleDeleteComment(comment.id)}
                                                                                    className="p-1.5 rounded bg-red-500/20 hover:bg-red-500/30 transition-colors shrink-0"
                                                                                >
                                                                                    <IconTrash className="size-3.5 text-red-400" />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Edit Restroom Modal */}
            <AnimatePresence>
                {editingRestroom && (
                    <EditRestroomModal
                        restroom={editingRestroom}
                        onClose={() => setEditingRestroom(null)}
                        onPickLocation={onPickLocation}
                        onSave={async (updated) => {
                            setRestrooms(restrooms.map(r => r.id === updated.id ? updated : r))
                            setEditingRestroom(null)
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

// Enhanced Edit Restroom Modal
interface EditRestroomModalProps {
    restroom: Restroom
    onClose: () => void
    onPickLocation: () => void
    onSave: (restroom: Restroom) => Promise<void>
}

function EditRestroomModal({ restroom, onClose, onPickLocation, onSave }: EditRestroomModalProps) {
    const [form, setForm] = useState({ ...restroom })
    const [saving, setSaving] = useState(false)
    const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([])
    const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([])

    // Location picking state
    const { draftLocation, setDraftLocation, setMapViewState } = useAppStore()
    const [waitingForLocation, setWaitingForLocation] = useState(false)

    // Handle return from location picking
    useEffect(() => {
        if (waitingForLocation && draftLocation) {
             setForm(prev => ({
                 ...prev,
                 latitude: draftLocation.latitude,
                 longitude: draftLocation.longitude,
                 address: draftLocation.address || prev.address // Use new address if available
             }))
             setDraftLocation(null) // Clear it so we don't re-use it
             setWaitingForLocation(false)
        }
    }, [draftLocation, waitingForLocation, setDraftLocation])

    const handlePickLocation = () => {
        // Center map on current restroom location for better UX
        setMapViewState({
            latitude: form.latitude,
            longitude: form.longitude,
            zoom: 16
        })
        setWaitingForLocation(true)
        onPickLocation()
    }

    // Gender amenities from current amenities
    const genderAmenities = form.amenities.filter(a => ['male', 'female', 'unisex'].includes(a))
    const featureAmenities = form.amenities.filter(a => !['male', 'female', 'unisex'].includes(a))

    const toggleGender = (gender: 'male' | 'female' | 'unisex') => {
        const newGenderAmenities = genderAmenities.includes(gender as Amenity) ? [] : [gender as Amenity]
        setForm({
            ...form,
            amenities: [...newGenderAmenities, ...featureAmenities]
        })
    }

    const toggleFeature = (amenity: Amenity) => {
        const newFeatures = featureAmenities.includes(amenity)
            ? featureAmenities.filter(a => a !== amenity)
            : [...featureAmenities, amenity]
        setForm({
            ...form,
            amenities: [...genderAmenities, ...newFeatures]
        })
    }

    const handleAddPhoto = (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no puede pesar mas de 5MB')
            return
        }
        const preview = URL.createObjectURL(file)
        setNewPhotoFiles(prev => [...prev, file])
        setNewPhotoPreviews(prev => [...prev, preview])
    }

    const handleRemoveNewPhoto = (index: number) => {
        URL.revokeObjectURL(newPhotoPreviews[index])
        setNewPhotoFiles(prev => prev.filter((_, i) => i !== index))
        setNewPhotoPreviews(prev => prev.filter((_, i) => i !== index))
    }

    const handleRemoveExistingPhoto = (index: number) => {
        setForm({
            ...form,
            photos: form.photos?.filter((_, i) => i !== index) || []
        })
    }

    const handleSetFeatured = (index: number) => {
        if (!form.photos || index === 0) return
        const newPhotos = [...form.photos]
        const [photo] = newPhotos.splice(index, 1)
        newPhotos.unshift(photo)
        setForm({ ...form, photos: newPhotos })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            // Upload new photos if any
            let uploadedUrls: string[] = []
            if (newPhotoFiles.length > 0) {
                toast.loading('Subiendo fotos...', { id: 'upload' })
                try {
                    uploadedUrls = await Promise.all(newPhotoFiles.map(f => uploadImageToR2(f)))
                    toast.success('Fotos subidas', { id: 'upload' })
                } catch {
                    toast.error('Error subiendo fotos', { id: 'upload' })
                    setSaving(false)
                    return
                }
            }

            const finalPhotos = [...(form.photos || []), ...uploadedUrls]

            const updateData = {
                name: form.name,
                address: form.address,
                price: form.price,
                // is_free is a generated column, don't include it
                status: form.status,
                type: form.type,
                amenities: form.amenities,
                verified: form.verified,
                opening_time: form.opening_time || null,
                closing_time: form.closing_time || null,
                description: form.description || null,
                photos: finalPhotos,
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const client = supabase as any
            const { error } = await client.from('restrooms').update(updateData).eq('id', form.id)

            if (error) {
                toast.error('Error al guardar')
                console.error(error)
            } else {
                toast.success('Baño actualizado')
                await onSave({ ...form, photos: finalPhotos })
            }
        } finally {
            setSaving(false)
        }
    }

    // Cleanup previews on unmount
    useEffect(() => {
        return () => {
            newPhotoPreviews.forEach(url => URL.revokeObjectURL(url))
        }
    }, [newPhotoPreviews])

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50"
                onClick={onClose}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl max-h-[90vh] bg-gray-800 rounded-2xl overflow-hidden flex flex-col pointer-events-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 shrink-0">
                        <h2 className="text-lg font-bold text-white">Editar Baño</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg">
                            <IconX className="size-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-6">
                        {/* Type Selection */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Tipo</label>
                            <div className="grid grid-cols-4 gap-2">
                                {RESTROOM_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setForm({ ...form, type: type.id })}
                                        className={cn(
                                            'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
                                            form.type === type.id
                                                ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                                                : 'border-gray-700 text-gray-400 hover:border-gray-600'
                                        )}
                                    >
                                        {type.icon}
                                        <span className="text-xs font-medium">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Nombre</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>

                        {/* Address & Location */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Ubicación y Dirección</label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={form.address || ''}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        className="flex-1 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Dirección"
                                    />
                                    <button
                                        type="button"
                                        onClick={handlePickLocation}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white transition-colors flex items-center gap-2 shrink-0"
                                        title="Editar ubicación en mapa"
                                    >
                                        <IconMapPin size={20} className="text-primary-400" />
                                        <span className="hidden sm:inline">Editar Mapa</span>
                                    </button>
                                </div>
                                <div className="flex gap-4 text-xs text-gray-500 font-mono px-1">
                                    <span>Lat: {form.latitude.toFixed(6)}</span>
                                    <span>Lon: {form.longitude.toFixed(6)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="bg-gray-700/50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, is_free: !form.is_free, price: form.is_free ? form.price : 0 })}
                                    className="flex items-center gap-2"
                                >
                                    <div className={cn(
                                        "w-10 h-5 flex items-center rounded-full p-0.5 transition-colors",
                                        form.is_free ? "bg-green-500" : "bg-gray-600"
                                    )}>
                                        <div className={cn(
                                            "w-4 h-4 bg-white rounded-full transition-transform",
                                            form.is_free ? "translate-x-5" : "translate-x-0"
                                        )} />
                                    </div>
                                    <span className="text-sm font-medium text-white">
                                        {form.is_free ? 'Es Gratis' : 'Tiene Costo'}
                                    </span>
                                </button>
                                {!form.is_free && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">Bs</span>
                                        <input
                                            type="number"
                                            value={form.price}
                                            onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                                            className="w-20 px-2 py-1 bg-gray-600 rounded text-center text-white"
                                            min="0"
                                            step="0.5"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Disponible Para</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => toggleGender('male')}
                                    className={cn(
                                        'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
                                        genderAmenities.includes('male' as Amenity)
                                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                            : 'border-gray-700 text-gray-400 hover:border-gray-600'
                                    )}
                                >
                                    <IconGenderMale size={20} />
                                    <span className="text-xs font-medium">Hombre</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleGender('female')}
                                    className={cn(
                                        'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
                                        genderAmenities.includes('female' as Amenity)
                                            ? 'border-pink-500 bg-pink-500/10 text-pink-400'
                                            : 'border-gray-700 text-gray-400 hover:border-gray-600'
                                    )}
                                >
                                    <IconGenderFemale size={20} />
                                    <span className="text-xs font-medium">Mujer</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleGender('unisex')}
                                    className={cn(
                                        'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
                                        genderAmenities.includes('unisex' as Amenity)
                                            ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                                            : 'border-gray-700 text-gray-400 hover:border-gray-600'
                                    )}
                                >
                                    <IconGenderBigender size={20} />
                                    <span className="text-xs font-medium">Unisex</span>
                                </button>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Servicios</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {AMENITIES.map(amenity => (
                                    <button
                                        key={amenity.id}
                                        type="button"
                                        onClick={() => toggleFeature(amenity.id)}
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all',
                                            featureAmenities.includes(amenity.id)
                                                ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                                                : 'border-gray-700 text-gray-400 hover:border-gray-600'
                                        )}
                                    >
                                        {amenity.icon}
                                        <span className="font-medium">{amenity.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Hours */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                                Horario <span className="text-gray-500 font-normal">(opcional)</span>
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Abre</label>
                                    <div className="relative">
                                        <IconClock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                                        <input
                                            type="time"
                                            value={form.opening_time || ''}
                                            onChange={(e) => setForm({ ...form, opening_time: e.target.value || null })}
                                            className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Cierra</label>
                                    <div className="relative">
                                        <IconClock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                                        <input
                                            type="time"
                                            value={form.closing_time || ''}
                                            onChange={(e) => setForm({ ...form, closing_time: e.target.value || null })}
                                            className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                                Descripcion <span className="text-gray-500 font-normal">(opcional)</span>
                            </label>
                            <textarea
                                value={form.description || ''}
                                onChange={(e) => setForm({ ...form, description: e.target.value || null })}
                                rows={2}
                                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Como llegar, informacion adicional..."
                            />
                        </div>

                        {/* Photos */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                                Fotos <span className="text-gray-500 font-normal">({(form.photos?.length || 0) + newPhotoFiles.length}/5)</span>
                            </label>
                            
                            {/* Existing + New Photos Grid */}
                            <div className="grid grid-cols-4 gap-3">
                                {/* Existing photos */}
                                {form.photos?.map((photo, index) => (
                                    <div key={photo} className="relative aspect-square rounded-lg overflow-hidden group border-2 border-gray-700">
                                        <img src={photo} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetFeatured(index)}
                                                    className="p-1.5 bg-amber-500 rounded-full"
                                                    title="Hacer principal"
                                                >
                                                    <IconStar size={14} className="text-white" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingPhoto(index)}
                                                className="p-1.5 bg-red-500 rounded-full"
                                            >
                                                <IconTrash size={14} className="text-white" />
                                            </button>
                                        </div>
                                        {index === 0 && (
                                            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-amber-500 rounded text-[10px] font-bold text-white">
                                                Principal
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* New photos */}
                                {newPhotoPreviews.map((preview, index) => (
                                    <div key={preview} className="relative aspect-square rounded-lg overflow-hidden group border-2 border-primary-500">
                                        <img src={preview} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveNewPhoto(index)}
                                                className="p-1.5 bg-red-500 rounded-full"
                                            >
                                                <IconTrash size={14} className="text-white" />
                                            </button>
                                        </div>
                                        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary-500 rounded text-[10px] font-bold text-white">
                                            Nueva
                                        </div>
                                    </div>
                                ))}

                                {/* Add photo button */}
                                {(form.photos?.length || 0) + newPhotoFiles.length < 5 && (
                                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-600 hover:border-primary-500 transition-colors flex items-center justify-center cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) handleAddPhoto(file)
                                                e.target.value = ''
                                            }}
                                            className="hidden"
                                        />
                                        <IconPhotoPlus size={24} className="text-gray-500" />
                                    </label>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Haz clic en la estrella para establecer la foto principal
                            </p>
                        </div>

                        {/* Status & Verified */}
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Estado</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value as Restroom['status'] })}
                                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                >
                                    <option value="open">Abierto</option>
                                    <option value="closed">Cerrado</option>
                                    <option value="unknown">Desconocido</option>
                                </select>
                            </div>
                            <div className="flex items-end pb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.verified}
                                        onChange={(e) => setForm({ ...form, verified: e.target.checked })}
                                        className="size-5 rounded border-gray-600 bg-gray-700 text-primary-500"
                                    />
                                    <span className="text-sm font-medium text-white">Verificado</span>
                                </label>
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="flex gap-3 p-4 border-t border-gray-700 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </>
    )
}
