import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  root: '.',
  server: {
    port: 3000,
    open: '/demo/index.html',
  },
  define: {
    __USERSCRIPT_BUILD__: 'false',
  },
});
