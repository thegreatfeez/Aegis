import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util',
      events: 'events',
      buffer: 'buffer',
      // Standard Node.js polyfill aliases
      assert: 'assert',
      os: 'os-browserify',
      path: 'path-browserify',
      url: 'url',
      zlib: 'browserify-zlib',
      http: 'stream-http',
      https: 'https-browserify',
      punycode: 'punycode',
      querystring: 'querystring-es3',
      string_decoder: 'string_decoder',
      timers: 'timers-browserify',
      vm: 'vm-browserify',
    },
  },
})
