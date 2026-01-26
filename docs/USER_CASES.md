# Casos de Uso (User Cases) - TronoGo

## UC-01: Explorar Mapa y Baños
**Actor:** Usuario
**Precondición:** La aplicación tiene acceso a la ubicación (opcional) o usa una por defecto.
**Flujo Principal:**
1. El usuario abre la aplicación.
2. El sistema carga el mapa centrado en la ubicación del usuario (o caché/default).
3. El sistema muestra marcadores de baños cercanos (Restrooms).
4. El usuario puede mover el mapa para explorar otras zonas.

## UC-02: Añadir Nuevo Baño (Pin Picker)
**Actor:** Usuario
**Flujo Principal:**
1. El usuario hace clic en el botón "Añadir" (en ExploreScreen).
2. El sistema cambia al modo "Pin Picker".
   - Muestra una mira fija en el centro.
   - Oculta marcadores de baños.
   - Muestra la dirección aproximada en la parte inferior.
3. El usuario arrastra el mapa para posicionar la mira en la ubicación exacta del baño.
4. El usuario confirma la ubicación.
5. El sistema abre el formulario de detalles ("AddRestroomModal").
6. El usuario completa la información y guarda.
7. El sistema vuelve al modo Exploración.

## UC-03: Filtrar Baños
**Actor:** Usuario
**Flujo Principal:**
1. El usuario selecciona filtros (ej. "Gratis", "Accesible") en la barra de búsqueda.
2. El sistema actualiza los marcadores en el mapa para mostrar solo los que cumplen los criterios.
