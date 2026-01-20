import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false
    },
    port: 5173
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    force: true,
    include: ['react', 'react-dom', 'lucide-react', 'axios']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})