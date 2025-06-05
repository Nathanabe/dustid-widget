import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.tsx',
      name: 'DustidWidget',
      // Remove fileName here, set in rollupOptions.output
      formats: ['umd', 'es']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: [
        {
          format: 'umd',
          entryFileNames: 'dustid-widget.umd.js',
          name: 'DustidWidget',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM'
          }
        },
        {
          format: 'es',
          entryFileNames: 'dustid-widget.js'
        }
      ]
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
})