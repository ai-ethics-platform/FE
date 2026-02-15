// api/axiosInstance.js
import axios from 'axios';
// Vite 환경변수로 API baseURL을 바꿀 수 있게 함 (로컬/스테이징/프로덕션 공용)
// 예) VITE_API_BASE_URL=http://localhost:8000
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, '')
  : 'https://dilemmai-idl.com';

// 메인 axios 인스턴스 생성
const instance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  // CORS 관련 설정 추가 (이미지 로드 문제 대응)
  withCredentials: false, // 쿠키를 보내지 않으면 CORS가 더 관대함
});
// 상단 어딘가 공통 상수로 추가
const MAX_500_REFRESH_RETRY = 1; // 500에서 refresh 시도 최대 횟수 (원하면 2로 올려도 됨)

const isAuthRefreshRequest = (config) => {
  try {
    const url = (config?.url || '').toString();
    // 절대/상대 모두 커버: '/auth/refresh', 'https://.../auth/refresh'
    return url.endsWith('/auth/refresh') || url.includes('/auth/refresh?');
  } catch {
    return false;
  }
};

function parseJwtExpSec(token) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length < 2) return null;
    const b64url = parts[1];
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const json = atob(padded);
    const payload = JSON.parse(json);
    const exp = payload?.exp;
    const n = typeof exp === 'number' ? exp : Number(exp);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}


// 리프레쉬 토큰으로 새로운 액세스 토큰 요청
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) throw new Error('No refresh token available');

  try {
    // const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
    //   refresh_token: refreshToken,
    // });
    const { data } = await axios.post(
      `${API_BASE}/auth/refresh`,  // 1. URL
      {                            // 2. body (data)
        refresh_token: refreshToken,
      },
      {                            // 3. config (headers)
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("✅ Refresh 성공:", data);

    // data: { access_token, refresh_token?, token_type? }

    // 1) 응답에서 받은 토큰들을 즉시 저장
    if (data.access_token) localStorage.setItem('access_token', data.access_token);
    if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token); 
    if (data.token_type)    localStorage.setItem('token_type', data.token_type);

    // 2) axios 인스턴스 기본 헤더도 업데이트 
    const authValue = `${data.token_type || 'Bearer'} ${data.access_token}`;
    try {
      // axios v1: defaults.headers.common.Authorization 권장
      instance.defaults.headers.common = instance.defaults.headers.common || {};
      instance.defaults.headers.common.Authorization = authValue;
      // 레거시 호환
      instance.defaults.headers.Authorization = authValue;
    } catch {}

    // 3) 새 access_token 문자열만 반환
    return data.access_token;
  } catch (error) {
    //clearAllLocalStorageKeys();
    console.error('리프레시 토큰으로 토큰 재발급 실패:', error);
    throw error;
  }
};

// ✅ WebSocket(WebRTC signaling/voice ws)에서도 쓰기 위해 "만료 임박이면 refresh" 유틸을 export
// - axios 인터셉터는 WebSocket 연결에는 적용되지 않음
export async function ensureFreshAccessToken({ skewSeconds = 30 } = {}) {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  const expSec = parseJwtExpSec(token);
  if (!expSec) return token; // exp 파싱 불가 → 일단 그대로 사용

  const nowSec = Math.floor(Date.now() / 1000);
  // exp - now 가 충분히 남아있으면 그대로 사용
  if ((expSec - nowSec) > skewSeconds) return token;

  try {
    const newToken = await refreshAccessToken();
    return newToken || localStorage.getItem('access_token');
  } catch (e) {
    return null;
  }
}


// 요청 인터셉터: 액세스 토큰 자동 추가
instance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      const tokenType = localStorage.getItem('token_type') || 'Bearer';
      config.headers = config.headers || {};
      config.headers.Authorization = `${tokenType} ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 교체
instance.interceptors.response.use(
  (response) => {
    console.log('⬅️ Response:', response.config.url, response.status, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // refresh 호출 자체에서 에러난 경우는 그대로 실패 처리 (루프 방지)
    if (isAuthRefreshRequest(originalRequest)) {
      console.error('❌ Refresh endpoint error:', status, error.response?.data);
      return Promise.reject(error);
    }

    // ===== 401/403: 정석적인 만료 케이스 - 단 1회만 시도 =====
    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshAccessToken(); // 문자열 반환
        const tokenType = localStorage.getItem('token_type') || 'Bearer';

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `${tokenType} ${newAccessToken}`,
        };
        console.log("401,403 에러 - 리프래시 토큰 재발급 완료 ")
        return instance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // ===== 500: 서버가 만료를 500으로 돌려주는 비정상 케이스 =====
    // - 특정 횟수까지만 refresh 시도
    if (status === 500) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      if (originalRequest._retryCount <= MAX_500_REFRESH_RETRY) {
        try {
          const newAccessToken = await refreshAccessToken();
          const tokenType = localStorage.getItem('token_type') || 'Bearer';

          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `${tokenType} ${newAccessToken}`,
          };
          console.log("500에러 리프래시 토큰 재발급 완료 ")
          return instance(originalRequest);
        } catch (refreshError) {
          // refresh마저 실패하면 바로 이탈
          return Promise.reject(refreshError);
        }
      }
      // 최대 횟수 초과 → 그대로 실패 반환
    }

    console.error('❌ Response Error:', error.config?.url, status, error.response?.data);
    return Promise.reject(error);
  }
);

// export async function callChatbot({ step, input, context, prompt }) {
//   const payload = { step, input, context, prompt }; 
//   const { data } = await instance.post(
//     "/chat/with-prompt",
//     payload,
//     {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   // 서버 응답 예:
//   // { "step": "question", "text": "...", "raw": {...} }
//   return data;
// }
export async function callChatbot({ session_id, user_input, step, variable, context }) {
  const payload = {
    session_id,
    user_input,
    step,
    variable,
    context
  };

  const { data } = await instance.post(
    "/chat/multi-step",
    payload,
    {
      headers: { "Content-Type": "application/json" }
    }
  );

  return data;
}




export default instance;