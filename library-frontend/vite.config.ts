import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-pdf'],
    exclude: ['pdfjs-dist']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  server: {
    fs: {
      // Разрешить доступ к файлам вне корневой директории проекта
      allow: ['..']
    }
  }
})
