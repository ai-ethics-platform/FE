import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import axiosInstance from '../../api/axiosInstance';
import Background from '../../components/Background';
import BackButton from '../../components/BackButton';
import IntroductionPopup from '../../components/IntroductionPopup';
import { translations } from '../../utils/language/index';

import logo from '../../assets/logo.svg';
import questionMark from '../../assets/Questionmark.svg';
import doorClosed from '../../assets/doorclosed.svg';
import doorOpen from '../../assets/dooropen.svg';
import approvalCheckKo from '../../assets/approvalcheck.svg';
import approvalCheckEn from '../../assets/en/approvalcheck_en.svg';
import startGameKo from '../../assets/startgame.svg';
import startGameEn from '../../assets/en/startgame_en.svg';

function getApiErrorMessage(error, fallbackMessage) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return (
      detail
        .map((item) => item?.msg)
        .filter(Boolean)
        .join(', ') || fallbackMessage
    );
  }

  return fallbackMessage;
}

export default function PlayApprovalStatus() {
  const navigate = useNavigate();

  const lang =
    localStorage.getItem('app_lang') ||
    localStorage.getItem('language') ||
    'ko';

  const t =
    translations[lang]?.PlayApprovalStatus ||
    translations.ko.PlayApprovalStatus;

  const [applicationStatus, setApplicationStatus] =
    useState('pending');

  const [isChecking, setIsChecking] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [
    isIntroPopupOpen,
    setIsIntroPopupOpen,
  ] = useState(false);

  const isApproved =
    applicationStatus === 'approved';

  const title = isApproved
    ? t.approvedTitle
    : t.pendingTitle;

  const description = isApproved
    ? t.approvedDescription
    : t.pendingDescription;

  const doorImage = isApproved
    ? doorOpen
    : doorClosed;

  const actionButtonImage = isApproved
    ? lang === 'en'
      ? startGameEn
      : startGameKo
    : lang === 'en'
      ? approvalCheckEn
      : approvalCheckKo;

  const loadApplicationStatus = useCallback(
    async ({ showPendingMessage = false } = {}) => {
      setIsChecking(true);
      setErrorMessage('');

      try {
        const response =
          await axiosInstance.get(
            '/play-applications/me'
          );

        const application =
          response.data?.application ||
          response.data;

        const nextStatus =
          application?.status;

        /*
         * rejected:
         * 서버에서 거절 상태를 직접 반환하는 경우
         *
         * null / undefined:
         * 거절 처리 이후 현재 유효한 신청 상태가
         * 없는 것으로 반환되는 경우
         *
         * 두 경우 모두 다시 신청할 수 있도록
         * 승인 신청 화면으로 이동한다.
         */
        if (
          nextStatus === 'rejected' ||
          nextStatus == null
        ) {
          navigate(
            '/play-approval/apply',
            {
              replace: true,
            }
          );
          return;
        }

        if (
          nextStatus !== 'pending' &&
          nextStatus !== 'approved'
        ) {
          throw new Error(
            'UNKNOWN_APPLICATION_STATUS'
          );
        }

        setApplicationStatus(
          nextStatus
        );

        if (
          showPendingMessage &&
          nextStatus === 'pending'
        ) {
          alert(
            t.pendingCheckMessage
          );
        }
      } catch (error) {
        /*
         * 신청 내역 자체가 존재하지 않는 경우에도
         * 다시 신청 화면으로 이동한다.
         */
        if (
          error?.response?.status ===
          404
        ) {
          navigate(
            '/play-approval/apply',
            {
              replace: true,
            }
          );
          return;
        }

        const fallbackMessage =
          lang === 'en'
            ? 'Unable to check your approval status. Please try again'
            : '승인 상태를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.';

        setErrorMessage(
          getApiErrorMessage(
            error,
            fallbackMessage
          )
        );
      } finally {
        setIsChecking(false);
      }
    },
    [
      lang,
      navigate,
      t.pendingCheckMessage,
    ]
  );

  useEffect(() => {
    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      'hidden';

    loadApplicationStatus();

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [loadApplicationStatus]);

  const handleBackClick = () => {
    navigate('/');
  };

  const handleAction = async () => {
    if (isApproved) {
      const inviteCode =
        localStorage.getItem('code');

      navigate(
        inviteCode
          ? '/customroom'
          : '/selectroom'
      );

      return;
    }

    await loadApplicationStatus({
      showPendingMessage: true,
    });
  };

  return (
    <Background bgIndex={2}>
      <div style={styles.page}>
        {/* 좌측 상단 뒤로가기 */}
        <div style={styles.backButton}>
          <div onClick={handleBackClick}>
            <BackButton />
          </div>
        </div>

        {/* 우측 상단 게임 소개 */}
        <img
          src={questionMark}
          alt="게임 소개"
          draggable={false}
          style={styles.questionMark}
          onClick={() =>
            setIsIntroPopupOpen(true)
          }
        />

        <main style={styles.container}>
          <img
            src={logo}
            alt="DILEMMA.I"
            draggable={false}
            style={styles.logo}
          />

          <div style={styles.title}>
            {title}
          </div>

          <img
            src={doorImage}
            alt=""
            draggable={false}
            style={styles.door}
          />

          <div
            style={styles.description}
          >
            {description}
          </div>

          <div style={styles.errorArea}>
            {errorMessage && (
              <div
                style={
                  styles.errorMessage
                }
              >
                {errorMessage}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAction}
            style={{
              ...styles.actionButton,
              ...(isChecking
                ? styles.actionButtonDisabled
                : {}),
            }}
            disabled={isChecking}
          >
            <img
              src={actionButtonImage}
              alt=""
              draggable={false}
              style={
                styles.actionButtonImage
              }
            />
          </button>
        </main>

        {/* 게임 소개 팝업 */}
        {isIntroPopupOpen && (
          <div
            style={styles.introOverlay}
            onClick={() =>
              setIsIntroPopupOpen(false)
            }
          >
            <IntroductionPopup
              isOpen={
                isIntroPopupOpen
              }
              onClose={() =>
                setIsIntroPopupOpen(
                  false
                )
              }
            />
          </div>
        )}
      </div>
    </Background>
  );
}

const styles = {
  page: {
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
    userSelect: 'none',
  },

  backButton: {
    position: 'absolute',
    top: '-10px',
    left: '-10px',
    zIndex: 10,
  },

  introOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor:
      'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10001,
  },

  questionMark: {
    position: 'absolute',
    top: '24px',
    right: '24px',
    width: '52px',
    height: '52px',
    objectFit: 'contain',
    zIndex: 10,
    cursor: 'pointer',
  },

  container: {
    width: 'min(860px, 72vw)',
    minHeight: '570px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '58px 70px 52px',
    backgroundColor: '#FCFDFA',
    clipPath:
      'polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px)',
    boxSizing: 'border-box',
  },

  logo: {
    width: '310px',
    maxWidth: '70%',
    height: 'auto',
    objectFit: 'contain',
    marginBottom: '20px',
  },

  title: {
    fontFamily:
      'Cafe24Ohsquareair, Pretendard, sans-serif',
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: 1.4,
    color: '#252C30',
    textAlign: 'center',
    whiteSpace: 'pre-line',
    marginBottom: '22px',
  },

  door: {
    width: '150px',
    height: '170px',
    objectFit: 'contain',
    marginBottom: '18px',
  },

  description: {
    fontFamily:
      'Pretendard, sans-serif',
    fontSize: '17px',
    fontWeight: 500,
    lineHeight: 1.4,
    color: '#3D484D',
    textAlign: 'center',
    whiteSpace: 'pre-line',
  },

  errorArea: {
    minHeight: '30px',
    paddingTop: '8px',
    marginBottom: '8px',
  },

  errorMessage: {
    fontFamily:
      'Pretendard, sans-serif',
    fontSize: '13px',
    color: '#dc2626',
    textAlign: 'center',
  },

  actionButton: {
    padding: 0,
    margin: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },

  actionButtonDisabled: {
    cursor: 'default',
    opacity: 0.55,
  },

  actionButtonImage: {
    display: 'block',
    width: '240px',
    height: 'auto',
  },
};