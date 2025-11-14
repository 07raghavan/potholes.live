# Smooth Road Finder

A real-time pothole detection web application and interactive mapping. Built with React, TypeScript, and ONNX Runtime for on-device machine learning inference.

## Features

- 🎥 **Real-time Pothole Detection** - Uses ONNX model for on-device ML inference
- 🗺️ **Interactive Map** - Mapbox GL integration with clustering and heatmaps
- 📍 **GPS Tracking** - Real-time location tracking and route recording
- 🔥 **Firebase Integration** - Authentication and cloud storage
- 📱 **PWA Support** - Works as a Progressive Web App
- 🌐 **Netlify Functions** - Serverless backend for geocoding and API proxying

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **Maps**: Mapbox GL + react-map-gl
- **ML**: ONNX Runtime Web
- **Backend**: Firebase (Auth + Firestore) + Netlify Functions
- **State**: React Query (TanStack Query)
- **Routing**: React Router v6

## Project Structure

```
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── AuthModal.tsx
│   │   ├── CameraTray.tsx
│   │   ├── Globe.tsx
│   │   └── ...
│   ├── contexts/          # React contexts (Auth)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Core libraries & services
│   │   ├── auth.ts
│   │   ├── firebase.ts
│   │   ├── pothole-service.ts
│   │   └── ...
│   ├── pages/             # Route pages
│   ├── workers/           # Web Workers (ML inference)
│   └── main.tsx           # App entry point
├── public/
│   ├── models/            # ONNX model files
│   ├── onnxruntime/       # ONNX runtime WASM files
│   └── ...
├── netlify/
│   └── functions/         # Serverless functions
├── scripts/               # Build scripts
└── [config files]         # Various config files (root level)
```

## Prerequisites

- Node.js 18+ or Bun
- Firebase project with Firestore enabled
- Mapbox account with access token
- Netlify account (for deployment)

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_MAPBOX_TOKEN=your_mapbox_token
```

## Installation

```bash
# Install dependencies
npm install

# Or with Bun
bun install
```

## Development

```bash
# Start dev server
npm run dev

# Runs on http://localhost:8080
```

## Building

```bash
# Production build
npm run build

# Development build (with source maps)
npm run build:dev

# Preview production build
npm run preview
```

## Deployment

### Netlify

```bash
# Deploy to production
netlify deploy --prod

# Deploy to preview
netlify deploy
```

The project is configured with `netlify.toml` for automatic builds.

## Firebase Setup

1. Create a Firebase project
2. Enable Firestore database
3. Enable Authentication (Email/Password)
4. Deploy Firestore rules from `firestore.rules`
5. Deploy Firestore indexes from `firestore.indexes.json`

## Key Configuration Files

- `vite.config.ts` - Vite bundler configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `netlify.toml` - Netlify deployment settings
- `components.json` - shadcn/ui components config
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore database indexes

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build with env check
- `npm run build:dev` - Development build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Features in Detail

### ML Model
- ONNX Runtime Web for browser-based inference
- Web Worker for background processing
- Real-time video frame analysis

### GPS & Mapping
- Real-time location tracking
- Route recording and playback
- Pothole clustering on map
- Heatmap visualization

### Authentication
- Firebase Authentication
- Protected routes
- User profiles
- Session management

### PWA
- Service Worker for offline support
- Web App Manifest
- Install prompt

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with camera access

## License

[Add your license here]

## Contributing

[Add contribution guidelines if needed]
