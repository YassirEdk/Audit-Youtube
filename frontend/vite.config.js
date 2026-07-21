import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Keeps dev same-origin like production, so no CORS config is needed.
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
