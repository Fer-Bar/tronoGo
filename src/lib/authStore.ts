import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthState {
    user: User | null
    session: Session | null
    profile: Profile | null
    loading: boolean
    isAdmin: boolean
    setUser: (user: User | null) => void
    setSession: (session: Session | null) => void
    setProfile: (profile: Profile | null) => void
    setLoading: (loading: boolean) => void
    setIsAdmin: (isAdmin: boolean) => void
    signInWithGoogle: () => Promise<void>
    signOut: () => Promise<void>
    initialize: () => () => void
    refreshSession: () => Promise<void>
    fetchProfile: (userId: string) => Promise<void>
}

interface Profile {
    id: string
    full_name: string | null
    avatar_url: string | null
    is_admin: boolean
    updated_at: string | null
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    profile: null,
    loading: true,
    isAdmin: false,

    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    setProfile: (profile) => set({ profile }),
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
        set({ isAdmin: false, profile: null })
    },

    fetchProfile: async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching profile:', error.message)
            set({ isAdmin: false, profile: null })
            return
        }

        const profile = data as Profile
        set({
            profile,
            isAdmin: profile.is_admin ?? false
        })
    },

    initialize: () => {
        const { fetchProfile } = useAuthStore.getState()

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            set({ session, user: session?.user ?? null, loading: false })
            if (session?.user) {
                fetchProfile(session.user.id)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                set({ session, user: session?.user ?? null, loading: false })
                if (session?.user) {
                    fetchProfile(session.user.id)
                } else {
                    set({ isAdmin: false, profile: null })
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
            await useAuthStore.getState().fetchProfile(session.user.id)
        }
    },
}))

