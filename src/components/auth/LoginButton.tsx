import { IconBrandGoogle } from '@tabler/icons-react'
import { useAuthStore } from '../../lib/authStore'

export function LoginButton() {
    const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle)

    return (
        <button
            onClick={signInWithGoogle}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
        >
            <IconBrandGoogle className="size-5" />
            <span>Iniciar sesion</span>
        </button>
    )
}
