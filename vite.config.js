import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import DynamicPublicDirectory from 'vite-multiple-assets';

const dirAssets = [
  {
    input: 'models/**',
    output: '/models',
    flatten: false,
  },
  {
    input: 'public/**',
    output: '/',
    flatten: false,
  },
  {
    input: 'data/**',
    output: '/data',
    flatten: false,
  },
];

export default defineConfig({
  plugins: [react(), tailwindcss(), DynamicPublicDirectory(dirAssets)],
  publicDir: false,
  base: '/ldr-files/',
});
