import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/pandemic-simulation/',
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  assetsInclude: ['**/*.jpg', '**/*.png', '**/*.gif', '**/*.svg'],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  resolve: {
    alias: [
      { find: '@', replacement: '/src' }
    ]
  }
});
