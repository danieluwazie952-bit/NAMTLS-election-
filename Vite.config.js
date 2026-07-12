import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',  // <- CHANGED THIS FROM '/' to './'
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
