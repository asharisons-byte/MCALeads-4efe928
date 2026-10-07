import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// PREVIEW-ONLY build config (not used by the real app)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: 'firebase/auth', replacement: path.resolve(__dirname, 'src/preview/stubAuth.ts') },
      { find: 'firebase/app', replacement: path.resolve(__dirname, 'src/preview/stubApp.ts') },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
  build: { outDir: 'dist-preview', rollupOptions: { input: path.resolve(__dirname, 'preview.html') }, chunkSizeWarningLimit: 4000 },
  base: './',
});
