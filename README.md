# TronoGo - "Waze for Restrooms"

TronoGo is a hyper-fast, community-driven mobile web app designed to help users find nearby toilets instantly.

## Project Vision
- **Core Value:** Speed and Trust. Users need a bathroom *now*.
- **Primary Interface:** The Map is the UI. No complex menus, no landing pages.
- **Design Source:** UI designs generated via Stitch MCP.

## Tech Stack & Architecture
- **Bundler & Framework:** Vite + React + TypeScript
- **Styling:** Tailwind CSS v4
- **Map Provider:** `react-map-gl` (Mapbox GL JS)
- **Icons:** `@tabler/icons-react`
- **State Management:** Zustand
- **Database & Auth:** Supabase (PostgreSQL)

## Getting Started

### Prerequisites
- Node.js
- pnpm (Package Manager)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables locally (`.env`):
   ```
   VITE_MAPBOX_TOKEN=your_token_here
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```
4. Run the development server:
   ```bash
   pnpm dev
   ```

## Workflow & Conventions
- **Package Manager:** `pnpm` exclusively.
- **Strict TypeScript:** No `any` or `unknown`.
- **Linting:** code must pass `pnpm lint`.
- **Testing:** `pnpm test` (Vitest).

## Project Structure
- `src/features`: Feature-based folders (map, restrooms).
- `src/components/ui`: Shared UI components.
- `src/lib`: Shared utilities and helpers.
