import { useEffect, useState } from 'react';
import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

import axiosInstance from '../../api/axiosInstance';

function PlayApprovalProtectedRoute() {
  const location = useLocation();

  const [checkedPath, setCheckedPath] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const checkApproval = async () => {
      try {
        const response = await axiosInstance.get(
          '/play-applications/me'
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
        } else {
          setRedirectPath('/');
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
    };
  }, [location.pathname]);

  // 현재 경로에 대한 승인 확인이 끝나기 전에는
  // 보호된 화면을 렌더링하지 않음
  if (checkedPath !== location.pathname) {
    return null;
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  if (approvalStatus !== 'approved') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default PlayApprovalProtectedRoute;