import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { apiPlugin } from './server/api-plugin.js'

export default defineConfig(({ mode }) => {
  // Server-only keys (GEMINI_*) go into process.env for the API routes.
  // Only VITE_* keys ever reach the browser.
  Object.assign(process.env, loadEnv(mode, process.cwd(), 'GEMINI_'))
  return {
    // HTTPS is needed so phone browsers allow the camera.
    plugins: [react(), basicSsl(), apiPlugin()],
    server: { host: true },
  }
})
