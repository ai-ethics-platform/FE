import { Navigate, Outlet } from 'react-router-dom';

function PlayApprovalAuthRoute() {
  const accessToken = localStorage.getItem('access_token');

  // 로그인 토큰이 없으면 로그인 화면으로 이동
  if (!accessToken) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // 로그인된 사용자만 승인 관련 화면 접근 허용
  return <Outlet />;
}

export default PlayApprovalAuthRoute;