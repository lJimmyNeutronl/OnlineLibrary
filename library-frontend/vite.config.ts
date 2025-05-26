import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-pdf'],
    exclude: []
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist'],
        },
      },
    },
  },
  server: {
    fs: {
      // Разрешить доступ к файлам вне корневой директории проекта
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      // Убедитесь, что 'web-worker:' импорты работают правильно
      'worker-loader!pdfjs-dist/build/pdf.worker': 'pdfjs-dist/build/pdf.worker'
    }
  }
})
