import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import axiosInstance from '../../api/axiosInstance';
import Background from '../../components/Background';
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
    return detail
      .map((item) => item?.msg)
      .filter(Boolean)
      .join(', ') || fallbackMessage;
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
  const [isChecking, setIsChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const isApproved = applicationStatus === 'approved';

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
        const response = await axiosInstance.get(
          '/play-applications/me'
        );

        const application =
          response.data?.application || response.data;
        const nextStatus = application?.status;

        if (nextStatus === 'rejected') {
          navigate('/play-approval/apply', {
            replace: true,
          });
          return;
        }

        if (
          nextStatus !== 'pending' &&
          nextStatus !== 'approved'
        ) {
          throw new Error('UNKNOWN_APPLICATION_STATUS');
        }

        setApplicationStatus(nextStatus);

        if (
          showPendingMessage &&
          nextStatus === 'pending'
        ) {
          alert(t.pendingCheckMessage);
        }
      } catch (error) {
        if (error?.response?.status === 404) {
          navigate('/play-approval/apply', {
            replace: true,
          });
          return;
        }

        const fallbackMessage =
          lang === 'en'
            ? '승인 상태를 확인하지 못했습니다. 잠시 후 다시 시도해주세요. (미번역)'
            : '승인 상태를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.';

        setErrorMessage(
          getApiErrorMessage(error, fallbackMessage)
        );
      } finally {
        setIsChecking(false);
      }
    },
    [lang, navigate, t.pendingCheckMessage]
  );

  useEffect(() => {
    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    loadApplicationStatus();

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [loadApplicationStatus]);

  const handleAction = async () => {
    if (isApproved) {
      const inviteCode = localStorage.getItem('code');

      navigate(
        inviteCode ? '/customroom' : '/selectroom'
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
        <img
          src={questionMark}
          alt=""
          draggable={false}
          style={styles.questionMark}
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

          <div style={styles.description}>
            {description}
          </div>

          <div style={styles.errorArea}>
            {errorMessage && (
              <div style={styles.errorMessage}>
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
              style={styles.actionButtonImage}
            />
          </button>
        </main>
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

  questionMark: {
    position: 'absolute',
    top: '24px',
    right: '24px',
    width: '52px',
    height: '52px',
    objectFit: 'contain',
    zIndex: 10,
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
    fontFamily: 'Pretendard, sans-serif',
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
    fontFamily: 'Pretendard, sans-serif',
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
