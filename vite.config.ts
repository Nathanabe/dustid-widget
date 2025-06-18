import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({  plugins: [react()    ],
  define: {
   
    'process.env': {}, // prevents "process is not defined" error
  },
  build: {
    lib: {
      entry: 'src/index.tsx',
      name: 'DustidWidget',
      fileName: () => `widget.js`,
      formats: ['iife'], // 'iife' makes it a global <script> browser-compatible file
    },
    rollupOptions: {
      output: {
      
      },
    },
  },
})
