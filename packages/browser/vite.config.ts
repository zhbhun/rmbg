import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig((env) => {
  if (env.command === 'build') {
    return {
      build: {
        copyPublicDir: false,
        lib: {
          // Could also be a dictionary or array of multiple entry points
          entry: resolve(__dirname, 'src/runtime.ts'),
          name: 'rmbg',
          formats: ['iife'],
          // the proper extensions will be added
          fileName: 'rmbg-runtime'
        }
      }
    }
  }
  return {
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: '@rmbg/browser',
          replacement: '/src/index.ts'
        }
      ]
    }
  }
})
