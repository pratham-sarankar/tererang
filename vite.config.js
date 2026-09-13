import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  preview: {
    // Allow Cloud Run host when running `vite preview` in the container.
    // You can add more hosts here if you deploy to other regions or services.
    allowedHosts: [
      'localhost',
      '0.0.0.0',
      'tererang-frontend-917312759089.europe-west1.run.app',
    ],
  },
})
