import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // <-- THIS IS THE FIX
  build: {
    chunkSizeWarningLimit: 1000 // 1000kb instead
  }
})
