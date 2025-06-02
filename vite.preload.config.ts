import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main/preload.ts'),
      name: 'preload',
      fileName: 'preload',
      formats: ['cjs']
    },
    outDir: 'dist-electron',
    emptyOutDir: false, // Don't empty since main.js is also built here
    rollupOptions: {
      external: ['electron'],
      output: {
        entryFileNames: '[name].cjs'
      }
    },
    target: 'node18'
  },
  resolve: {
    alias: {
      '@main': path.resolve(__dirname, './src/main')
    }
  }
});
