import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { IconX, IconPhotoPlus, IconGenderMale, IconGenderFemale, IconGenderBigender, IconTrash } from '@tabler/icons-react'
import { Button } from '../ui'
import { cn } from '../../lib/utils'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../lib/store'
import type { RestroomType, Amenity, TablesInsert } from '../../lib/database.types'
import { uploadImageToR2 } from '../../utils/upload'
import { TYPE_ICONS, AMENITY_ICONS } from '../../lib/constants'

interface AddRestroomModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const RESTROOM_TYPES: { id: RestroomType; label: string; sublabel: string; icon: React.ReactNode }[] = [
  { id: 'public', label: 'Público', sublabel: 'Gratis', icon: <TYPE_ICONS.public size={22} /> },
  { id: 'commerce', label: 'Comercio', sublabel: 'Pago', icon: <TYPE_ICONS.commerce size={22} /> },
  { id: 'restaurant', label: 'Comida', sublabel: 'Cafés, etc', icon: <TYPE_ICONS.restaurant size={22} /> },
  { id: 'gas_station', label: 'Gasolinera', sublabel: '', icon: <TYPE_ICONS.gas_station size={22} /> },
]

const AMENITIES: { id: Amenity; label: string; icon: React.ReactNode }[] = [
  { id: 'accessible', label: 'Accesible', icon: <AMENITY_ICONS.accessible size={18} /> },
  { id: 'baby_changing', label: 'Cambiador', icon: <AMENITY_ICONS.baby_changing size={18} /> },
  { id: 'paper', label: 'Papel', icon: <AMENITY_ICONS.paper size={18} /> },
  { id: 'soap', label: 'Jabón', icon: <AMENITY_ICONS.soap size={18} /> },
  { id: 'sink', label: 'Lavamanos', icon: <AMENITY_ICONS.sink size={18} /> },
  { id: 'private', label: 'Privado', icon: <AMENITY_ICONS.private size={18} /> },
]

