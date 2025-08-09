import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        },
        manifest: {
            name: 'taime - AI Time Manager',
            short_name: 'taime',
            description: 'An intelligent time management app that allows users to track time spent on individual tasks. It uses AI to categorize tasks and provide productivity insights.',
            theme_color: '#083344',
            background_color: '#030712',
            start_url: '.',
            display: 'standalone',
            icons: [
              {
                src: 'icon-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'icon-512x512.png',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: 'icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
      'process.env.GOOGLE_API_KEY': JSON.stringify(env.VITE_GOOGLE_API_KEY),
    },
    server: {
      proxy: {
        // This proxy is for local development only to bypass CORS issues with the Jira API.
        // In production, Vercel's serverless function in /api/jira.ts handles this.
        '/api': {
          target: 'http://127.0.0.1:3000', // Points to the Vercel dev server for serverless functions
          changeOrigin: true,
        }
      }
    }
  }
})