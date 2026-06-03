import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_TARGET,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        '/ws-proxy': {
          target: env.VITE_WS_TARGET,
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ws-proxy/, '')
        }
      }
    }
  };
});