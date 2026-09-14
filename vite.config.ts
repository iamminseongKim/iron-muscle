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
  server: { host: true, port: 3000 }
})
