import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthState {
    user: User | null
    session: Session | null
    loading: boolean
    setUser: (user: User | null) => void
    setSession: (session: Session | null) => void
    setLoading: (loading: boolean) => void
    signInWithGoogle: () => Promise<void>
    signOut: () => Promise<void>
    initialize: () => () => void
    refreshSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    loading: true,

    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    setLoading: (loading) => set({ loading }),

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
    },

    initialize: () => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            set({ session, user: session?.user ?? null, loading: false })
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                set({ session, user: session?.user ?? null, loading: false })
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
    },
}))
