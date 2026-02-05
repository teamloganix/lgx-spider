import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
const mountPath = process.env.MOUNT_PATH || '/';
const base = mountPath.endsWith('/') ? mountPath : `${mountPath}/`;

export default defineConfig({
  base,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      conditions: ['module', 'import', 'default'],
      alias: {
        '@islands': fileURLToPath(new URL('./src/islands', import.meta.url)),
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
        '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
        '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      },
    },
  },
  output: 'server',
  trailingSlash: 'ignore',
  server: { host: true },
  adapter: node({ mode: 'middleware' }),
  envPrefix: ['PUBLIC_', 'SPIDER_'],
});
