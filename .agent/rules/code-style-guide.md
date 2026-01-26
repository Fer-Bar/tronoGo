---
trigger: always_on
---

## Convenciones
- Usa pnpm para todo: pnpm install, pnpm add, pnpm dlx, pnpm dev, pnpm build
- TypeScript es obligatorio
- No uses alerts
- Usa siempre Tailwind CSS para estilos (v4 @tailwindcss/vite)
- Iconos de tabler-icons. Importación explícita, nunca barrels
- Preferir ESM y sintaxis moderna del navegador

## Creación de proyectos (Stack: Vite + React)
- Usa Vite como bundler y scaffold.
- Comando obligatorio:
  `pnpm create vite <project_name> --template react-ts`
- Configuración inicial (Tailwind v4):
  1. Instalar dependencias:
     `pnpm install`
     `pnpm add tailwindcss @tailwindcss/vite`
  2. Configurar Vite (`vite.config.ts`):
     - Importar `tailwindcss` desde `@tailwindcss/vite`
     - Añadirlo al array de `plugins`.
  3. Configurar CSS:
     - En `src/index.css`, borrar todo y añadir únicamente:
       `@import "tailwindcss";`
  4. Limpiar el boilerplate (assets de React) antes de empezar.
- No añadir dependencias hasta que sean estrictamente necesarias.
- Configura TypeScript en modo estricto desde el inicio
- No añadir dependencias hasta que sean necesarias
## Organización
- Componentes pequeños, con una sola responsabilidad
- Preferir composición frente a configuraciones complejas
- Evita abstracciones prematuras
- El código compartido debe vivir en carpetas claras como `components`, `layouts`, `lib` o `utils`
## Reglas de TypeScript
- Evita `any` y `unknown`
- Preferir siempre que se pueda inferencia
- Si los tipos no están claros, parar y aclarar antes de continuar
## UI y estilos
- Tailwind es la única solución de estilos
- No duplicar clases si se puede extraer un componente
- Priorizar legibilidad frente a micro-optimizaciones visuales
- Accesibilidad no es opcional: HTML semántico, roles ARIA cuando aplique y foco gestionado
## Testing y calidad
- Revisar los workflows de CI en `.github/workflows` si existen.
- Ejecutar los tests con:
  `pnpm test` o `pnpm turbo run test --filter <project_name>`
- Para Vitest:
  `pnpm vitest run -t "<nombre del test>"`
- Tras mover archivos o cambiar imports, ejecutar:
  `pnpm lint`
- No se acepta código con errores de tipos, lint o tests fallidos.
- Añadir o actualizar tests cuando se cambie comportamiento, aunque no se pida explícitamente.
## Rendimiento y decisiones técnicas
- No adivinar rendimiento, tamaño de bundle o tiempos de carga: medir.
- Si algo parece lento, añadir instrumentación antes de optimizar.
- Validar primero en pequeño antes de escalar cambios a todo el proyecto.
- Mapas: Asegurar que el componente de mapa no se renderice innecesariamente (usar `React.memo`).
- No adivinar rendimiento: medir renderizados.
- Validar primero en pequeño antes de escalar cambios a todo el proyecto.
## Commits y Pull Requests
- Título del PR: [<project_name>] Descripción clara y concisa.
- PRs pequeños y enfocados.
- Antes de commitear:
  - pnpm lint
  - pnpm test
- Explicar qué ha cambiado, por qué y cómo se ha verificado.
- Si se introduce una nueva restricción ("nunca X", "siempre Y"), documentarla en este archivo.
## Comportamiento del agente
- Si una petición no está clara, hacer preguntas concretas antes de ejecutar.
- Tareas simples y bien definidas se ejecutan directamente.
- Cambios complejos (refactors, nuevas features, decisiones de arquitectura) requieren confirmar entendimiento antes de actuar.
- No asumir requisitos implícitos. Si falta información, se pide.
## Docs Actualizada
- Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.
## Comandos en Powershell
- Anida comandos asi:
`git add .; if ($?) { git commit -m "Optimize map rendering, fix list view layering, and improve validation" }; if ($?) { git push }`