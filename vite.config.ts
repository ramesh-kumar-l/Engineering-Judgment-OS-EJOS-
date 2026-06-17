import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Engineering Judgment OS',
        short_name: 'EJOS',
        description: 'The personal operating system for developing engineering judgment.',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        start_url: '/',
        icons: [
          // Single scalable SVG — crisp at every size, precached for offline install.
          { src: 'icon.svg', type: 'image/svg+xml', sizes: 'any', purpose: 'any' },
        ],
      },
      workbox: {
        // App shell + assets are precached so the app loads fully offline (AD-001).
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
