import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/chat': 'http://127.0.0.1:8000',
      '/weather': 'http://127.0.0.1:8000',
      '/geocode': 'http://127.0.0.1:8000',
      '/alerts': 'http://127.0.0.1:8000',
      '/advisory': 'http://127.0.0.1:8000',
      '/languages': 'http://127.0.0.1:8000',
    },
  },
  build: {
    outDir: '../app/static',
    emptyOutDir: false,
  },
});
