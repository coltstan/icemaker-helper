import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// `base` is set for production so assets resolve under the GitHub Pages path
// (https://<user>.github.io/icemaker-helper/). Dev keeps the root path.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/icemaker-helper/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'IceMaker Helper — KUIX505ESS2',
        short_name: 'IceMaker',
        description:
          '3D parts explorer & guided troubleshooter for the KitchenAid KUIX505ESS2 ice maker.',
        theme_color: '#0a0a0b',
        background_color: '#0a0a0b',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  // Ensure a single copy of three is bundled (drei/three-stdlib can pull their
  // own), which avoids the "Multiple instances of Three.js" warning.
  resolve: {
    dedupe: ['three'],
  },
}))
