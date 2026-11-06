import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

// alias 는 tsconfig.json 의 paths 를 vite 8 의 resolve.tsconfigPaths 가 자동 처리하므로
// 별도 alias 블록을 두지 않는다. (중복 제거)

// https://vitejs.dev/config/
export default defineConfig({
  base: '/study/BookReading/', // base: '/public/',
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        /**
         * vendor chunk 전략:
         *   - react-vendor: react, react-dom, react-i18next, i18next 등 React 런타임
         *   - vendor: 그 외 모든 node_modules (axios, lodash, styled-components 등)
         * 과도한 세분화(패키지별 1 chunk) 는 HTTP 요청 오버헤드가 커지므로,
         * cache invalidation 과 요청 수의 균형을 위해 2 group 으로 단순화한다.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (
            /node_modules[\\/]react(-dom|-i18next)?[\\/]/.test(id) ||
            /node_modules[\\/]i18next[\\/]/.test(id) ||
            /node_modules[\\/]scheduler[\\/]/.test(id)
          ) {
            return 'react-vendor'
          }
          return 'vendor'
        },
      },
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3030,
    strictPort: true,
    hmr: {
      clientPort: 3030,
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
      },
    },
  },
  plugins: [
    react(),
    svgr(),
    {
      name: 'guide-test-ref',
      transformIndexHtml(html, ctx) {
        if (!ctx.server) return html
        return html.replace(
          '</head>',
          `<script>;(function(){var p=new URLSearchParams(location.search),r=p.get('_ref');if(r){try{window.REF=JSON.parse(atob(decodeURIComponent(r)))}catch(e){}}})();</script>\n</head>`,
        )
      },
    },
  ],
})
