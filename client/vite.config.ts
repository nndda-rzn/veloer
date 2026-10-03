import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Route-level lazy loading (see src/app/router.tsx) keeps heavy
        // libraries like recharts, leaflet and react-big-calendar out of the
        // initial bundle. Only React itself is pinned to a stable vendor chunk
        // so app changes don't invalidate it. Everything else is left to
        // automatic splitting, which respects the lazy import graph.
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
              priority: 40,
            },
          ],
        },
      },
    },
  },
});
