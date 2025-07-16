import axios from 'axios';
import { fetchWithAutoToken } from '../utils/fetchWithAutoToken';

const instance = axios.create({
  baseURL: 'https://dilemmai.org',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 유효성 검사 + 자동 갱신
instance.interceptors.request.use(
  async (config) => {
    // fetchWithAutoToken에 config를 넘겨서,
    // 토큰 재발급 뒤 원래 요청을 재실행해 줍니다.
    await fetchWithAutoToken(config);
    // 이 라인에 도달했다면 token이 유효하다는 의미
    const newToken = localStorage.getItem('access_token');
    config.headers.Authorization = `Bearer ${newToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// (선택) 응답 인터셉터에 로그 찍기
instance.interceptors.response.use(
  (response) => {
    console.log('⬅️ Response:', response.config.url, response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default instance;
