
# potholes.live

potholes.live is a real-time pothole detection and mapping platform built for speed, privacy, and impact. It uses on-device AI, geospatial technology, and a modern web stack to help users report and visualize road hazards.

## Features

- Real-time pothole detection using ONNX Runtime Web and a YOLO model
- Visual fingerprinting and deduplication to prevent duplicate reports
- Interactive Mapbox GL map with clustering and heatmaps
- GPS tracking and route recording with session statistics
- Offline-first reporting with IndexedDB queue and auto-sync
- Supabase/Postgres backend with Row Level Security (RLS) and geospatial queries
- Authentication via email, Google, and GitHub (Supabase Auth)
- Progressive Web App (PWA) support for mobile and desktop
- Serverless backend functions (Netlify) for secure token proxying and geocoding
- Share and social features for easy report sharing

## Technology Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- AI/ML: ONNX Runtime Web, YOLOv8 model
- Mapping: Mapbox GL, react-map-gl
- Backend: Supabase (Auth, Postgres, PostGIS), Netlify Functions
- State: React Query (TanStack Query)
- Routing: React Router v6
- Offline: IndexedDB, Service Worker
- Geospatial: Custom quantization, haversine, clustering

## Project Structure

```
src/
   components/      # UI and app components
   contexts/        # React contexts (Auth, etc.)
   hooks/           # Custom React hooks
   lib/             # Core logic: fingerprinting, geospatial, reporting, auth
   pages/           # Route pages (Index, Profile, etc.)
   workers/         # Web Workers for ML inference
public/
   models/          # ONNX model files
   onnxruntime/     # ONNX runtime WASM files
netlify/
   functions/       # Serverless backend functions
scripts/           # Build and env scripts
[config files]     # Vite, Tailwind, Netlify, etc.
```

## Custom Technology Highlights

- Pothole fingerprinting: Tracks each pothole by position, size, aspect ratio, and appearance across frames
- Deduplication logic: Uses quantized geospatial cells and visual similarity to avoid double-counting
- Offline queue: IndexedDB stores pending reports, syncing automatically when online
- Supabase RLS: All data protected by row-level security
- Mapbox token security: Tokens are proxied via serverless functions, never exposed directly

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Supabase project with PostgreSQL and PostGIS
- Mapbox account with access token
- Netlify account (for deployment)
- Google OAuth credentials (optional)
- GitHub OAuth app (optional)

### Environment Variables

Create a `.env` file in the root directory:

```
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Mapbox
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_SHARE_PIN_URL=https://your-domain.com/icon-192.png

# Server-side only (no VITE_ prefix)
MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

### Installation

```
npm install
# or
bun install
```

### Development

```
npm run dev
# or
bun dev
# App runs at http://localhost:8080
```

### Building

```
npm run build
npm run build:dev
npm run preview
```

### Deployment

Use Netlify for serverless functions and static hosting. Set environment variables in the Netlify dashboard. The project is configured with `netlify.toml` for automatic builds.

### Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Enable Email authentication in Authentication → Providers
3. (Optional) Enable Google OAuth and GitHub OAuth in Providers
4. Run the database schema from `supabase-schema-minimal.sql` in the SQL Editor
5. Copy your Project URL and anon key from Settings → API

### Key Configuration Files

- `vite.config.ts` - Vite bundler configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `netlify.toml` - Netlify deployment settings
- `components.json` - shadcn/ui components config
- `supabase-schema-minimal.sql` - Database schema for Supabase

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with camera access

## License

MIT

## Contributing

See CONTRIBUTING.md for guidelines.
