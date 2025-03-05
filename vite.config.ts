import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables based on mode (development, production, etc)
  const env = loadEnv(mode, process.cwd())
  
  return {
    // Plugins
    plugins: [
      react({
        // Enable Fast Refresh (HMR for React components)
        fastRefresh: true,
        // Optional: JSX runtime configuration
        // jsxRuntime: 'automatic',
      }),
      // Add more plugins as needed
      // Example: imagemin({ /* options */ }),
    ],
    
    // Resolve configuration
    resolve: {
      // Set up path aliases for cleaner imports
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@assets': path.resolve(__dirname, './src/assets'),
      },
    },
    
    // Development server options
    server: {
      // Configure port
      port: 3000,
      // Auto open browser on server start
      open: true,
      // Configure CORS
      cors: true,
      // Configure proxy for API requests
      proxy: {
        // Forward /api requests to your backend
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    
    // CSS configuration
    css: {
      // Configure preprocessors if needed
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`,
        },
      },
      // CSS modules configuration
      modules: {
        // Generate scoped class names in dev mode
        generateScopedName: mode === 'development' 
          ? '[name]__[local]__[hash:base64:5]' 
          : '[hash:base64:8]',
      },
    },
    
    // Build configuration
    build: {
      // Output directory
      outDir: 'dist',
      // Target browsers
      target: 'es2015',
      // Split chunks for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor code (node_modules) into separate chunk
            vendor: ['react', 'react-dom'],
            // Other custom chunks as needed
          },
        },
      },
      // Source maps in production
      sourcemap: mode !== 'production',
      // Minification options
      minify: 'terser',
      terserOptions: {
        compress: {
          // Remove console.logs in production
          drop_console: mode === 'production',
        },
      },
    },
    
    // Enable global variables - useful for feature flags
    define: {
      // Example: make process.env.NODE_ENV available in client code
      'process.env.NODE_ENV': JSON.stringify(mode),
      // Custom environment variables
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __API_URL__: JSON.stringify(env.VITE_API_URL || ''),
    },
  }
})
