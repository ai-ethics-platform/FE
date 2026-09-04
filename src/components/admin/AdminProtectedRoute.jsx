import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import adminAxiosInstance, {
  clearAdminSession,
} from "../../api/adminAxiosInstance";

function AdminProtectedRoute({ children }) {
  const [authState, setAuthState] = useState("checking");

  useEffect(() => {
    let isMounted = true;

    const verifyAdmin = async () => {
      const accessToken = sessionStorage.getItem(
        "admin_access_token"
      );

      if (!accessToken) {
        clearAdminSession();

        if (isMounted) {
          setAuthState("denied");
        }

        return;
      }

      try {
        await adminAxiosInstance.get(
          "/admin/play-applications"
        );

        if (isMounted) {
          setAuthState("allowed");
        }
      } catch {
        clearAdminSession();

        if (isMounted) {
          setAuthState("denied");
        }
      }
    };

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, []);

  if (authState === "checking") {
    return (
      <div style={styles.loadingPage}>
        관리자 권한을 확인하고 있습니다.
      </div>
    );
  }

  if (authState === "denied") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

const styles = {
  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f8fa",
    color: "#6b7280",
    fontSize: "14px",
  },
};

export default AdminProtectedRoute;
