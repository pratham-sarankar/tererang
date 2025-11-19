import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
