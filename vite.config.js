import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/mdview/' : '/',
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: false
  }
});
