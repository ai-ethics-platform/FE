import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import adminAxiosInstance, {
  clearAdminSession,
} from "../../api/adminAxiosInstance";

const STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

const FILTER = {
  ALL: "all",
  PENDING: STATUS.PENDING,
  APPROVED: STATUS.APPROVED,
  REJECTED: STATUS.REJECTED,
};

function getApiErrorMessage(error, fallbackMessage) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return (
      detail
        .map((item) => item?.msg)
        .filter(Boolean)
        .join(", ") || fallbackMessage
    );
  }

  return fallbackMessage;
}

function normalizeApplication(application) {
  return {
    id: application.id,
    userId: application.user_id,
    lastName: application.last_name,
    firstName: application.first_name,
    email: application.email,
    message: application.message,
    appliedAtRaw: application.applied_at,
    appliedAt: application.applied_at
      ? String(application.applied_at).slice(0, 10)
      : "-",
    status: application.status,
  };
}

function AdminApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(
    FILTER.ALL
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isProcessing, setIsProcessing] =
    useState(false);
  const [actionError, setActionError] = useState("");

  // 상태 변경, 삭제 및 관리자 권한 추가·해제 확인 팝업
  const [confirmModal, setConfirmModal] = useState(null);

  // 신청 메시지 확인 팝업
  const [messageModal, setMessageModal] = useState(null);

  // 관리자 권한 추가 팝업
  const [adminModalOpen, setAdminModalOpen] =
    useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [adminModalMessage, setAdminModalMessage] =
    useState("");
  const [isSearchingUser, setIsSearchingUser] =
    useState(false);
  const [adminModalTab, setAdminModalTab] =
    useState("grant");
  const [adminUsers, setAdminUsers] = useState([]);
  const [isLoadingAdminUsers, setIsLoadingAdminUsers] =
    useState(false);
  const [adminListError, setAdminListError] = useState("");

  const moveToAdminLogin = useCallback(() => {
    clearAdminSession();
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await adminAxiosInstance.get(
        "/admin/play-applications"
      );

      const list = Array.isArray(response.data)
        ? response.data
        : [];

      setApplications(list.map(normalizeApplication));
    } catch (error) {
      if (
        error?.response?.status === 401 ||
        error?.response?.status === 403
      ) {
        moveToAdminLogin();
        return;
      }

      setLoadError(
        getApiErrorMessage(
          error,
          "신청 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [moveToAdminLogin]);

  const loadAdminUsers = useCallback(async () => {
    setIsLoadingAdminUsers(true);
    setAdminListError("");

    try {
      const response = await adminAxiosInstance.get(
        "/admin/users/admins"
      );

      setAdminUsers(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      if (
        error?.response?.status === 401 ||
        error?.response?.status === 403
      ) {
        moveToAdminLogin();
        return;
      }

      setAdminListError(
        getApiErrorMessage(
          error,
          "관리자 목록을 불러오지 못했습니다."
        )
      );
    } finally {
      setIsLoadingAdminUsers(false);
    }
  }, [moveToAdminLogin]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  useEffect(() => {
    if (adminModalOpen && adminModalTab === "list") {
      loadAdminUsers();
    }
  }, [adminModalOpen, adminModalTab, loadAdminUsers]);

  const counts = useMemo(() => {
    return {
      all: applications.length,
      pending: applications.filter(
        (application) =>
          application.status === STATUS.PENDING
      ).length,
      approved: applications.filter(
        (application) =>
          application.status === STATUS.APPROVED
      ).length,
      rejected: applications.filter(
        (application) =>
          application.status === STATUS.REJECTED
      ).length,
    };
  }, [applications]);

  // 실제 DB id는 API 요청에만 사용하고, 화면 목록은 신청 순서대로 정렬합니다.
  const orderedApplications = useMemo(() => {
    return [...applications].sort((first, second) => {
      const parsedFirstTime = Date.parse(first.appliedAtRaw);
      const parsedSecondTime = Date.parse(second.appliedAtRaw);
      const firstTime = Number.isFinite(parsedFirstTime)
        ? parsedFirstTime
        : Number.MAX_SAFE_INTEGER;
      const secondTime = Number.isFinite(parsedSecondTime)
        ? parsedSecondTime
        : Number.MAX_SAFE_INTEGER;

      if (firstTime !== secondTime) {
        return firstTime - secondTime;
      }

      return first.id - second.id;
    });
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (selectedFilter === FILTER.ALL) {
      return orderedApplications;
    }

    return orderedApplications.filter(
      (application) =>
        application.status === selectedFilter
    );
  }, [orderedApplications, selectedFilter]);

  const openStatusConfirm = (type, application) => {
    setActionError("");
    setConfirmModal({ type, application, user: null });
  };

  const openAdminPermissionConfirm = () => {
    if (!searchedUser) return;

    setActionError("");
    setConfirmModal({
      type: searchedUser.is_admin
        ? "revokeAdmin"
        : "grantAdmin",
      application: null,
      user: searchedUser,
    });
  };

  const closeConfirmModal = () => {
    if (isProcessing) return;

    setConfirmModal(null);
    setActionError("");
  };

  const handleConfirmAction = async () => {
    if (!confirmModal || isProcessing) return;

    const { type, application, user } = confirmModal;

    setIsProcessing(true);
    setActionError("");

    try {
      if (type === "approve") {
        await adminAxiosInstance.patch(
          `/admin/play-applications/${application.id}/approve`
        );
      }

      if (type === "reject") {
        await adminAxiosInstance.patch(
          `/admin/play-applications/${application.id}/reject`
        );
      }

      if (type === "cancelApproval") {
        await adminAxiosInstance.patch(
          `/admin/play-applications/${application.id}/cancel-approval`
        );
      }

      if (type === "deleteRejected") {
        await adminAxiosInstance.delete(
          "/admin/play-applications/rejected"
        );
      }

      if (
        type === "grantAdmin" ||
        type === "revokeAdmin"
      ) {
        const permissionAction =
          type === "grantAdmin"
            ? "grant-admin"
            : "revoke-admin";

        const response = await adminAxiosInstance.patch(
          `/admin/users/${user.id}/${permissionAction}`
        );

        setSearchedUser(response.data);
        setAdminModalMessage(
          response.data?.message ||
            (type === "grantAdmin"
              ? "관리자 권한을 추가했습니다."
              : "관리자 권한을 해제했습니다.")
        );
      } else {
        await loadApplications();
      }

      setConfirmModal(null);
    } catch (error) {
      if (
        error?.response?.status === 401 ||
        error?.response?.status === 403
      ) {
        moveToAdminLogin();
        return;
      }

      setActionError(
        getApiErrorMessage(
          error,
          "처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const openMessageModal = (application) => {
    setMessageModal(application);
  };

  const closeMessageModal = () => {
    setMessageModal(null);
  };

  const openAdminModal = () => {
    setAdminModalTab("grant");
    setAdminUsername("");
    setSearchedUser(null);
    setAdminModalMessage("");
    setAdminUsers([]);
    setAdminListError("");
    setAdminModalOpen(true);
  };

  const closeAdminModal = () => {
    if (isSearchingUser || isProcessing) return;

    setAdminModalOpen(false);
    setAdminModalTab("grant");
    setAdminUsername("");
    setSearchedUser(null);
    setAdminModalMessage("");
    setAdminUsers([]);
    setAdminListError("");
  };

  const handleSearchUser = async (event) => {
    event.preventDefault();

    if (isSearchingUser) return;

    const normalizedUsername = adminUsername.trim();

    if (!normalizedUsername) {
      setSearchedUser(null);
      setAdminModalMessage("사용자 아이디를 입력해주세요.");
      return;
    }

    setIsSearchingUser(true);
    setSearchedUser(null);
    setAdminModalMessage("");

    try {
      const response = await adminAxiosInstance.get(
        "/admin/users/search",
        {
          params: { username: normalizedUsername },
        }
      );

      setSearchedUser(response.data);

      if (response.data?.is_admin) {
        setAdminModalMessage(
          "이미 관리자 권한이 있는 계정입니다."
        );
      }
    } catch (error) {
      if (
        error?.response?.status === 401 ||
        error?.response?.status === 403
      ) {
        moveToAdminLogin();
        return;
      }

      setAdminModalMessage(
        getApiErrorMessage(
          error,
          "계정 검색 중 오류가 발생했습니다."
        )
      );
    } finally {
      setIsSearchingUser(false);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    navigate("/admin/login", { replace: true });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case STATUS.PENDING:
        return "승인 대기";
      case STATUS.APPROVED:
        return "승인";
      case STATUS.REJECTED:
        return "거절";
      default:
        return "-";
    }
  };

  const getFilterTitle = () => {
    switch (selectedFilter) {
      case FILTER.PENDING:
        return "승인 대기 신청자";
      case FILTER.APPROVED:
        return "승인된 신청자";
      case FILTER.REJECTED:
        return "거절된 신청자";
      default:
        return "전체 신청자";
    }
  };

  const getConfirmContent = () => {
    if (!confirmModal) {
      return { title: "", message: "", confirmText: "" };
    }

    const { type, application, user } = confirmModal;

    if (type === "approve") {
      return {
        title: "신청 승인",
        message: `${application.lastName}${application.firstName}님의 플레이 신청을 승인하시겠습니까?`,
        confirmText: "승인",
      };
    }

    if (type === "reject") {
      return {
        title: "신청 거절",
        message: `${application.lastName}${application.firstName}님의 플레이 신청을 거절하시겠습니까?`,
        confirmText: "거절",
      };
    }

    if (type === "cancelApproval") {
      return {
        title: "승인 취소",
        message: `${application.lastName}${application.firstName}님의 승인을 취소하시겠습니까?\n승인 취소 후 상태는 승인 대기로 변경됩니다.`,
        confirmText: "승인 취소",
      };
    }

    if (type === "deleteRejected") {
      return {
        title: "거절 목록 삭제",
        message:
          "현재 거절된 신청 목록을 모두 삭제하시겠습니까?\n삭제된 목록은 복구할 수 없습니다.",
        confirmText: "삭제",
      };
    }

    if (type === "grantAdmin") {
      return {
        title: "관리자 권한 추가",
        message: `${user.username} 계정에 관리자 권한을 추가하시겠습니까?`,
        confirmText: "권한 추가",
      };
    }

    if (type === "revokeAdmin") {
      return {
        title: "관리자 권한 해제",
        message: `${user.username} 계정의 관리자 권한을 해제하시겠습니까?`,
        confirmText: "권한 해제",
      };
    }

    return { title: "", message: "", confirmText: "" };
  };

  const confirmContent = getConfirmContent();

  const summaryCards = [
    { key: FILTER.ALL, label: "전체 신청", count: counts.all },
    {
      key: FILTER.PENDING,
      label: "승인 대기",
      count: counts.pending,
    },
    {
      key: FILTER.APPROVED,
      label: "승인",
      count: counts.approved,
    },
    {
      key: FILTER.REJECTED,
      label: "거절",
      count: counts.rejected,
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>플레이 신청 관리</h1>
            <p style={styles.description}>
              DILEMMA AI 플레이 신청 목록을 확인하고 승인 상태를 관리합니다.
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              style={styles.grantAdminButton}
              onClick={openAdminModal}
            >
              관리 권한 추가
            </button>

            <button
              type="button"
              style={styles.logoutButton}
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </div>
        </div>

        <div style={styles.summaryGrid}>
          {summaryCards.map((card) => {
            const isSelected = selectedFilter === card.key;

            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setSelectedFilter(card.key)}
                style={{
                  ...styles.summaryCard,
                  ...(isSelected
                    ? styles.summaryCardSelected
                    : {}),
                }}
              >
                <span style={styles.summaryLabel}>
                  {card.label}
                </span>
                <strong style={styles.summaryCount}>
                  {card.count}
                </strong>
              </button>
            );
          })}
        </div>

        <section style={styles.listSection}>
          <div style={styles.listHeader}>
            <div>
              <h2 style={styles.listTitle}>
                {getFilterTitle()}
              </h2>
              <span style={styles.listCount}>
                {filteredApplications.length}건
              </span>
            </div>

            {selectedFilter === FILTER.REJECTED &&
              counts.rejected > 0 && (
                <button
                  type="button"
                  style={styles.deleteListButton}
                  onClick={() => {
                    setActionError("");
                    setConfirmModal({
                      type: "deleteRejected",
                      application: null,
                      user: null,
                    });
                  }}
                >
                  거절 목록 삭제
                </button>
              )}
          </div>

          {loadError && (
            <div style={styles.loadError}>
              <span>{loadError}</span>
              <button
                type="button"
                style={styles.retryButton}
                onClick={loadApplications}
              >
                다시 시도
              </button>
            </div>
          )}

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>번호</th>
                  <th style={styles.th}>성</th>
                  <th style={styles.th}>이름</th>
                  <th style={styles.th}>이메일</th>
                  <th style={styles.th}>메시지</th>
                  <th style={styles.th}>신청일</th>
                  <th style={styles.th}>상태</th>
                  <th style={styles.th}>관리</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} style={styles.emptyCell}>
                      신청 목록을 불러오고 있습니다.
                    </td>
                  </tr>
                ) : filteredApplications.length > 0 ? (
                  filteredApplications.map((application, index) => {
                    const hasMessage =
                      typeof application.message === "string" &&
                      application.message.trim().length > 0;

                    return (
                      <tr key={application.id}>
                        <td style={styles.td}>
                          {index + 1}
                        </td>
                        <td
                          style={{
                            ...styles.td,
                            ...styles.selectableText,
                          }}
                        >
                          {application.lastName}
                        </td>
                        <td
                          style={{
                            ...styles.td,
                            ...styles.selectableText,
                          }}
                        >
                          {application.firstName}
                        </td>
                        <td
                          style={{
                            ...styles.td,
                            ...styles.selectableText,
                          }}
                        >
                          {application.email}
                        </td>
                        <td style={styles.td}>
                          {hasMessage ? (
                            <button
                              type="button"
                              style={styles.messageButton}
                              onClick={() =>
                                openMessageModal(application)
                              }
                            >
                              확인
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td style={styles.td}>
                          {application.appliedAt}
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              ...(application.status ===
                              STATUS.PENDING
                                ? styles.pendingBadge
                                : {}),
                              ...(application.status ===
                              STATUS.APPROVED
                                ? styles.approvedBadge
                                : {}),
                              ...(application.status ===
                              STATUS.REJECTED
                                ? styles.rejectedBadge
                                : {}),
                            }}
                          >
                            {getStatusLabel(application.status)}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionArea}>
                            {application.status ===
                              STATUS.PENDING && (
                              <>
                                <button
                                  type="button"
                                  style={styles.approveButton}
                                  onClick={() =>
                                    openStatusConfirm(
                                      "approve",
                                      application
                                    )
                                  }
                                >
                                  승인
                                </button>
                                <button
                                  type="button"
                                  style={styles.rejectButton}
                                  onClick={() =>
                                    openStatusConfirm(
                                      "reject",
                                      application
                                    )
                                  }
                                >
                                  거절
                                </button>
                              </>
                            )}

                            {application.status ===
                              STATUS.APPROVED && (
                              <button
                                type="button"
                                style={
                                  styles.cancelApprovalButton
                                }
                                onClick={() =>
                                  openStatusConfirm(
                                    "cancelApproval",
                                    application
                                  )
                                }
                              >
                                승인 취소
                              </button>
                            )}

                            {application.status ===
                              STATUS.REJECTED && (
                              <span style={styles.noAction}>-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} style={styles.emptyCell}>
                      해당하는 신청 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {confirmModal && (
        <div
          style={{
            ...styles.modalOverlay,
            ...(confirmModal.type === "grantAdmin" ||
            confirmModal.type === "revokeAdmin"
              ? styles.confirmModalOverlayTop
              : {}),
          }}
          onMouseDown={closeConfirmModal}
        >
          <div
            style={styles.confirmModal}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h3 style={styles.modalTitle}>
              {confirmContent.title}
            </h3>
            <p style={styles.confirmMessage}>
              {confirmContent.message}
            </p>

            {actionError && (
              <div style={styles.modalError}>{actionError}</div>
            )}

            <div style={styles.modalButtons}>
              <button
                type="button"
                style={styles.modalCancelButton}
                onClick={closeConfirmModal}
                disabled={isProcessing}
              >
                취소
              </button>
              <button
                type="button"
                style={{
                  ...styles.modalConfirmButton,
                  ...(confirmModal.type === "reject" ||
                  confirmModal.type === "deleteRejected"
                    ? styles.modalDangerButton
                    : {}),
                  ...(isProcessing
                    ? styles.buttonDisabled
                    : {}),
                }}
                onClick={handleConfirmAction}
                disabled={isProcessing}
              >
                {isProcessing
                  ? "처리 중..."
                  : confirmContent.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {messageModal && (
        <div
          style={styles.modalOverlay}
          onMouseDown={closeMessageModal}
        >
          <div
            style={styles.messageModal}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div style={styles.messageModalHeader}>
              <div>
                <h3 style={styles.modalTitle}>신청 메시지</h3>
                <p style={styles.modalSubtitle}>
                  신청자가 승인 시 남긴 메시지입니다.
                </p>
              </div>
              <button
                type="button"
                style={styles.closeButton}
                onClick={closeMessageModal}
                aria-label="메시지 팝업 닫기"
              >
                ×
              </button>
            </div>

            <div style={styles.applicantInfo}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>신청자</span>
                <span style={styles.infoValue}>
                  {messageModal.lastName}
                  {messageModal.firstName}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>이메일</span>
                <span style={styles.infoValue}>
                  {messageModal.email}
                </span>
              </div>
            </div>

            <div style={styles.messageSection}>
              <div style={styles.messageLabel}>메시지</div>
              <div style={styles.messageContent}>
                {messageModal.message}
              </div>
            </div>

            <div style={styles.messageModalFooter}>
              <button
                type="button"
                style={styles.messageCloseButton}
                onClick={closeMessageModal}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {adminModalOpen && (
        <div
          style={styles.modalOverlay}
          onMouseDown={closeAdminModal}
        >
          <div
            style={styles.adminModal}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div style={styles.messageModalHeader}>
              <div>
                <h3 style={styles.modalTitle}>
                  관리자 권한 관리
                </h3>
                <p style={styles.modalSubtitle}>
                  관리자 권한을 추가하거나 현재 관리자 계정을 확인합니다.
                </p>
              </div>
              <button
                type="button"
                style={styles.closeButton}
                onClick={closeAdminModal}
                aria-label="관리자 권한 관리 팝업 닫기"
              >
                ×
              </button>
            </div>

            <div style={styles.adminModalBody}>
              <div style={styles.adminTabs}>
                <button
                  type="button"
                  style={{
                    ...styles.adminTabButton,
                    ...(adminModalTab === "grant"
                      ? styles.adminTabButtonActive
                      : {}),
                  }}
                  onClick={() => setAdminModalTab("grant")}
                >
                  권한 추가
                </button>

                <button
                  type="button"
                  style={{
                    ...styles.adminTabButton,
                    ...(adminModalTab === "list"
                      ? styles.adminTabButtonActive
                      : {}),
                  }}
                  onClick={() => setAdminModalTab("list")}
                >
                  관리자 목록
                </button>
              </div>

              {adminModalTab === "grant" && (
                <>
                  <form
                    onSubmit={handleSearchUser}
                    style={styles.searchForm}
                  >
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(event) => {
                        setAdminUsername(event.target.value);
                        setSearchedUser(null);
                        setAdminModalMessage("");
                      }}
                      placeholder="사용자 아이디를 입력하세요"
                      style={styles.searchInput}
                      disabled={isSearchingUser || isProcessing}
                    />
                    <button
                      type="submit"
                      style={{
                        ...styles.searchButton,
                        ...(isSearchingUser
                          ? styles.buttonDisabled
                          : {}),
                      }}
                      disabled={isSearchingUser || isProcessing}
                    >
                      {isSearchingUser ? "검색 중..." : "검색"}
                    </button>
                  </form>

                  {adminModalMessage && (
                    <div
                      style={{
                        ...styles.adminModalMessage,
                        ...(searchedUser?.is_admin
                          ? styles.adminModalInfoMessage
                          : {}),
                      }}
                    >
                      {adminModalMessage}
                    </div>
                  )}

                  {searchedUser && (
                    <div style={styles.userSearchResult}>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>아이디</span>
                        <span style={styles.infoValue}>
                          {searchedUser.username}
                        </span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>이메일</span>
                        <span style={styles.infoValue}>
                          {searchedUser.email}
                        </span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>권한</span>
                        <span style={styles.infoValue}>
                          {searchedUser.is_admin
                            ? "관리자"
                            : "일반 사용자"}
                        </span>
                      </div>

                      <div style={styles.adminModalFooter}>
                        <button
                          type="button"
                          style={{
                            ...(searchedUser.is_admin
                              ? styles.revokeAdminButton
                              : styles.grantConfirmButton),
                            ...(isProcessing
                              ? styles.buttonDisabled
                              : {}),
                          }}
                          onClick={openAdminPermissionConfirm}
                          disabled={isProcessing}
                        >
                          {searchedUser.is_admin
                            ? "관리 권한 해제"
                            : "관리 권한 추가"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {adminModalTab === "list" && (
                <div style={styles.adminListSection}>
                  {isLoadingAdminUsers ? (
                    <div style={styles.adminListState}>
                      관리자 목록을 불러오고 있습니다.
                    </div>
                  ) : adminListError ? (
                    <div style={styles.adminListError}>
                      <span>{adminListError}</span>
                      <button
                        type="button"
                        style={styles.adminListRetryButton}
                        onClick={loadAdminUsers}
                      >
                        다시 시도
                      </button>
                    </div>
                  ) : adminUsers.length === 0 ? (
                    <div style={styles.adminListState}>
                      등록된 관리자 계정이 없습니다.
                    </div>
                  ) : (
                    <div style={styles.adminList}>
                      {adminUsers.map((adminUser) => (
                        <div
                          key={adminUser.id}
                          style={styles.adminListItem}
                        >
                          <div style={styles.adminListUserInfo}>
                            <strong style={styles.adminListUsername}>
                              {adminUser.username}
                            </strong>
                            <span style={styles.adminListEmail}>
                              {adminUser.email}
                            </span>
                          </div>

                          <span style={styles.adminBadge}>
                            관리자
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f7f8fa",
    padding: "40px",
    boxSizing: "border-box",
    userSelect: "none",
  },
  selectableText: { userSelect: "text" },
  container: {
    width: "100%",
    maxWidth: "1500px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
    marginBottom: "28px",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  grantAdminButton: {
    height: "40px",
    padding: "0 16px",
    border: "1px solid #2563eb",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  logoutButton: {
    height: "40px",
    padding: "0 16px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#4b5563",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    color: "#111827",
  },
  description: {
    margin: "8px 0 0",
    fontSize: "14px",
    color: "#6b7280",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },
  summaryCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "12px",
    padding: "20px 22px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
  },
  summaryCardSelected: {
    border: "1px solid #111827",
    boxShadow: "0 0 0 1px #111827",
  },
  summaryLabel: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#6b7280",
  },
  summaryCount: {
    fontSize: "30px",
    lineHeight: 1,
    color: "#111827",
  },
  listSection: {
    padding: "24px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
  },
  listHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "20px",
  },
  listTitle: {
    display: "inline-block",
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
  },
  listCount: {
    marginLeft: "10px",
    fontSize: "13px",
    color: "#6b7280",
  },
  deleteListButton: {
    height: "38px",
    padding: "0 14px",
    border: "1px solid #dc2626",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  loadError: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "16px",
    padding: "12px 14px",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    fontSize: "13px",
  },
  retryButton: {
    height: "30px",
    padding: "0 10px",
    border: "1px solid #dc2626",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#dc2626",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  tableWrapper: { width: "100%", overflowX: "auto" },
  table: {
    width: "100%",
    minWidth: "1100px",
    borderCollapse: "collapse",
  },
  th: {
    padding: "13px 14px",
    borderTop: "1px solid #e5e7eb",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    color: "#4b5563",
    fontSize: "13px",
    fontWeight: 600,
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "15px 14px",
    borderBottom: "1px solid #f0f1f3",
    color: "#374151",
    fontSize: "14px",
    verticalAlign: "middle",
    textAlign: "center",
  },
  messageButton: {
    minWidth: "52px",
    height: "30px",
    padding: "0 10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "66px",
    padding: "5px 9px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  pendingBadge: { backgroundColor: "#fef3c7", color: "#92400e" },
  approvedBadge: { backgroundColor: "#dcfce7", color: "#166534" },
  rejectedBadge: { backgroundColor: "#fee2e2", color: "#991b1b" },
  actionArea: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    minHeight: "32px",
  },
  approveButton: {
    height: "32px",
    padding: "0 12px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  rejectButton: {
    height: "32px",
    padding: "0 12px",
    border: "1px solid #dc2626",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#dc2626",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  cancelApprovalButton: {
    height: "32px",
    padding: "0 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#4b5563",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  noAction: { color: "#9ca3af" },
  emptyCell: {
    padding: "60px 20px",
    borderBottom: "1px solid #e5e7eb",
    color: "#9ca3af",
    fontSize: "14px",
    textAlign: "center",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    backgroundColor: "rgba(17, 24, 39, 0.55)",
    boxSizing: "border-box",
  },
  confirmModalOverlayTop: { zIndex: 1100 },
  confirmModal: {
    width: "100%",
    maxWidth: "420px",
    padding: "26px",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.18)",
  },
  modalTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "20px",
    fontWeight: 700,
  },
  modalSubtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },
  confirmMessage: {
    margin: "18px 0 26px",
    color: "#4b5563",
    fontSize: "14px",
    lineHeight: 1.65,
    whiteSpace: "pre-line",
  },
  modalError: {
    margin: "-12px 0 18px",
    color: "#dc2626",
    fontSize: "13px",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },
  modalCancelButton: {
    height: "38px",
    padding: "0 16px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#4b5563",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  modalConfirmButton: {
    height: "38px",
    padding: "0 16px",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "#111827",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  modalDangerButton: { backgroundColor: "#dc2626" },
  buttonDisabled: { cursor: "not-allowed", opacity: 0.6 },
  messageModal: {
    width: "100%",
    maxWidth: "560px",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.18)",
    overflow: "hidden",
  },
  messageModalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "24px 26px 20px",
    borderBottom: "1px solid #e5e7eb",
  },
  closeButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    padding: 0,
    border: "none",
    backgroundColor: "transparent",
    color: "#6b7280",
    fontSize: "26px",
    lineHeight: 1,
    cursor: "pointer",
  },
  applicantInfo: {
    padding: "20px 26px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
  },
  infoRow: {
    display: "grid",
    gridTemplateColumns: "80px 1fr",
    gap: "12px",
    padding: "5px 0",
  },
  infoLabel: {
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 600,
  },
  infoValue: {
    color: "#111827",
    fontSize: "14px",
    wordBreak: "break-all",
    userSelect: "text",
  },
  messageSection: { padding: "22px 26px 26px" },
  messageLabel: {
    marginBottom: "10px",
    color: "#374151",
    fontSize: "13px",
    fontWeight: 700,
  },
  messageContent: {
    minHeight: "110px",
    maxHeight: "300px",
    padding: "16px",
    overflowY: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "#f9fafb",
    color: "#374151",
    fontSize: "14px",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    boxSizing: "border-box",
    userSelect: "text",
  },
  messageModalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "0 26px 24px",
  },
  messageCloseButton: {
    height: "38px",
    padding: "0 20px",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "#111827",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  adminModal: {
    width: "100%",
    maxWidth: "540px",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.18)",
    overflow: "hidden",
  },
  adminModalBody: { padding: "22px 26px 26px" },
  adminTabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    marginBottom: "22px",
    padding: "4px",
    borderRadius: "8px",
    backgroundColor: "#f3f4f6",
  },
  adminTabButton: {
    height: "38px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "transparent",
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  adminTabButtonActive: {
    backgroundColor: "#ffffff",
    color: "#111827",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.10)",
  },
  searchForm: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  searchInput: {
    flex: 1,
    height: "42px",
    padding: "0 13px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    outline: "none",
    color: "#111827",
    fontSize: "14px",
    boxSizing: "border-box",
    userSelect: "text",
  },
  searchButton: {
    height: "42px",
    padding: "0 16px",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "#111827",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  adminModalMessage: {
    marginTop: "14px",
    color: "#dc2626",
    fontSize: "13px",
  },
  adminModalInfoMessage: { color: "#2563eb" },
  userSearchResult: {
    marginTop: "18px",
    padding: "16px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "#f9fafb",
  },
  adminListSection: {
    minHeight: "150px",
  },
  adminList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "320px",
    overflowY: "auto",
  },
  adminListItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "14px 16px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "#f9fafb",
  },
  adminListUserInfo: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  adminListUsername: {
    color: "#111827",
    fontSize: "14px",
    fontWeight: 700,
    userSelect: "text",
  },
  adminListEmail: {
    color: "#6b7280",
    fontSize: "12px",
    wordBreak: "break-all",
    userSelect: "text",
  },
  adminBadge: {
    flexShrink: 0,
    padding: "5px 9px",
    borderRadius: "999px",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "11px",
    fontWeight: 700,
  },
  adminListState: {
    padding: "48px 12px",
    color: "#9ca3af",
    fontSize: "13px",
    textAlign: "center",
  },
  adminListError: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    padding: "12px 14px",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    fontSize: "13px",
  },
  adminListRetryButton: {
    flexShrink: 0,
    height: "30px",
    padding: "0 10px",
    border: "1px solid #dc2626",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#dc2626",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  adminModalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "14px",
  },
  grantConfirmButton: {
    height: "38px",
    padding: "0 16px",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  revokeAdminButton: {
    height: "38px",
    padding: "0 16px",
    border: "1px solid #dc2626",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default AdminApplications;
