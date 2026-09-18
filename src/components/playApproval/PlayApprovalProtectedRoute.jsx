import { useEffect, useState } from 'react';
import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

import axiosInstance from '../../api/axiosInstance';
import CreatorRecoveryBoundary from '../CreatorRecoveryBoundary';

function PlayApprovalProtectedRoute() {
  const location = useLocation();

  const [checkedPath, setCheckedPath] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [redirectPath, setRedirectPath] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setError('');
    setCheckedPath(null);

    const checkApproval = async () => {
      try {
        const response = await axiosInstance.get(
          '/play-applications/me', { timeout: 20000, signal: controller.signal }
        );

        if (cancelled) return;

        const status = response.data?.status;

        if (status === 'approved') {
          setApprovalStatus('approved');
          setRedirectPath(null);
        } else if (status === 'pending') {
          setApprovalStatus(status);
          setRedirectPath('/play-approval/pending');
        } else {
          setApprovalStatus(status);
          setRedirectPath('/play-approval/apply');
        }
      } catch (error) {
        if (cancelled) return;

        const statusCode = error.response?.status;

        if (statusCode === 404) {
          setRedirectPath('/play-approval/apply');
        } else if (statusCode === 401 || statusCode === 403) {
          setRedirectPath('/');
        } else {
          setRedirectPath(null);
          setError('연결이 지연되어 화면을 열지 못했어요. 다시 시도해 주세요.');
        }

        setApprovalStatus(null);
      } finally {
        if (!cancelled) {
          setCheckedPath(location.pathname);
        }
      }
    };

    checkApproval();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [location.pathname, attempt]);

  // 현재 경로에 대한 승인 확인이 끝나기 전에는
  // 보호된 화면을 렌더링하지 않음
  if (checkedPath !== location.pathname) {
    return <div role="status" style={{ padding: 32 }}>화면을 불러오고 있어요…</div>;
  }

  if (error) return <div role="alert" style={{ padding: 32 }}><p>{error}</p><button onClick={() => setAttempt(value => value + 1)}>다시 시도</button></div>;

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  if (approvalStatus !== 'approved') {
    return <Navigate to="/" replace />;
  }

  if (/^\/(?:chatpage2(?:\/|$)|create\d|editor\d)/.test(location.pathname)) {
    return <CreatorRecoveryBoundary key={location.pathname}><Outlet /></CreatorRecoveryBoundary>;
  }
  return <Outlet />;
}

export default PlayApprovalProtectedRoute;
