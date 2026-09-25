import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@codemirror') || id.includes('@uiw/react-codemirror') || id.includes('@lezer')) {
            return 'vendor-codemirror';
          }
          if (id.includes('katex')) {
            return 'vendor-katex';
          }
          if (id.includes('marked') || id.includes('dompurify')) {
            return 'vendor-markdown';
          }
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
        }
      }
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: false
  }
});
