import { defineConfig } from 'vite';
import { resolve } from 'path';

/* Content script build: single IIFE entry, no code splitting */
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false, // don't wipe the main build
    lib: {
      entry: resolve(__dirname, 'src/content/serp.ts'),
      name: 'SearchSanity',
      formats: ['iife'],
      fileName: () => 'content/serp.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    modulePreload: false,
  },
  publicDir: false,
});
