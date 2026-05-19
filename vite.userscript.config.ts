import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: '__ROVE__',
      formats: ['iife'],
      fileName: () => 'rove.user.js',
    },
    outDir: 'dist/userscript',
    rollupOptions: {
      output: {
        extend: true,
        globals: {},
      },
    },
  },
  define: {
    __USERSCRIPT_BUILD__: 'true',
  },
});
