import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// `base` is set for production so assets resolve under the GitHub Pages path
// (https://<user>.github.io/icemaker-helper/). Dev keeps the root path.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/icemaker-helper/' : '/',
  plugins: [react(), tailwindcss()],
  // Ensure a single copy of three is bundled (drei/three-stdlib can pull their
  // own), which avoids the "Multiple instances of Three.js" warning.
  resolve: {
    dedupe: ['three'],
  },
}))
