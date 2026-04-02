import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Esto abre la puerta (0.0.0.0) para peticiones externas
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    proxy: {
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  preview: {
    host: true, // Esto abre la puerta en Producción
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173
  }
})
