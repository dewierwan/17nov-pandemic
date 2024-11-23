import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/pandemic-simulation/',
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  assetsInclude: ['**/*.jpg', '**/*.png', '**/*.gif'],
});