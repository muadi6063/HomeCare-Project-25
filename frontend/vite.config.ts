import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Porten React-applikasjonen kjører på (http://localhost:3000)
    port: 3000,
    // Proxy-innstilling: Sender alle kall som starter med /api til .NET-serveren
    proxy: {
      '/api': {
        // Kontroller at 5106 er korrekt port for HomecareApp (.NET)
        target: 'http://localhost:5106', 
        changeOrigin: true, // Endrer host-headeren til target-URLen
        secure: false,      // Trengs vanligvis ikke i utviklingsmiljøet
      },
    },
  },
});
