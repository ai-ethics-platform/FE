import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import adminAxiosInstance, {
  clearAdminSession,
  saveAdminSession,
} from "../../api/adminAxiosInstance";

function getErrorDetail(error) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  return null;
}

function AdminLogin() {
  const navigate = useNavigate();

  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const normalizedAdminId = adminId.trim();

    if (!normalizedAdminId || !password) {
      setErrorMessage(
        "아이디와 비밀번호를 입력해주세요."
      );
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);
    clearAdminSession();

    try {
      const form = new URLSearchParams();
      form.append("username", normalizedAdminId);
      form.append("password", password);

      const loginResponse = await adminAxiosInstance.post(
        "/auth/login",
        form,
        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
        }
      );

      if (!loginResponse.data?.access_token) {
        throw new Error("ACCESS_TOKEN_NOT_FOUND");
      }

      saveAdminSession(loginResponse.data);

      // 관리자 전용 API 호출로 실제 관리자 권한을 확인합니다.
      await adminAxiosInstance.get(
        "/admin/play-applications"
      );

      navigate("/admin/applications", {
        replace: true,
      });
    } catch (error) {
      clearAdminSession();

      const status = error?.response?.status;

      if (status === 401) {
        setErrorMessage(
          "아이디 또는 비밀번호가 올바르지 않습니다."
        );
      } else if (status === 403) {
        setErrorMessage(
          "관리자 권한이 없는 계정입니다."
        );
      } else if (!error?.response) {
        setErrorMessage(
          "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요."
        );
      } else {
        setErrorMessage(
          getErrorDetail(error) ||
            "관리자 로그인 중 오류가 발생했습니다."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.loginBox}>
        <div style={styles.header}>
          <h1 style={styles.title}>관리자 로그인</h1>

          <p style={styles.description}>
            DILEMMA AI 관리자 페이지에 접속합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="adminId" style={styles.label}>
              아이디
            </label>

            <input
              id="adminId"
              type="text"
              value={adminId}
              onChange={(event) => {
                setAdminId(event.target.value);

                if (errorMessage) {
                  setErrorMessage("");
                }
              }}
              placeholder="관리자 아이디를 입력하세요"
              autoComplete="username"
              style={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              비밀번호
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);

                if (errorMessage) {
                  setErrorMessage("");
                }
              }}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
              style={styles.input}
              disabled={isSubmitting}
            />
          </div>

          {errorMessage && (
            <div style={styles.errorMessage}>
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.loginButton,
              ...(isSubmitting
                ? styles.loginButtonDisabled
                : {}),
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: "#f7f8fa",
    boxSizing: "border-box",
    userSelect: "none",
  },

  loginBox: {
    width: "100%",
    maxWidth: "420px",
    padding: "36px",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    boxShadow:
      "0 10px 30px rgba(17, 24, 39, 0.06)",
    boxSizing: "border-box",
  },

  header: {
    marginBottom: "30px",
    textAlign: "center",
  },

  title: {
    margin: 0,
    color: "#111827",
    fontSize: "26px",
    fontWeight: 700,
  },

  description: {
    margin: "10px 0 0",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  formGroup: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#374151",
    fontSize: "13px",
    fontWeight: 600,
  },

  input: {
    width: "100%",
    height: "44px",
    padding: "0 13px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: "14px",
    boxSizing: "border-box",
    userSelect: "text",
  },

  errorMessage: {
    margin: "-4px 0 16px",
    color: "#dc2626",
    fontSize: "13px",
  },

  loginButton: {
    width: "100%",
    height: "44px",
    marginTop: "4px",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },

  loginButtonDisabled: {
    cursor: "not-allowed",
    opacity: 0.65,
  },
};

export default AdminLogin;
