import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Performance optimizations
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Code splitting for better performance - only include used chunks
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const normalizedId = id.replace(/\\/g, '/');

            if (normalizedId.includes('/three/')) {
              return 'three';
            }
            if (normalizedId.includes('/gsap/')) {
              return 'gsap';
            }
            if (normalizedId.includes('/pdfjs-dist/')) {
              return 'pdf';
            }
            if (normalizedId.includes('/lottie-react/') || normalizedId.includes('/lottie-web/')) {
              return 'lottie';
            }
            if (normalizedId.includes('/react-pageflip/')) {
              return 'pageflip';
            }
            if (normalizedId.includes('/recharts/')) {
              return 'charts';
            }
            if (normalizedId.includes('/react-router') || normalizedId.includes('/@remix-run/router/')) {
              return 'router';
            }
            if (
              normalizedId.includes('/framer-motion/') ||
              normalizedId.includes('/lucide-react/') ||
              normalizedId.includes('/@radix-ui/')
            ) {
              return 'ui';
            }
            if (
              normalizedId.includes('/react/') ||
              normalizedId.includes('/react-dom/') ||
              normalizedId.includes('/scheduler/') ||
              normalizedId.includes('/@vitejs/')
            ) {
              return 'vendor';
            }
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
    ],
  },
  // Enable experimental features for better performance
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` };
      } else {
        return { relative: true };
      }
    },
  },
}));
