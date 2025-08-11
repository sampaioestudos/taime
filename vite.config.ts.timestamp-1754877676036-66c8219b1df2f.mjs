// vite.config.ts
import { defineConfig, loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///home/project/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg}"]
        },
        manifest: {
          name: "taime - AI Time Manager",
          short_name: "taime",
          description: "An intelligent time management app that allows users to track time spent on individual tasks. It uses AI to categorize tasks and provide productivity insights.",
          theme_color: "#083344",
          background_color: "#030712",
          start_url: ".",
          display: "standalone",
          icons: [
            {
              src: "icon-192x192.png",
              sizes: "192x192",
              type: "image/png"
            },
            {
              src: "icon-512x512.png",
              sizes: "512x512",
              type: "image/png"
            },
            {
              src: "icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable"
            }
          ]
        }
      })
    ],
    define: {
      "process.env.API_KEY": JSON.stringify(env.VITE_GEMINI_API_KEY),
      "process.env.GOOGLE_CLIENT_ID": JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
      "process.env.GOOGLE_API_KEY": JSON.stringify(env.VITE_GOOGLE_API_KEY)
    },
    server: {
      proxy: {
        // This proxy is for local development only to bypass CORS issues with the Jira API.
        // In production, Vercel's serverless function in /api/jira.ts handles this.
        "/api": {
          target: "http://127.0.0.1:3000",
          // Points to the Vercel dev server for serverless functions
          changeOrigin: true
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSdcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCAnLicsICcnKTtcbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICByZWFjdCgpLFxuICAgICAgVml0ZVBXQSh7XG4gICAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxuICAgICAgICBpbmplY3RSZWdpc3RlcjogJ2F1dG8nLFxuICAgICAgICB3b3JrYm94OiB7XG4gICAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLGljbyxwbmcsc3ZnfSddXG4gICAgICAgIH0sXG4gICAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgICAgICBuYW1lOiAndGFpbWUgLSBBSSBUaW1lIE1hbmFnZXInLFxuICAgICAgICAgICAgc2hvcnRfbmFtZTogJ3RhaW1lJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQW4gaW50ZWxsaWdlbnQgdGltZSBtYW5hZ2VtZW50IGFwcCB0aGF0IGFsbG93cyB1c2VycyB0byB0cmFjayB0aW1lIHNwZW50IG9uIGluZGl2aWR1YWwgdGFza3MuIEl0IHVzZXMgQUkgdG8gY2F0ZWdvcml6ZSB0YXNrcyBhbmQgcHJvdmlkZSBwcm9kdWN0aXZpdHkgaW5zaWdodHMuJyxcbiAgICAgICAgICAgIHRoZW1lX2NvbG9yOiAnIzA4MzM0NCcsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnIzAzMDcxMicsXG4gICAgICAgICAgICBzdGFydF91cmw6ICcuJyxcbiAgICAgICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcbiAgICAgICAgICAgIGljb25zOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzcmM6ICdpY29uLTE5MngxOTIucG5nJyxcbiAgICAgICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzcmM6ICdpY29uLTUxMng1MTIucG5nJyxcbiAgICAgICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzcmM6ICdpY29uLTUxMng1MTIucG5nJyxcbiAgICAgICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdhbnkgbWFza2FibGUnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICBdLFxuICAgIGRlZmluZToge1xuICAgICAgJ3Byb2Nlc3MuZW52LkFQSV9LRVknOiBKU09OLnN0cmluZ2lmeShlbnYuVklURV9HRU1JTklfQVBJX0tFWSksXG4gICAgICAncHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9JRCc6IEpTT04uc3RyaW5naWZ5KGVudi5WSVRFX0dPT0dMRV9DTElFTlRfSUQpLFxuICAgICAgJ3Byb2Nlc3MuZW52LkdPT0dMRV9BUElfS0VZJzogSlNPTi5zdHJpbmdpZnkoZW52LlZJVEVfR09PR0xFX0FQSV9LRVkpLFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwcm94eToge1xuICAgICAgICAvLyBUaGlzIHByb3h5IGlzIGZvciBsb2NhbCBkZXZlbG9wbWVudCBvbmx5IHRvIGJ5cGFzcyBDT1JTIGlzc3VlcyB3aXRoIHRoZSBKaXJhIEFQSS5cbiAgICAgICAgLy8gSW4gcHJvZHVjdGlvbiwgVmVyY2VsJ3Mgc2VydmVybGVzcyBmdW5jdGlvbiBpbiAvYXBpL2ppcmEudHMgaGFuZGxlcyB0aGlzLlxuICAgICAgICAnL2FwaSc6IHtcbiAgICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTI3LjAuMC4xOjMwMDAnLCAvLyBQb2ludHMgdG8gdGhlIFZlcmNlbCBkZXYgc2VydmVyIGZvciBzZXJ2ZXJsZXNzIGZ1bmN0aW9uc1xuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsY0FBYyxlQUFlO0FBQy9QLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFHeEIsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxLQUFLLEVBQUU7QUFDakMsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04sUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFFBQ2QsZ0JBQWdCO0FBQUEsUUFDaEIsU0FBUztBQUFBLFVBQ1AsY0FBYyxDQUFDLGdDQUFnQztBQUFBLFFBQ2pEO0FBQUEsUUFDQSxVQUFVO0FBQUEsVUFDTixNQUFNO0FBQUEsVUFDTixZQUFZO0FBQUEsVUFDWixhQUFhO0FBQUEsVUFDYixhQUFhO0FBQUEsVUFDYixrQkFBa0I7QUFBQSxVQUNsQixXQUFXO0FBQUEsVUFDWCxTQUFTO0FBQUEsVUFDVCxPQUFPO0FBQUEsWUFDTDtBQUFBLGNBQ0UsS0FBSztBQUFBLGNBQ0wsT0FBTztBQUFBLGNBQ1AsTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxLQUFLO0FBQUEsY0FDTCxPQUFPO0FBQUEsY0FDUCxNQUFNO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxjQUNFLEtBQUs7QUFBQSxjQUNMLE9BQU87QUFBQSxjQUNQLE1BQU07QUFBQSxjQUNOLFNBQVM7QUFBQSxZQUNYO0FBQUEsVUFDRjtBQUFBLFFBQ0o7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNIO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTix1QkFBdUIsS0FBSyxVQUFVLElBQUksbUJBQW1CO0FBQUEsTUFDN0QsZ0NBQWdDLEtBQUssVUFBVSxJQUFJLHFCQUFxQjtBQUFBLE1BQ3hFLDhCQUE4QixLQUFLLFVBQVUsSUFBSSxtQkFBbUI7QUFBQSxJQUN0RTtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sT0FBTztBQUFBO0FBQUE7QUFBQSxRQUdMLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQTtBQUFBLFVBQ1IsY0FBYztBQUFBLFFBQ2hCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
