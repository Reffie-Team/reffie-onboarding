import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // '@/' maps to 'src/' — use as: import Foo from '@/components/Foo'
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
