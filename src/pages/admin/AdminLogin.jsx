import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    // 개발용 mock 관리자 계정
    const MOCK_ADMIN_ID = "admin";
    const MOCK_ADMIN_PASSWORD = "admin1234";

    if (
      adminId === MOCK_ADMIN_ID &&
      password === MOCK_ADMIN_PASSWORD
    ) {
      sessionStorage.setItem("adminLoggedIn", "true");

      setErrorMessage("");

      navigate("/admin/applications");
      return;
    }

    setErrorMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
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
            />
          </div>

          {errorMessage && (
            <div style={styles.errorMessage}>
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            style={styles.loginButton}
          >
            로그인
          </button>
        </form>

        <div style={styles.testAccountBox}>
          <div style={styles.testAccountTitle}>
            개발용 테스트 계정
          </div>

          <div style={styles.testAccountText}>
            ID: admin
          </div>

          <div style={styles.testAccountText}>
            PW: admin1234
          </div>
        </div>
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
    boxShadow: "0 10px 30px rgba(17, 24, 39, 0.06)",
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

  testAccountBox: {
    marginTop: "24px",
    padding: "14px 16px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "#f9fafb",
  },

  testAccountTitle: {
    marginBottom: "7px",
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: 600,
  },

  testAccountText: {
    color: "#4b5563",
    fontSize: "12px",
    lineHeight: 1.6,
    userSelect: "text",
  },
};

export default AdminLogin;