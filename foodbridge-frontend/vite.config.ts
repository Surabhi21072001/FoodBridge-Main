import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      // Overlay shows errors in browser without blanking the page
      overlay: true,
    },
    headers: {
      'Cache-Control': 'no-cache',
    },
  },
})
