import { telefunc } from 'telefunc/vite'
import type { UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import tailwindcss from '@tailwindcss/vite'

const port = 3000

export default {
  plugins: [
    react(),
    TanStackRouterVite(),
    tailwindcss(),
    // @ts-ignore
    telefunc({
      disableNamingConvention: true
    })
  ],
  build: { target: 'esnext' },
  appType: 'mpa',
  server: { port, host: true },
  preview: { port }
} as UserConfig