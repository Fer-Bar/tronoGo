import { IconX, IconMapPin, IconStar, IconStarFilled, IconClock, IconCash } from '@tabler/icons-react'
import { RestroomActions } from './RestroomActions'
import { RestroomComments } from './RestroomComments'
import { BottomSheet } from '../ui/BottomSheet'
import { TYPE_LABELS, AMENITY_LABELS, TYPE_ICONS, AMENITY_ICONS } from '../../lib/constants'
import { formatShortAddress, formatDistance, calculateDistance } from '../../lib/utils'
import type { Restroom } from '../../lib/database.types'
import { useAppStore } from '../../lib/store'
import { useState } from 'react'

interface RestroomDetailProps {
  restroom: Restroom | null
  isOpen: boolean
  onClose: () => void
}

// Collapsed Summary View
function SummaryView({ restroom, onWriteReview }: { restroom: Restroom; onWriteReview: () => void }) {
  const userLocation = useAppStore(state => state.userLocation)
  const distance = userLocation 
    ? formatDistance(calculateDistance(userLocation.latitude, userLocation.longitude, restroom.latitude, restroom.longitude))
    : null

  const isOpen = restroom.status === 'open'
  const closingTimeFormatted = restroom.closing_time 
    ? new Date(`1970-01-01T${restroom.closing_time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : null

  return (
    <div className="pt-10 md:pt-6 px-5 md:px-6 pb-5 md:pb-4 h-full md:h-auto flex flex-col gap-4">
      {/* Header Info */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
           <h3 className="font-bold text-2xl md:text-xl text-white truncate leading-tight">{restroom.name}</h3>
           {restroom.vote_count > 0 ? (
             <div className="flex items-center gap-1 bg-primary-500/10 px-2 py-1 rounded-lg shrink-0">
               <span className="text-primary-400 font-bold text-sm">
                 {restroom.rating.toFixed(1)}
               </span>
               <IconStarFilled className="size-3 text-primary-400" />
             </div>
           ) : (
             <div className="flex items-center gap-1 bg-gray-800/60 px-2 py-1 rounded-lg shrink-0">
               <span className="text-gray-400 font-bold text-xs">0 votos</span>
               <IconStar className="size-3 text-gray-400" />
             </div>
           )}
        </div>
        <p className="text-gray-400 text-sm truncate">{formatShortAddress(restroom.address)}</p>
        
        {/* Info Row: Distance • Time • Price */}
        <div className="flex items-center gap-3 text-xs font-medium text-gray-300 mt-2">
            <span className="flex items-center gap-1 text-primary-400">
                <IconMapPin className="size-3.5" />
                <span>{distance || '-'}</span>
            </span>
            <span className="size-1 rounded-full bg-gray-600" />
            <span className="flex items-center gap-1">
                 <IconClock className="size-3.5 text-primary-400" />
                 {isOpen 
                    ? `Abierto hasta ${closingTimeFormatted || 'cierre'}` 
                    : <span className="text-red-400">Cerrado</span>
                 }
            </span>
            <span className="size-1 rounded-full bg-gray-600" />
            <span className="text-gray-300">
                {restroom.is_free ? 'Gratis' : `${restroom.price} Bs`}
            </span>
        </div>
      </div>

      {/* Action Footer (Matches Sticky Footer) */}
      <div className="mt-4">
         <RestroomActions restroom={restroom} onWriteReview={onWriteReview} />
      </div>
    </div>
  )
}

// Expanded Detail View
function ExpandedView({ 
    restroom, 
    onClose, 
    isWritingReview, 
    onWriteReview, 
    onCloseReview 
}: { 
    restroom: Restroom; 
    onClose: () => void; 
    isWritingReview: boolean; 
    onWriteReview: () => void; 
    onCloseReview: () => void;
}) {
  const userLocation = useAppStore(state => state.userLocation)
  const distance = userLocation 
    ? formatDistance(calculateDistance(userLocation.latitude, userLocation.longitude, restroom.latitude, restroom.longitude))
    : null

  const isOpen = restroom.status === 'open'
  const heroImage = restroom.photos?.[0] || null
  const closingTimeFormatted = restroom.closing_time 
    ? new Date(`1970-01-01T${restroom.closing_time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : null

  return (
    <div className="flex flex-col md:flex-row h-full md:max-h-[85vh] xl:max-h-[85vh] md:h-auto bg-gray-900 relative">
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors border border-white/10 group"
      >
        <IconX className="size-5 group-hover:rotate-90 transition-transform" />
      </button>

      {/* Hero Image Section */}
      <div className="w-full md:w-5/12 h-64 md:h-full relative shrink-0 bg-gray-800">
        {heroImage ? (
          <img 
            src={heroImage} 
            alt={restroom.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-900/40 to-gray-900">
            <IconMapPin className="size-16 text-primary-500/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        
        {/* Status Badge on Image */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 ${
            isOpen 
              ? 'bg-action-500 text-gray-900' 
              : 'bg-red-500 text-white'
          }`}>
            <span className={`size-1.5 rounded-full ${isOpen ? 'bg-gray-900' : 'bg-white'}`} />
            {isOpen ? 'Abierto' : 'Cerrado'}
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        className="flex-1 md:w-7/12 overflow-y-auto px-5 md:px-8 pt-6 md:pt-8 pb-28 md:pb-24 space-y-6 -mt-4 md:mt-0 relative z-10"
        style={{ 
          maskImage: 'linear-gradient(to bottom, transparent, black 20px)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20px)'
        }}
      >
        {/* Title Section */}
        <div className="space-y-2">
          <div className="flex items-start justify-between pr-10 md:pr-12">
            <div>
              <h1 className="text-3xl md:text-2xl font-bold text-white tracking-tight leading-tight">{restroom.name}</h1>
            </div>
            {restroom.vote_count > 0 ? (
              <div className="flex flex-col lg:flex-row items-center lg:gap-3 bg-gray-800/60 border border-primary-500/20 px-3 py-2 rounded-xl shrink-0 ml-2">
                <div className="flex items-center gap-1">
                  <span className="text-primary-400 font-bold text-xl md:text-lg">
                    {restroom.rating.toFixed(1)}
                  </span>
                  <IconStarFilled className="size-4 text-primary-400" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold whitespace-nowrap">{restroom.vote_count} votos</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-800/60 px-3 py-2 rounded-xl shrink-0 ml-2">
                <span className="text-sm font-bold text-gray-400">0 votos</span>
                <IconStar className="size-4 text-gray-400" />
              </div>
            )}
          </div>
          
           <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                <IconMapPin className="size-4 text-primary-400" />
                <span>{formatShortAddress(restroom.address, 'Direccion no disponible')}</span>
           </div>

          {/* Expanded Info Row */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-sm md:text-xs font-medium text-gray-300 mt-2 p-3 md:p-2 bg-gray-800/40 rounded-xl border border-white/5">
             <span className="flex items-center gap-1">
               {(() => {
                 const Icon = TYPE_ICONS[restroom.type] || TYPE_ICONS.public
                 return <Icon className="size-4 text-primary-400" />
               })()}
              <span>{TYPE_LABELS[restroom.type]?.label || restroom.type}</span>
            </span>
            <span className="size-1 rounded-full bg-gray-600" />
             <span className="flex items-center gap-1">
                <IconMapPin className="size-4 text-primary-400" />
                <span>{distance || '-'}</span>
            </span>
            <span className="size-1 rounded-full bg-gray-600" />
             <span className="flex items-center gap-1">
                 <IconClock className="size-4 text-primary-400" />
                 {isOpen 
                    ? `Abierto hasta ${closingTimeFormatted || 'cierre'}` 
                    : <span className="text-red-400">Cerrado</span>
                 }
            </span>
            <span className="size-1 rounded-full bg-gray-600" />
             <span className="flex items-center gap-1">
                <IconCash className="size-4 text-primary-400" />
                <span className="text-gray-200">
                    {restroom.is_free ? 'Gratis' : `${restroom.price} Bs`}
                </span>
            </span>
          </div>
        </div>

        {/* About Section */}
        {restroom.description && (
          <div>
            <h3 className="text-base font-bold text-white mb-2">Acerca de</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {restroom.description}
            </p>
          </div>
        )}

        {/* Amenities Section */}
        {restroom.amenities && restroom.amenities.length > 0 && (
          <div className="bg-gray-800/40 rounded-xl p-4 md:p-3 border border-white/5">
            <h3 className="text-xs font-bold text-primary-400 mb-3 md:mb-2 flex items-center gap-2 uppercase tracking-widest">
              <IconStar className="size-4 md:size-3.5" /> Servicios Disponibles
            </h3>
            <div className="grid grid-cols-2 gap-3 md:gap-2">
              {restroom.amenities.map((amenity) => {
                const Icon = AMENITY_ICONS[amenity] || IconStar
                return (
                  <div
                    key={amenity}
                    className="flex items-center gap-2.5 md:gap-2 text-sm md:text-xs"
                  >
                    <div className="p-2 md:p-1.5 rounded-lg bg-primary-500/10">
                      <Icon className="size-4 md:size-3.5 text-primary-400" />
                    </div>
                    <span className="font-medium text-gray-200">
                      {AMENITY_LABELS[amenity] || amenity}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Community Reviews Placeholder */}
        <div className="pt-4 border-t border-white/5">
            <h3 className="text-base font-bold text-white">Opiniones</h3>

          <div className="pt-2">
            <RestroomComments 
                restroomId={restroom.id} 
                isWritingReview={isWritingReview}
                onCloseReview={onCloseReview}
            />
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-md border-t border-white/5 p-4 z-20">
        <RestroomActions restroom={restroom} onWriteReview={onWriteReview} />
      </div>
    </div>
  )
}

export function RestroomDetail({ restroom, isOpen, onClose }: RestroomDetailProps) {
  const [isWritingReview, setIsWritingReview] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  // Reset state when restroom changes or closes
  if (!isOpen) { 
      // We can't reset here easily because isOpen changes on close
      // Instead we rely on the parent or useEffect if needed, 
      // but for now let's just ensure we start fresh when mounting if keys changed
  }
  
  // Auto-expand when writing review
  const handleWriteReview = () => {
      setIsWritingReview(true)
      setIsExpanded(true)
  }

  if (!restroom) return null

  return (
    <BottomSheet 
      isOpen={isOpen} 
      onClose={onClose}
      collapsedHeight={220}
      isExpanded={isExpanded}
      onExpandedChange={setIsExpanded}
      expandedContent={
        <ExpandedView 
            restroom={restroom} 
            onClose={onClose} 
            isWritingReview={isWritingReview}
            onWriteReview={handleWriteReview}
            onCloseReview={() => setIsWritingReview(false)}
        />
      }
    >
      <SummaryView 
        restroom={restroom} 
        onWriteReview={handleWriteReview}
      />
    </BottomSheet>
  )
}
