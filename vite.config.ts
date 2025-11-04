import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    {
      name: 'configure-response-headers',
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          next();
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react-map-gl', 'mapbox-gl'],
  },
  optimizeDeps: {
    include: ['react-map-gl', 'mapbox-gl', 'onnxruntime-web'],
    exclude: ['onnxruntime-web/dist/*.wasm'],
  },
  assetsInclude: ['**/*.wasm', '**/*.onnx'],
  worker: {
    format: 'es', // Use ES modules for workers instead of IIFE
    rollupOptions: {
      output: {
        format: 'es', // Ensure ES module format for workers
      },
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'onnx': ['onnxruntime-web'],
          'mapbox': ['react-map-gl', 'mapbox-gl'],
        },
      },
    },
  },
}));
