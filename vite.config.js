import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// Where the deployed app lives: https://swc.iitg.ac.in/shivalik-inventory/.
// Production builds (and `vite preview` of them) are served under this path;
// the dev server stays at "/" so local URLs and the e2e suite are unchanged.
// Override either with BASE_PATH in the shell or `.env`.
const DEPLOYED_BASE = '/shivalik-inventory/'

// https://vite.dev/config/
export default defineConfig(({ command, mode, isPreview }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.BASE_PATH || (command === 'build' || isPreview ? DEPLOYED_BASE : '/')

  // Django's root is mounted at `<base>api`, prefix stripped — exactly what
  // production nginx does (`/shivalik-inventory/api/…` reaches Django as
  // `/…`). Mirroring it here means the API paths in src/lib/api/client.js
  // are the same locally as in production. Read from the shell or `.env` —
  // the e2e suite points it at its own Django on another port.
  const apiTarget = env.API_PROXY_TARGET || 'http://localhost:8000'
  const apiMount = `${base}api`
  const proxy = {
    [apiMount]: {
      target: apiTarget,
      changeOrigin: true,
      rewrite: (path) => path.slice(apiMount.length) || '/',
    },
  }

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    server: { proxy },
    preview: { proxy },
  }
})
