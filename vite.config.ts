import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.tsx',
      name: 'DustidWidget',
      fileName: () => `widget.js`,
      formats: ['iife'], // 'iife' makes it a global <script> browser-compatible file
    },
    rollupOptions: {
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
      external: ['react', 'react-dom'], // avoids bundling React (optional)
    },
  },
})