export function AddRestroomModal({ isOpen, onClose, onSuccess }: AddRestroomModalProps) {
  const { draftLocation, addRestroom } = useAppStore()
  
  // Form State
  const [name, setName] = useState('')
  const [selectedType, setSelectedType] = useState<RestroomType>('public')
  const [price, setPrice] = useState<string>('0')
  const [isFree, setIsFree] = useState(true)
  const [genderAmenities, setGenderAmenities] = useState<Amenity[]>([]) // male, female, unisex
  const [features, setFeatures] = useState<Amenity[]>([]) // other amenities
  const [openTime, setOpenTime] = useState('')
  const [closeTime, setCloseTime] = useState('')
  const [description, setDescription] = useState('')
  // Store File objects locally, only upload on successful submit
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Lock body scroll when modal is open (prevents iOS touch-through bug)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [isOpen])

  // Reset form when modal closes
  const resetForm = () => {
    setName('')
    setSelectedType('public')
    setPrice('0')
    setIsFree(true)
    setGenderAmenities([])
    setFeatures([])
    setOpenTime('')
    setCloseTime('')
    setDescription('')
    // Clean up object URLs to prevent memory leaks
    photoPreviews.forEach(url => URL.revokeObjectURL(url))
    setPhotoFiles([])
    setPhotoPreviews([])
  }

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Generate suggested name based on type and street
  const streetName = draftLocation?.address?.split(',')[0]?.trim() || ''
  const typeLabel = RESTROOM_TYPES.find(t => t.id === selectedType)?.label || 'Baño'
  const suggestedName = streetName ? `${typeLabel} - ${streetName}` : typeLabel

  const toggleGender = (gender: 'male' | 'female' | 'unisex') => {
    const genderAmenity = gender as Amenity
    setGenderAmenities(prev => {
      // Logic: Allow only ONE selected. If clicking properly selected, deselect it.
      if (prev.includes(genderAmenity)) {
        return [] // Toggle off
      }
      return [genderAmenity] // Select new one (clearing others)
    })
  }

  const toggleFeature = (amenity: Amenity) => {
    setFeatures(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    )
  }

  const handleSubmit = async () => {
    if (!draftLocation) return

    // Validation: Price is required if not free
    if (!isFree && (!price || parseFloat(price) <= 0)) {
        toast.error('Por favor ingresa un precio válido o marca "Es Gratis"')
        return
    }

    setIsSubmitting(true)

    try {
      // Upload photos to R2 only now (at submit time)
      let uploadedPhotoUrls: string[] = []
      if (photoFiles.length > 0) {
        toast.loading('Subiendo fotos...', { id: 'photo-upload' })
        try {
          const uploadPromises = photoFiles.map(file => uploadImageToR2(file))
          uploadedPhotoUrls = await Promise.all(uploadPromises)
          toast.success(`${uploadedPhotoUrls.length} foto(s) subida(s)`, { id: 'photo-upload' })
        } catch (uploadError) {
          console.error('Error uploading photos:', uploadError)
          toast.error('Error al subir las fotos. Intenta de nuevo.', { id: 'photo-upload' })
          setIsSubmitting(false)
          return
        }
      }

      const allAmenities = [...genderAmenities, ...features]
      const numericPrice = isFree ? 0 : parseFloat(price) || 0

      // Auto-generate name if empty: "[Type Label] [Street]"
      const typeLabel = RESTROOM_TYPES.find(t => t.id === selectedType)?.label || 'Baño'
      const street = draftLocation.address?.split(',')[0]?.trim() || ''
      const finalName = name.trim() || `${typeLabel} ${street}`.trim()

      const newRestroom: TablesInsert<'restrooms'> = {
        name: finalName,
        latitude: draftLocation.latitude,
        longitude: draftLocation.longitude,
        address: draftLocation.address,
        price: numericPrice,
        rating: 0,
        vote_count: 0,
        status: 'open' as const,
        type: selectedType,
        amenities: allAmenities,
        verified: false,
        opening_time: openTime || null,
        closing_time: closeTime || null,
        description: description || null,
        photos: uploadedPhotoUrls,
      }

      const { data, error } = await supabase
        .from('restrooms')
        // @ts-expect-error Supabase type inference failing for insert
        .insert(newRestroom)
        .select()
        .single()

      if (error) {
        console.error('Error creating restroom:', error)
        toast.error('Error al crear el baño. Intenta de nuevo.')
        return
      }

      if (data) {
        addRestroom(data)
        onSuccess()
        toast.success('¡Baño agregado exitosamente!')
      }
    } catch (err) {
      console.error('Error:', err)
      toast.error('Ocurrió un error inesperado.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle adding a photo file locally
  const handleAddPhoto = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede pesar más de 5MB')
      return
    }
    const previewUrl = URL.createObjectURL(file)
    setPhotoFiles(prev => [...prev, file])
    setPhotoPreviews(prev => [...prev, previewUrl])
  }

  // Handle removing a photo
  const handleRemovePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index])
    setPhotoFiles(prev => prev.filter((_, i) => i !== index))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - blocks all touch events */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            style={{ touchAction: 'none' }}
            onClick={onClose}
            onTouchMove={(e) => e.preventDefault()}
          />

          {/* Modal Wrapper for Centering */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md md:max-w-3xl h-full max-h-[90vh] md:h-auto 
                         bg-white dark:bg-gray-900 rounded-3xl shadow-2xl mx-auto overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800 pointer-events-auto"
            >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-2 shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Cerrar"
              >
                <IconX size={20} className="text-gray-500" />
              </button>
              <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white">
                Agregar Nuevo Baño
              </h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
              
              {/* Type Grid - FIRST */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tipo de Lugar</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {RESTROOM_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all',
                        selectedType === type.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      )}
                    >
                      <span className={cn(
                        selectedType === type.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
                      )}>
                        {type.icon}
                      </span>
                      <span className={cn(
                        'text-sm font-semibold',
                        selectedType === type.id ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
                      )}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input - SECOND with dynamic placeholder */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Nombre <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => {
                    // Clear if user hasn't customized the name
                    if (name === '' || name === suggestedName) {
                      setName('')
                    }
                  }}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder={suggestedName}
                />
              </div>

              {/* Price Section */}
              <div className="mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setIsFree(!isFree)}
                  >
                    <div className={cn(
                      "w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300",
                      isFree ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                    )}>
                      <div className={cn(
                        "bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300",
                        isFree ? "translate-x-6" : "translate-x-0"
                      )} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {isFree ? 'Es Gratis' : 'Tiene Costo'}
                    </span>
                  </div>
                  {!isFree && (
                     <div className="flex items-center gap-2">
                       <span className="text-gray-500 font-bold">Bs</span>
                       <input 
                         type="text"
                         inputMode="decimal"
                         value={price}
                         onChange={(e) => {
                           const val = e.target.value
                           // Allow empty or numbers with max 1 decimal
                           if (val === '' || /^\d+(\.\d{0,1})?$/.test(val)) {
                             setPrice(val)
                           }
                         }}
                         className="w-20 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 text-center font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                         placeholder="0.0"
                       />
                     </div>
                  )}
                </div>
              </div>

              {/* Gender Section */}
              <div className="mb-6">
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Disponible para</label>
                 <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => toggleGender('male')}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all",
                        genderAmenities.includes('male')
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <IconGenderMale size={22} />
                      <span className="text-sm font-semibold">Hombre</span>
                    </button>
                    <button 
                      onClick={() => toggleGender('female')}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all",
                        genderAmenities.includes('female')
                          ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300"
                          : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-pink-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <IconGenderFemale size={22} />
                      <span className="text-sm font-semibold">Mujer</span>
                    </button>
                    <button 
                      onClick={() => toggleGender('unisex')}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all",
                        genderAmenities.includes('unisex')
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                          : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-purple-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <IconGenderBigender size={22} />
                      <span className="text-sm font-semibold">Unisex</span>
                    </button>
                 </div>
              </div>

              {/* Amenities Grid */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Servicios y Estado</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {AMENITIES.map((amenity) => (
                    <button
                      key={amenity.id}
                      onClick={() => toggleFeature(amenity.id)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all text-left border-2',
                        features.includes(amenity.id)
                          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                          : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      <span className={features.includes(amenity.id) ? "text-primary-600" : "text-gray-400"}>
                        {amenity.icon}
                      </span>
                      <span className="font-semibold">{amenity.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider for Optional Fields */}
              <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-gray-900 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Opcional
                    </span>
                  </div>
              </div>

              {/* Hours Section */}
              <div className="mb-6">
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                   Horario de Atención <span className="text-gray-400 font-normal ml-1">(Opcional)</span>
                 </label>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs text-gray-400 mb-1.5 ml-1">Abre a las</label>
                       <input 
                         type="time" 
                         value={openTime}
                         onChange={(e) => setOpenTime(e.target.value)}
                         className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 text-sm"
                       />
                    </div>
                    <div>
                       <label className="block text-xs text-gray-400 mb-1.5 ml-1">Cierra a las</label>
                       <input 
                         type="time" 
                         value={closeTime}
                         onChange={(e) => setCloseTime(e.target.value)}
                         className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 text-sm"
                       />
                    </div>
                 </div>
              </div>

               {/* Description */}
               <div className="mb-6">
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                   Información Adicional <span className="text-gray-400 font-normal ml-1">(Opcional)</span>
                 </label>
                 <textarea
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   rows={3}
                   className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 resize-none text-sm placeholder:text-gray-400"
                   placeholder="¿Cómo llegar? ¿Está en el segundo piso? ¿Se necesita llave?"
                 />
               </div>

              {/* Photos Upload Section */}
               <div className="mb-6">
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                   Fotos <span className="text-gray-400 font-normal ml-1">({photoFiles.length}/3)</span>
                 </label>
                 
                 {/* Photo Previews - Local files, not uploaded yet */}
                 {photoPreviews.length > 0 && (
                   <div className="grid grid-cols-3 gap-3 mb-3">
                     {photoPreviews.map((preview, index) => (
                       <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
                         <img src={preview} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                         <button
                           type="button"
                           onClick={() => handleRemovePhoto(index)}
                           className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           <IconTrash size={14} />
                         </button>
                       </div>
                     ))}
                   </div>
                 )}

                 {/* Add Photo Button - saves locally, no network request */}
                 {photoFiles.length < 3 && (
                   <div className="relative">
                     <input
                       type="file"
                       accept="image/*"
                       onChange={(e) => {
                         const file = e.target.files?.[0]
                         if (file) {
                           handleAddPhoto(file)
                         }
                         e.target.value = '' // Reset input
                       }}
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                     />
                     <div className="flex items-center justify-center gap-3 p-4 border-2 border-dashed rounded-xl transition-all border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10">
                       <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-300">
                         <IconPhotoPlus size={20} />
                       </div>
                       <div className="text-left">
                         <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
                           Añadir foto
                         </div>
                         <div className="text-xs text-gray-500">
                           Máx 5MB (JPG, PNG)
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
                 {photoFiles.length > 0 && (
                   <p className="text-xs text-gray-400 mt-2">Las fotos se subiran al guardar</p>
                 )}
               </div>

            </div>

            {/* Footer / Submit */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full text-lg font-bold shadow-xl shadow-primary-600/30"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar ubicación'}
              </Button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
