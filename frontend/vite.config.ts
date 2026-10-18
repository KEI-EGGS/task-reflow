import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // /api で始まるリクエストだけバックエンドへ転送する．
    // ブラウザから見ると同一オリジンなので，CORS の設定が要らない
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
