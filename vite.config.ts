import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modoDev = true;
export const apiTarget = modoDev
    ? 'https://localhost:44300/api' // API local
    : 'https://api.hazi.grupo-campus.com/api'; // API real

export default defineConfig({
    build: {
        sourcemap: true,
        rollupOptions: {
            output: {
                entryFileNames: 'assets/[name].[hash].js',
                chunkFileNames: 'assets/[name].[hash].js',
                assetFileNames: 'assets/[name].[hash].[ext]',
            },
        },
    },
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        headers: {
            'access-control-allow-origin': '*',
            'Cache-Control': 'no-cache', //TODO borrar al finalizar el proyecto
        },
        proxy: {
            '/api': {
                target: apiTarget,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '/api'),
            },
        },
    },
});
