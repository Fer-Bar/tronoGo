import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthState {
    user: User | null
    session: Session | null
    loading: boolean
    isAdmin: boolean
    setUser: (user: User | null) => void
    setSession: (session: Session | null) => void
    setLoading: (loading: boolean) => void
    setIsAdmin: (isAdmin: boolean) => void
    signInWithGoogle: () => Promise<void>
    signOut: () => Promise<void>
    initialize: () => () => void
    refreshSession: () => Promise<void>
    fetchAdminStatus: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    loading: true,
    isAdmin: false,

    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    setLoading: (loading) => set({ loading }),
    setIsAdmin: (isAdmin) => set({ isAdmin }),

    signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        })
        if (error) {
            console.error('Error signing in with Google:', error.message)
        }
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Error signing out:', error.message)
        }
        set({ isAdmin: false })
    },

    fetchAdminStatus: async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching admin status:', error.message)
            set({ isAdmin: false })
            return
        }

        // Type assertion since the database types should include is_admin
        const profile = data as { is_admin: boolean } | null
        set({ isAdmin: profile?.is_admin ?? false })
    },

    initialize: () => {
        const { fetchAdminStatus } = useAuthStore.getState()

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            set({ session, user: session?.user ?? null, loading: false })
            if (session?.user) {
                fetchAdminStatus(session.user.id)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                set({ session, user: session?.user ?? null, loading: false })
                if (session?.user) {
                    fetchAdminStatus(session.user.id)
                } else {
                    set({ isAdmin: false })
                }
            }
        )

        // Return cleanup function
        return () => {
            subscription.unsubscribe()
        }
    },

    refreshSession: async () => {
        const { data: { session } } = await supabase.auth.refreshSession()
        set({ session, user: session?.user ?? null })
        if (session?.user) {
            useAuthStore.getState().fetchAdminStatus(session.user.id)
        }
    },
}))

