import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineConfig({
  base: './',
  plugins: [react(), {
    name: 'compact-offline-assets',
    closeBundle() {
      // Source models and screenshots remain in the repository, outside the shipped app.
      rmSync(resolve('dist/screenshots'), { recursive: true, force: true })
      rmSync(resolve('dist/anatomy/mesh_mapping.json'), { force: true })
    }
  }],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          if (id.includes('src/data/exercises.ts') || id.includes('src/data/additionalExercises.ts')) {
            return 'data-exercises';
          }
          if (id.includes('src/i18n/locales/')) {
            return 'i18n-locales';
          }
        }
      }
    }
  },
  server: { host: true, port: 3000 }
})
