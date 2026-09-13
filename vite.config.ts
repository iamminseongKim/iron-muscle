import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { gzipSync } from 'node:zlib'
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineConfig({
  base: './',
  plugins: [react(), {
    name: 'compact-offline-assets',
    closeBundle() {
      // Source models and screenshots remain in the repository, outside the shipped app.
      for (const name of ['anatomy', 'skeleton']) {
        const file = resolve(`dist/anatomy/${name}.glb`)
        writeFileSync(`${file}.gz`, gzipSync(readFileSync(file), { level: 9 }))
      }
      rmSync(resolve('dist/screenshots'), { recursive: true, force: true })
      rmSync(resolve('dist/anatomy/mesh_mapping.json'), { force: true })
    }
  }],
  server: { host: true, port: 3000 }
})
