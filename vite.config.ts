import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        // The site, plus an unlinked styleguide used for design review.
        main: resolve(import.meta.dirname, 'index.html'),
        styleguide: resolve(import.meta.dirname, 'styleguide.html'),
      },
    },
  },
})
