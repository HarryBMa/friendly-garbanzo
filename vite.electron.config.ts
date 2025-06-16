import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main/main.ts'),
      name: 'main',
      fileName: 'main',
      formats: ['cjs']
    },
    outDir: 'dist-electron',
    emptyOutDir: true,    rollupOptions: {
      external: ['electron', 'exceljs', 'path', 'url', 'fs', 'fs/promises'],
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
