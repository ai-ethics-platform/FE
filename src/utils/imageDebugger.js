// utils/imageDebugger.js
// 이미지 로드 문제 디버깅을 위한 유틸리티

/**
 * 페이지의 모든 이미지 로드 상태를 확인
 */
export function debugAllImages() {
  const images = document.querySelectorAll('img');
  const results = {
    total: images.length,
    loaded: 0,
    failed: 0,
    pending: 0,
    details: []
  };

  images.forEach((img, index) => {
    const status = img.complete 
      ? (img.naturalWidth > 0 ? 'loaded' : 'failed')
      : 'pending';
    
    if (status === 'loaded') results.loaded++;
    else if (status === 'failed') results.failed++;
    else results.pending++;

    results.details.push({
      index,
      src: img.src,
      alt: img.alt,
      status,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayWidth: img.width,
      displayHeight: img.height,
      crossOrigin: img.crossOrigin,
    });
  });

  console.table(results.details);
  console.log('📊 이미지 로드 요약:', {
    total: results.total,
    loaded: results.loaded,
    failed: results.failed,
    pending: results.pending,
  });

  return results;
}

/**
 * 특정 이미지 URL이 로드 가능한지 테스트
 */
export function testImageUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const timeout = setTimeout(() => {
      reject(new Error('이미지 로드 타임아웃 (10초)'));
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      console.log('✅ 이미지 로드 성공:', {
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      resolve({
        success: true,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = (e) => {
      clearTimeout(timeout);
      console.error('❌ 이미지 로드 실패:', {
        url,
        error: e,
      });
      reject(new Error('이미지 로드 실패'));
    };

    img.src = url;
  });
}

/**
 * localStorage에 저장된 모든 이미지 URL 확인
 */
export function debugStoredImageUrls() {
  const imageKeys = [
    'role_image_1',
    'role_image_2',
    'role_image_3',
    'dilemma_image_1',
    'dilemma_image_2',
    'dilemma_image_3',
    'dilemma_image_4_1',
    'dilemma_image_4_2',
    'dilemma_image_4_3',
    'dilemma_image_5_1',
    'dilemma_image_5_2',
    'dilemma_image_5_3',
    'dilemma_image_6_1',
    'dilemma_image_6_2',
    'dilemma_image_6_3',
  ];

  const results = [];
  
  imageKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value && value !== '-' && value.trim() !== '') {
      results.push({
        key,
        value,
        isAbsolute: value.startsWith('http://') || value.startsWith('https://'),
        isDataUrl: value.startsWith('data:'),
      });
    }
  });

  console.table(results);
  console.log('📦 저장된 이미지 URL 개수:', results.length);
  
  return results;
}

/**
 * 브라우저 정보 출력
 */
export function debugBrowserInfo() {
  const info = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    vendor: navigator.vendor,
    // 브라우저 종류 추정
    isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    isChrome: /chrome/i.test(navigator.userAgent) && !/edge/i.test(navigator.userAgent),
    isFirefox: /firefox/i.test(navigator.userAgent),
    isEdge: /edge/i.test(navigator.userAgent),
    // 모바일 여부
    isMobile: /mobile|android|iphone|ipad|ipod/i.test(navigator.userAgent),
    isIOS: /iphone|ipad|ipod/i.test(navigator.userAgent),
    isAndroid: /android/i.test(navigator.userAgent),
  };

  console.log('🌐 브라우저 정보:', info);
  return info;
}

/**
 * 전체 이미지 디버깅 실행
 */
export function runFullImageDebug() {
  console.log('🔍 === 이미지 디버깅 시작 ===');
  
  debugBrowserInfo();
  debugStoredImageUrls();
  debugAllImages();
  
  console.log('🔍 === 이미지 디버깅 완료 ===');
  console.log('💡 특정 URL 테스트: window.testImageUrl("URL")');
}

// 전역에서 사용할 수 있도록 window 객체에 추가
if (typeof window !== 'undefined') {
  window.debugAllImages = debugAllImages;
  window.testImageUrl = testImageUrl;
  window.debugStoredImageUrls = debugStoredImageUrls;
  window.debugBrowserInfo = debugBrowserInfo;
  window.runFullImageDebug = runFullImageDebug;
}

