import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    assetsInlineLimit: 0, // 모든 이미지를 별도 파일로 (인라인 방지)
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // 이미지 파일명 패턴 유지
          const info = assetInfo.name.toLowerCase();
          if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(info)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  // ✅ 이미지 파일을 static asset으로 명시적 처리
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.gif', '**/*.svg', '**/*.webp'],
})
