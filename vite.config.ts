import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
  },
  optimizeDeps: {
    exclude: ['monaco-editor'],
  },
  worker: {
    format: 'es',
  },
})
