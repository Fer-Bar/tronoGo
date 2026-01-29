import { useState, useRef, useEffect } from 'react'
import { IconLogout, IconUser, IconShield } from '@tabler/icons-react'
import { useAuthStore } from '../../lib/authStore'
import { LoginButton } from './LoginButton'
import { EditProfileModal } from './EditProfileModal'

interface ProfileButtonProps {
    onAdminClick?: () => void
}

export function ProfileButton({ onAdminClick }: ProfileButtonProps) {
    const { user, loading, signOut, isAdmin } = useAuthStore()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isMenuOpen])

    if (loading) {
        return (
            <div className="size-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )
    }

    if (!user) {
        return <LoginButton />
    }

    const avatarUrl = user.user_metadata?.avatar_url
    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'
    const initials = displayName.slice(0, 2).toUpperCase()

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center size-10 rounded-full overflow-hidden bg-primary-600 text-white font-bold shadow-lg hover:ring-2 hover:ring-primary-400 transition-all active:scale-95"
                aria-label="Menu de usuario"
            >
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={displayName}
                        className="size-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <span className="text-sm">{initials}</span>
                )}
            </button>

            {isMenuOpen && (
                <div className="absolute left-0 bottom-12 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {displayName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                        </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                         <button
                            onClick={() => {
                                setIsMenuOpen(false)
                                setIsEditProfileOpen(true)
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <IconUser className="size-4" />
                            <span>Editar Perfil</span>
                        </button>

                        {/* Admin Button - Only visible to admins */}
                        {isAdmin && onAdminClick && (
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false)
                                    onAdminClick()
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                            >
                                <IconShield className="size-4" />
                                <span>Panel de Admin</span>
                            </button>
                        )}

                        <button
                            onClick={() => {
                                setIsMenuOpen(false)
                                signOut()
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <IconLogout className="size-4" />
                            <span>Cerrar sesion</span>
                        </button>
                    </div>
                </div>
            )}

            <EditProfileModal 
                isOpen={isEditProfileOpen} 
                onClose={() => setIsEditProfileOpen(false)} 
            />
        </div>
    )
}

// Also export a simpler version just for showing user icon when logged in
export function UserAvatar() {
    const { user } = useAuthStore()
    
    if (!user) return null

    const avatarUrl = user.user_metadata?.avatar_url
    const displayName = user.user_metadata?.full_name || 'U'

    return (
        <div className="flex items-center justify-center size-8 rounded-full overflow-hidden bg-primary-600 text-white font-bold">
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={displayName}
                    className="size-full object-cover"
                    referrerPolicy="no-referrer"
                />
            ) : (
                <IconUser className="size-4" />
            )}
        </div>
    )
}
