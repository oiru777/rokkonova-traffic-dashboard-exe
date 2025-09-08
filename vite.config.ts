import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    strictPort: true, // 5173 が使えなければエラーにする（5174に逃げない）
    open: false       // 起動時にブラウザを開かない
  }
})
