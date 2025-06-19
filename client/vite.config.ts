import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://chatapp-server-jeiz.onrender.com',
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), tailwindcss()],
})
