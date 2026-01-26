# Configuración de Autenticación con Google (Supabase OAuth)

Para habilitar el inicio de sesión con Google en TronoGo, necesitas configurar las credenciales tanto en Google Cloud Console como en el Dashboard de Supabase.

## Paso 1: Configurar Google Cloud Project

1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un nuevo proyecto (o selecciona uno existente).
3. Busca y selecciona **"APIs & Services"** > **"OAuth consent screen"**.
4. Selecciona **External** y haz clic en **Create**.
5. Rellena la información básica de la aplicación (Nombre: TronoGo, correos de soporte, etc.) y guarda.
6. En la pestaña **Credentials**, haz clic en **Create Credentials** > **OAuth client ID**.
7. Tipo de aplicación: **Web application**.
8. Nombre: `Supabase Auth` (o lo que prefieras).
9. **Authorized redirect URIs**:
   - Necesitas la URL de callback de tu proyecto de Supabase.
   - Ve a tu [Supabase Dashboard](https://supabase.com/dashboard) > Project > Authentication > Providers > Google.
   - Copia la URL que dice **Callback URL (for OAuth)**. Debería verse como: `https://<project-ref>.supabase.co/auth/v1/callback`.
   - Pégala en el campo de "Authorized redirect URIs" en Google Cloud.
   - **IMPORTANTE**: También añade tu URL de desarrollo local si vas a probar en local, e.g., `http://localhost:5173`. *Nota: Supabase maneja el redirect final, pero a veces es útil tener ambos si usas librerías directas, aunque con Supabase suele bastar la callback de Supabase.*
10. Haz clic en **Create**.
11. Copia el **Client ID** y el **Client Secret**.

## Paso 2: Configurar Supabase

1. Ve a tu [Supabase Dashboard](https://supabase.com/dashboard).
2. Navega a **Authentication** > **Providers**.
3. Selecciona **Google**.
4. Activa el toggle **Enable Sign in with Google**.
5. Pega el **Client ID** y **Client Secret** que obtuviste en el paso anterior.
6. Haz clic en **Save**.

## Paso 3: Verificar URL del Sitio (Supabase)

1. Ve a **Authentication** > **URL Configuration**.
2. Asegúrate de que **Site URL** sea tu URL de producción (e.g., la de Vercel).
3. En **Redirect URLs**, añade:
   - `http://localhost:5173` (para desarrollo local).
   - `https://ironogo.vercel.app` (o tu dominio de producción).
   - `https://<project-ref>.supabase.co` (a veces necesario).

Una vez completados estos pasos, la integración desde el código funcionará correctamente.
