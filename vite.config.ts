import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/pandemic-simulator/',
  server: {
    port: 3000
  },
  assetsInclude: ['**/*.jpg', '**/*.png', '**/*.gif'],
});