// // utils/fetchWithAutoToken.js
// import axios from 'axios';
// import axiosInstance from '../api/axiosInstance';   
// const API_BASE = 'https://dilemmai.org';

// export const fetchWithAutoToken = async (origConfig = null) => {
//   let accessToken  = localStorage.getItem('access_token');
//   const refreshToken = localStorage.getItem('refresh_token');

//   // this client is only for /users/me and /auth/refresh
//   const client = axios.create({ baseURL: API_BASE });

//   // 1) 먼저, 저장된 accessToken으로 /users/me 검증
//   try {
//     await client.get('/users/me', {
//       headers: { Authorization: `Bearer ${accessToken}` },
//     });
//     return;
//   } catch (err) {
//     if (err.response?.status === 401 || err.response?.status === 403) {
      
//       // 2) 만료되었으면 refresh 시도
//       try {
//         const res = await client.post(
//           '/auth/refresh',
//           {}, 
//           { headers: { 'X-Refresh-Token': refreshToken } }
//         );

//         accessToken = res.data.access_token;
//         localStorage.setItem('access_token', accessToken);
//         localStorage.setItem('refresh_token', res.data.refresh_token);
//         console.log('🔄 access_token 갱신 완료');

//         // **중요** axiosInstance에도 새 토큰을 붙여 줘야 실제 get/post에도 반영됩니다.
//         axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

//         // 3) origConfig가 넘어왔으면 (보통 없지만) 재실행
//         if (origConfig) {
//           origConfig.headers = {
//             ...origConfig.headers,
//             Authorization: `Bearer ${accessToken}`,
//           };
//           return client(origConfig);
//         }

//         return;
//       } catch (refreshErr) {
//         console.error('❌ refreshToken 갱신 실패', refreshErr);
//         // 리프레시 실패 시, 로그아웃 처리하거나 로그인 페이지로 이동
//         localStorage.clear();
//         window.location.href = '/';
//         throw refreshErr;
//       }
//     }
//     throw err;
//   }
// };


// utils/fetchWithAutoToken.js
import axios from 'axios';

export const fetchWithAutoToken = async () => {
  const accessToken = localStorage.getItem('access_token');

  try {
    // 토큰 유효성 검사용 API 호출 (예: /users/me)
    await axios.get('https://dilemmai.org/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return accessToken; // 여전히 유효
  } catch (error) {
    // 401 등 → accessToken이 만료된 경우
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('refresh_token 없음');

    // 갱신 요청
    const res = await axios.post('https://dilemmai.org/auth/refresh', {
      refresh_token: refreshToken
    });

    const newAccessToken = res.data.access_token;
    localStorage.setItem('access_token', newAccessToken);
    return newAccessToken; // 갱신된 토큰 반환
  }
};
