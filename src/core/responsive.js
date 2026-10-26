import { useEffect, useState } from 'react';

// /r/* 로 진입하면 반응형 모드. basename 으로 처리하므로 기존 navigate('/game02') 가 자동으로 /r/game02 가 된다.
export const IS_RESPONSIVE = /^\/r(\/|$)/.test(window.location.pathname);
export const BASENAME = IS_RESPONSIVE ? '/r' : '/';
// window.location.href 처럼 router 를 거치지 않는 이동용 (로그인 화면)
export const HOME = IS_RESPONSIVE ? '/r' : '/';

export const PHONE_MAX = 600;
export const TABLET_MAX = 1180;

export function useViewportWidth() {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => {
    if (!IS_RESPONSIVE) return undefined; // 기존 URL 에서는 resize 구독도 하지 않는다
    const f = () => setW(window.innerWidth);
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  return w;
}

// /r 모드이면서 폭이 폰·태블릿(<=1180)일 때 true. 데스크톱 URL 에서는 항상 false.
export function useIsMobile(max = TABLET_MAX) {
  const w = useViewportWidth();
  return IS_RESPONSIVE && w <= max;
}

// /r 모드이면서 601~1180px (태블릿 세로·가로). 폰은 false.
export function useIsTablet() {
  const w = useViewportWidth();
  return IS_RESPONSIVE && w > PHONE_MAX && w <= TABLET_MAX;
}
