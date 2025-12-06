import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
    plugins: [
        react(),
        cssInjectedByJsPlugin(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        outDir: 'dist-sdk',
        lib: {
            entry: path.resolve(__dirname, 'src/sdk/main.tsx'),
            name: 'PatraSDK',
            fileName: (format) => `patra-sdk.${format}.js`,
            formats: ['umd', 'es']
        },
        rollupOptions: {
            // We bundle React and ReactDOM because the host site likely doesn't have them
            // If we wanted a smaller bundle, we'd externalize them, but for a drop-in SDK, bundling is safer.
            external: [],
            output: {
                globals: {}
            }
        },
        // Minify for production
        minify: 'esbuild',
    },
    define: {
        'process.env': {} // Polyfill for some libs
    }
});
