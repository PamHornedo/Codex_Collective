import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Use base path for GitHub Pages in production, root path for dev
  base: mode === 'production' ? '/Codex_Collective/' : '/',
}))