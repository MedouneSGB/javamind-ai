import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
  plugins: [react(), tailwindcss()],
  define: {
    // Expose les clés .env au renderer web (sans préfixe VITE_)
    'import.meta.env.VITE_ANTHROPIC_API_KEY': JSON.stringify(env.ANTHROPIC_API_KEY ?? ''),
    'import.meta.env.VITE_GEMINI_API_KEY':    JSON.stringify(env.GEMINI_API_KEY ?? ''),
    'import.meta.env.VITE_OPENAI_API_KEY':    JSON.stringify(env.OPENAI_API_KEY ?? ''),
    'import.meta.env.VITE_OLLAMA_URL':        JSON.stringify(env.OLLAMA_URL ?? ''),
  },
  base: '/',
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
  }
})
