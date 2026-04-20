import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@game': path.resolve(__dirname, 'src/game'),
      '@data': path.resolve(__dirname, 'src/game/data'),
      '@utils': path.resolve(__dirname, 'src/game/utils'),
      '@entities': path.resolve(__dirname, 'src/game/entity'),
      '@shared': path.resolve(__dirname, 'src/game/shared'),
      '@battle': path.resolve(__dirname, 'src/game/screens/Battle'),
      '@screens': path.resolve(__dirname, 'src/game/screens'),
      '@i18n': path.resolve(__dirname, 'src/i18n'),
    }
  },
  server: {
    port: 5173,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        // Force new filename hash on every build
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
      }
    }
  }
})
