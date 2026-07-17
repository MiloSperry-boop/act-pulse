import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// GitHub project sites are served from https://USERNAME.github.io/<repo>/.
// Derive the base path from GITHUB_REPOSITORY at build time so the app works
// both locally (base "/") and on Pages ("/act-pulse/") without hardcoding.
function resolveBase(): string {
  const repo = process.env.GITHUB_REPOSITORY; // e.g. "username/act-pulse"
  if (repo && repo.includes('/')) {
    const name = repo.split('/')[1];
    // A user/organization root site (username.github.io) is served at "/".
    if (name.endsWith('.github.io')) return '/';
    return `/${name}/`;
  }
  return '/';
}

export default defineConfig({
  base: resolveBase(),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          data: ['dexie', 'zod'],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        id: '/act-pulse/',
        name: 'Summit — Adaptive daily ACT training',
        short_name: 'Summit',
        description:
          'An independent, adaptive, offline-first ACT training coach. Not affiliated with ACT Education Corp.',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait-primary',
        theme_color: '#0c0d14',
        background_color: '#0c0d14',
        categories: ['education', 'productivity'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: "Start today's session",
            short_name: 'Daily',
            url: './#/session/daily',
          },
          {
            name: 'Review mistakes',
            short_name: 'Review',
            url: './#/review',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'act-pulse-fonts',
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
