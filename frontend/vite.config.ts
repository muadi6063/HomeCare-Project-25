import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Porten React-applikasjonen kjører på (http://localhost:3000)
    port: 3000,
    // Proxy-innstilling: Sender alle kall som starter med /api til .NET-serveren
    proxy: {
      '/api': {
        target: 'http://localhost:5011', 
        changeOrigin: true, // Endrer host-headeren til target-URLen
        secure: false,
      },
    },
  },
});
