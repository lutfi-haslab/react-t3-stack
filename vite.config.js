import { telefunc } from 'telefunc/vite'
// import type { UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const port = 3000

export default {
  plugins: [
    nodePolyfills(),
    react(),
    TanStackRouterVite(),
    tailwindcss(),
    // @ts-ignore
    telefunc({
      disableNamingConvention: true
    })
  ],
  build: { target: 'esnext' },
  appType: 'spa',
  server: { port, host: true },
  preview: { port },
  define: {
    'process.env': {}
  }
}