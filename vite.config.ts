import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue({
    features: {
      propsDestructure: true,
      customElement: true,
    },
  }), tailwindcss(), tsconfigPaths(), vueDevTools()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})