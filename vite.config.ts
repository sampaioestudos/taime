import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
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
