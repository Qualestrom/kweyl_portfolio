import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('framer-motion') || id.includes('motion')) return 'vendor-framer';
            if (id.includes('konva') || id.includes('react-konva')) return 'vendor-konva';
            if (id.includes('pdfjs-dist')) return 'vendor-pdf';
            if (id.includes('lucide-react')) return 'vendor-icons';
          }
        },
      },
    },
  },
});
