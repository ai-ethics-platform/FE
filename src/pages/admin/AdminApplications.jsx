import React, { useMemo, useState } from "react";

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

const initialApplications = [
  {
    id: 1,
    lastName: "A",
    firstName: "test1",
    email: "test1@example.com",
    message:
      "테스트 메세지입니다.",
    appliedAt: "2026-08-27",
    status: STATUS.PENDING,
  },
  {
    id: 2,
    lastName: "B",
    firstName: "test2",
    email: "test2@example.com",
    message: "",
    appliedAt: "2026-08-27",
    status: STATUS.PENDING,
  },
  {
    id: 3,
    lastName: "C",
    firstName: "test3",
    email: "test3@example.com",
    message:
      "테스트 메세지입니다.",
    appliedAt: "2026-08-26",
    status: STATUS.APPROVED,
  },
  {
    id: 4,
    lastName: "D",
    firstName: "test4",
    email: "test4@example.com",
    message: null,
    appliedAt: "2026-08-25",
    status: STATUS.REJECTED,
  },
  {
    id: 5,
    lastName: "E",
    firstName: "test5",
    email: "test5@example.com",
    message:
      "테스트 메세지입니다.",
    appliedAt: "2026-08-24",
    status: STATUS.REJECTED,
  },
];

function AdminApplications() {
  const [applications, setApplications] = useState(initialApplications);
  const [selectedFilter, setSelectedFilter] = useState(FILTER.ALL);

  // 상태 변경 / 삭제 확인 팝업
  const [confirmModal, setConfirmModal] = useState(null);

  // 신청 메시지 확인 팝업
  const [messageModal, setMessageModal] = useState(null);

  const counts = useMemo(() => {
    return {
      all: applications.length,
      pending: applications.filter(
        (application) => application.status === STATUS.PENDING
      ).length,
      approved: applications.filter(
        (application) => application.status === STATUS.APPROVED
      ).length,
      rejected: applications.filter(
        (application) => application.status === STATUS.REJECTED
      ).length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (selectedFilter === FILTER.ALL) {
      return applications;
    }

    return applications.filter(
      (application) => application.status === selectedFilter
    );
  }, [applications, selectedFilter]);

  const openStatusConfirm = (type, application) => {
    setConfirmModal({
      type,
      application,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  const handleConfirmAction = () => {
    if (!confirmModal) return;

    const { type, application } = confirmModal;

    if (type === "approve") {
      setApplications((prev) =>
        prev.map((item) =>
          item.id === application.id
            ? { ...item, status: STATUS.APPROVED }
            : item
        )
      );
    }

    if (type === "reject") {
      setApplications((prev) =>
        prev.map((item) =>
          item.id === application.id
            ? { ...item, status: STATUS.REJECTED }
            : item
        )
      );
    }

    if (type === "cancelApproval") {
      setApplications((prev) =>
        prev.map((item) =>
          item.id === application.id
            ? { ...item, status: STATUS.PENDING }
            : item
        )
      );
    }

    if (type === "deleteRejected") {
      setApplications((prev) =>
        prev.filter((item) => item.status !== STATUS.REJECTED)
      );
    }

    closeConfirmModal();
  };

  const openMessageModal = (application) => {
    setMessageModal(application);
  };

  const closeMessageModal = () => {
    setMessageModal(null);
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
      return {
        title: "",
        message: "",
        confirmText: "",
      };
    }

    const { type, application } = confirmModal;

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

    return {
      title: "",
      message: "",
      confirmText: "",
    };
  };

  const confirmContent = getConfirmContent();

  const summaryCards = [
    {
      key: FILTER.ALL,
      label: "전체 신청",
      count: counts.all,
    },
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
        {/* 페이지 헤더 */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>플레이 신청 관리</h1>
            <p style={styles.description}>
              DILEMMA AI 플레이 신청 목록을 확인하고 승인 상태를 관리합니다.
            </p>
          </div>
        </div>

        {/* 요약 카드 */}
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
                  ...(isSelected ? styles.summaryCardSelected : {}),
                }}
              >
                <span style={styles.summaryLabel}>{card.label}</span>
                <strong style={styles.summaryCount}>{card.count}</strong>
              </button>
            );
          })}
        </div>

        {/* 신청 목록 */}
        <section style={styles.listSection}>
          <div style={styles.listHeader}>
            <div>
              <h2 style={styles.listTitle}>{getFilterTitle()}</h2>
              <span style={styles.listCount}>
                {filteredApplications.length}건
              </span>
            </div>

            {selectedFilter === FILTER.REJECTED &&
              counts.rejected > 0 && (
                <button
                  type="button"
                  style={styles.deleteListButton}
                  onClick={() =>
                    setConfirmModal({
                      type: "deleteRejected",
                      application: null,
                    })
                  }
                >
                  거절 목록 삭제
                </button>
              )}
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
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
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((application) => {
                    const hasMessage =
                      typeof application.message === "string" &&
                      application.message.trim().length > 0;

                    return (
                      <tr key={application.id}>
                        <td style={styles.td}>{application.id}</td>

                        <td style={{ ...styles.td, ...styles.selectableText }}>
  {application.lastName}
</td>

<td style={{ ...styles.td, ...styles.selectableText }}>
  {application.firstName}
</td>

<td style={{ ...styles.td, ...styles.selectableText }}>
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

                              ...(application.status === STATUS.PENDING
                                ? styles.pendingBadge
                                : {}),

                              ...(application.status === STATUS.APPROVED
                                ? styles.approvedBadge
                                : {}),

                              ...(application.status === STATUS.REJECTED
                                ? styles.rejectedBadge
                                : {}),
                            }}
                          >
                            {getStatusLabel(application.status)}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <div style={styles.actionArea}>
                            {application.status === STATUS.PENDING && (
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

                            {application.status === STATUS.APPROVED && (
                              <button
                                type="button"
                                style={styles.cancelApprovalButton}
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

                            {application.status === STATUS.REJECTED && (
                              <span style={styles.noAction}>-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      style={styles.emptyCell}
                    >
                      해당하는 신청 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* =========================================
          상태 변경 / 거절 목록 삭제 확인 팝업
      ========================================== */}
      {confirmModal && (
        <div
          style={styles.modalOverlay}
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

            <div style={styles.modalButtons}>
              <button
                type="button"
                style={styles.modalCancelButton}
                onClick={closeConfirmModal}
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
                }}
                onClick={handleConfirmAction}
              >
                {confirmContent.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          신청 메시지 확인 팝업
      ========================================== */}
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

  selectableText: {
    userSelect: "text",
  },

  container: {
    width: "100%",
    maxWidth: "1500px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
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

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

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
    textAlign: "left",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "15px 14px",
    borderBottom: "1px solid #f0f1f3",
    color: "#374151",
    fontSize: "14px",
    verticalAlign: "middle",
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

  pendingBadge: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },

  approvedBadge: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },

  rejectedBadge: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },

  actionArea: {
    display: "flex",
    alignItems: "center",
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

  noAction: {
    color: "#9ca3af",
  },

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

  modalDangerButton: {
    backgroundColor: "#dc2626",
  },

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

  messageSection: {
    padding: "22px 26px 26px",
  },

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
};

export default AdminApplications;