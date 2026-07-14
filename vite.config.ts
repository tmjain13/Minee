import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const isProd = mode === 'production';
  
  return {
    plugins: [
      react(), 
      tailwindcss(),
      // 🛡️ OBFUSCATION: Removed to troubleshoot build artifact issues
      ...(process.env.ANALYZE === 'true' ? [
        visualizer({
          open: false,
          filename: 'dist/stats.html',
          gzipSize: true,
          brotliSize: true,
        })
      ] : []),
      ...(process.env.SENTRY_AUTH_TOKEN ? [
        sentryVitePlugin({
          org: "terapanth-ai",
          project: "terapanth-ai-hub",
          errorHandler(err) {
            console.warn("Sentry upload failed, ignoring to prevent build failure:", err);
          }
        })
      ] : []),
      VitePWA({
        registerType: 'prompt',
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        manifest: {
          name: 'Terapanth AI Hub',
          short_name: 'Terapanth AI',
          description: 'Unified spiritual engine for Terapanth',
          theme_color: '#FCF8F2',
          background_color: '#FCF8F2',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: '/assets/logos/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/assets/logos/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 3000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@xenova/transformers')) return 'transformers';
              if (id.includes('html2canvas') || id.includes('jspdf')) return 'export-tools';
              if (id.includes('firebase')) return 'firebase';
              return 'vendor';
            }
          },
          chunkFileNames: (chunkInfo) => {
            let name = chunkInfo.name;
            if (name && name.includes('Error')) {
              name = name.replace(/Error/g, 'Err');
            }
            return `assets/${name}-[hash].js`;
          },
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            let name = assetInfo.name || '';
            if (name && name.includes('Error')) {
              name = name.replace(/Error/g, 'Err');
            }
            return `assets/${name}-[hash].[ext]`;
          }
        }
      }
    },
    server: {
      host: true,
      allowedHosts: true,
      headers: {
        'Content-Security-Policy': "frame-ancestors 'self' https://studio.google.com https://*.google.com https://*.googleusercontent.com https://*.run.app;",
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR === 'true' ? false : { protocol: 'wss' },
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
