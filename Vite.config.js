import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: { outDir: 'dist' }
})
    export default {
      base: './',  <-- ADD THIS LINE
      // ...rest of your code
    }
