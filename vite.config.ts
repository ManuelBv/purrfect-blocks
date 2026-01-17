import { defineConfig } from 'vite';

export default defineConfig({
  base: '/purrfect-blocks/',
  build: {
    outDir: 'dist',
    minify: 'terser',
    assetsInlineLimit: 100000, // Inline assets smaller than 100KB as base64
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: undefined, // Single JS bundle
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
  },
  server: {
    port: 3000,
  },
});
