// api/axiosInstance.js
import axios from 'axios';
import { clearAllLocalStorageKeys } from '../utils/storage';
const API_BASE = 'https://dilemmai.org';

// 메인 axios 인스턴스 생성
const instance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 리프레쉬 토큰으로 새로운 액세스 토큰 요청
// const refreshAccessToken = async () => {
//   const refreshToken = localStorage.getItem('refresh_token');
//   if (!refreshToken) {
//     throw new Error('No refresh token available');
//   }
//   try {
//     const response = await axios.post(`${API_BASE}/auth/refresh`, {
//       refresh_token: refreshToken, 
//     });

//     const { access_token: newAccessToken } = response.data; 
//     localStorage.setItem('access_token', newAccessToken); 
//     return newAccessToken;
//   } catch (error) {
//     console.error("리프래시 토큰으로 토큰 재발급 실패: ", error);
//     throw error;
//   }
// };
// 리프레쉬 토큰으로 새로운 액세스 토큰 요청
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) throw new Error('No refresh token available');

  try {
    const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
      refresh_token: refreshToken,
    });
    // data: { access_token, refresh_token?, token_type? }

    // 1) 응답에서 받은 토큰들을 즉시 저장
    if (data.access_token) localStorage.setItem('access_token', data.access_token);
    if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token); // 회전형이면 갱신
    if (data.token_type)    localStorage.setItem('token_type', data.token_type);

    // 2) axios 인스턴스 기본 헤더도 업데이트 (이후 요청에 반영)
    instance.defaults.headers.Authorization = `${data.token_type || 'Bearer'} ${data.access_token}`;

    // 3) 새 access_token 문자열만 반환
    return data.access_token;
  } catch (error) {
    clearAllLocalStorageKeys();
    console.error('리프레시 토큰으로 토큰 재발급 실패:', error);
    throw error;
  }
};


// 요청 인터셉터: 액세스 토큰 자동 추가
instance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러 시 자동 토큰 갱신 및 재시도
instance.interceptors.response.use(
  (response) => {
    console.log('⬅️ Response:', response.config.url, response.status, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // // 401 에러이고 아직 재시도하지 않았다면
    // if (error.response?.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true;

    //   try {
    //     console.log(' 액세스 토큰 만료 - 리프레쉬 토큰으로 갱신 시도');
        
    //     // 1. 리프레쉬 토큰으로 새로운 액세스 토큰 요청
    //     const tokenData = await refreshAccessToken();
        
    //     // 2. 새로운 토큰들을 로컬 스토리지에 저장
    //     localStorage.setItem('access_token', tokenData.access_token);
    //     localStorage.setItem('refresh_token', tokenData.refresh_token);
    //     console.log(' 액세스 토큰 갱신 완료');
        
    //     // 3. 원래 요청의 헤더에 새로운 토큰 추가
    //     originalRequest.headers.Authorization = `Bearer ${tokenData.access_token}`;
        
    //     // 4. 실패한 요청을 새로운 토큰으로 재시도
    //     return instance(originalRequest);
        
    //   } catch (refreshError) {
    //     console.error('❌ 리프레쉬 토큰 갱신 실패:', refreshError);
        
    //     // 리프레쉬 토큰도 만료되었거나 유효하지 않음
       
    //     window.location.href = '/';
    //     return Promise.reject(refreshError);
    //   }
    // }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshAccessToken(); // ← 문자열 반환
        const tokenType = localStorage.getItem('token_type') || 'Bearer';
    
        // 실패했던 요청의 헤더만 최신 토큰으로 덮어쓰기
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `${tokenType} ${newAccessToken}`,
        };
    
        return instance(originalRequest);
      } catch (refreshError) {
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    

    console.error('❌ Response Error:', error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default instance;