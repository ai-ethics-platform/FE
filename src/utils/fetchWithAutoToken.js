// utils/fetchWithAutoToken.js
import axios from 'axios';

const API_BASE = 'https://dilemmai.org';

export const fetchWithAutoToken = async (origConfig = null) => {
  let accessToken  = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');

  // 내부에서만 쓰는 axios 인스턴스
  const client = axios.create({ baseURL: API_BASE });

  // 1) 현재 accessToken 으로 /users/me 확인
  try {
    await client.get('/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    // 유효하면 그냥 리턴
    return;
  } catch (err) {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      // 2) 토큰 만료/무효면 refresh 시도
      try {
        const res = await client.post(
          '/auth/refresh',
          {}, 
          { headers: { 'X-Refresh-Token': refreshToken } }
        );
        accessToken = res.data.access_token;
        localStorage.setItem('access_token', accessToken);
        console.log('🔄 access_token 갱신 완료');

        // 3) 갱신 후, 원래 요청이 넘어왔다면 재실행
        if (origConfig) {
          origConfig.headers = {
            ...origConfig.headers,
            Authorization: `Bearer ${accessToken}`,
          };
          return client(origConfig);
        }
      } catch (refreshErr) {
        console.error('❌ refreshToken 갱신 실패', refreshErr);
        // 리프레시 실패 시, 로그아웃 처리하거나 로그인 페이지로
        throw refreshErr;
      }
    } else {
      // 4) 그 외 에러는 그대로 throw
      throw err;
    }
  }
};
