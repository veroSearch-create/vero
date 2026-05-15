import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';

/* Copy CSS files into dist/popup/ after build so popup.html can reference them */
function copyPopupCss(): Plugin {
  return {
    name: 'copy-popup-css',
    closeBundle() {
      const distPopup = resolve(__dirname, 'dist', 'popup');
      mkdirSync(distPopup, { recursive: true });
      const files: [string, string][] = [
        ['src/styles/tokens.css',     'dist/popup/tokens.css'],
        ['src/styles/reset.css',      'dist/popup/reset.css'],
        ['src/styles/components.css', 'dist/popup/components.css'],
        ['src/popup/popup.css',       'dist/popup/popup.css'],
      ];
      for (const [src, dst] of files) {
        copyFileSync(resolve(__dirname, src), resolve(__dirname, dst));
      }
    },
  };
}

/* Main build: popup + service worker (ESM/IIFE, no content script) */
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.ts'),
        sw:    resolve(__dirname, 'src/background/sw.ts'),
      },
      output: {
        format: 'es',
        entryFileNames: (chunk) => {
          if (chunk.name === 'popup') return 'popup/popup.js';
          if (chunk.name === 'sw')    return 'background/sw.js';
          return '[name].js';
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
    modulePreload: false,
  },
  publicDir: 'public',
  plugins: [copyPopupCss()],
});
