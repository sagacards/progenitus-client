import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import NodeGlobalsPolyfillPlugin from '@esbuild-plugins/node-globals-polyfill';
import content from '@originjs/vite-plugin-content';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        sourcemap: 'inline',
    },
    envDir: './env',
    envPrefix: 'PROGENITUS_',
    plugins: [
        react(),
        tsconfigPaths(),
        content({
            xml: {
                enabled: true,
            },
        }),
    ],
    define: {
        global: 'window',
    },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true,
                }),
            ],
        },
    },
});
