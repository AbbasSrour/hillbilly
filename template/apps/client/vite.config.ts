// import { nitro } from 'nitro/vie';

import { fileURLToPath, URL } from 'node:url';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const config = defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
    dedupe: ['react', 'react-dom', '@tanstack/react-router', '@tanstack/router-core'],
  },
  optimizeDeps: {
    include: ['@hillbilly/ui', '@hillbilly/rbac', '@hillbilly/sdk', 'react-use'],
  },
  ssr: {
    noExternal: ['@hillbilly/ui', '@hillbilly/rbac', '@hillbilly/sdk', 'react-use'],
  },
  server: {
    host: 'localhost',
  },
  plugins: [
    devtools(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './paraglide',
      strategy: ['url'],
    }),
    // nitro(),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart({
      srcDirectory: '.',
      router: {
        routesDirectory: './app',
        virtualRouteConfig: './routes.ts',
      },
    }),
    viteReact({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
});

export default config;
