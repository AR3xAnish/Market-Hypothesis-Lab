import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Use deployed Render backend (or switch to 'http://localhost:5000' for local dev)
        target: 'https://market-hypothesis-lab-backend.onrender.com',
        changeOrigin: true,
      },
    },
  },
});
