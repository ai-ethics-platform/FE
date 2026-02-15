import React, { useEffect } from 'react';
import Router from './core/router';
import useScrollRestore from './hooks/useScrollRestore';
import './utils/imageDebugger'; // 이미지 디버깅 유틸 로드

function App() {
  useScrollRestore();

  // 개발 환경에서만 이미지 디버깅 도구 안내
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔍 이미지 디버깅 도구가 활성화되었습니다.');
      console.log('💡 사용 가능한 명령어:');
      console.log('  - window.runFullImageDebug() : 전체 이미지 디버깅');
      console.log('  - window.debugAllImages() : 페이지의 모든 이미지 상태 확인');
      console.log('  - window.testImageUrl("URL") : 특정 URL 테스트');
      console.log('  - window.debugStoredImageUrls() : localStorage의 이미지 URL 확인');
      console.log('  - window.debugBrowserInfo() : 브라우저 정보 확인');
    }
  }, []);

  return (
    <Router />
  
  )
}

export default App;