import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build timestamp so deployed version can be verified (no-cache for index.html)
const buildId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify(buildId),
  },
  plugins: [
    react(),
    // Inject build id into built index.html for cache verification
    {
      name: 'inject-build-id',
      transformIndexHtml(html) {
        return html.replace(
          /<meta name="version" content="[^"]*"\s*\/?>/,
          `<meta name="version" content="${buildId}" />`
        );
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:6969', changeOrigin: true },
      '/static': { target: 'http://127.0.0.1:6969', changeOrigin: true },
    },
  },
  build: {
    // Ensure fresh builds by clearing output directory
    emptyOutDir: true,
    // Generate source maps for debugging (optional)
    sourcemap: false,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        // Add hash to filenames for cache busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
});
