import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const root = new URL('.', import.meta.url).pathname
  const env = loadEnv(mode, root, '')
  const port = Number(env.VITE_PORT || 5200)
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        },
        manifest: {
          name: 'Baby Tracker',
          short_name: 'BabyTracker',
          description: 'Track feeds, diapers, sleep, growth, and health',
          theme_color: '#0ea5e9',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [],
        },
      }),
    ],
    server: {
      port,
      strictPort: true,
    },
  }
})
