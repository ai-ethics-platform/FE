import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axiosInstance from '../../api/axiosInstance';
import Background from '../../components/Background';
import { translations } from '../../utils/language/index';

import logo from '../../assets/logo.svg';
import questionMark from '../../assets/Questionmark.svg';
import demoApplyKo from '../../assets/demoapply.svg';
import demoApplyEn from '../../assets/en/demoapply_en.svg';

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

export default function PlayApplication() {
  const navigate = useNavigate();

  const lang =
    localStorage.getItem('app_lang') ||
    localStorage.getItem('language') ||
    'ko';

  const t =
    translations[lang]?.PlayApplication ||
    translations.ko.PlayApplication;

  const demoApplyButton =
    lang === 'en'
      ? demoApplyEn
      : demoApplyKo;

  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const trimmedLastName = lastName.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (
      !trimmedLastName ||
      !trimmedFirstName ||
      !trimmedEmail
    ) {
      setErrorMessage(t.requiredField);
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setErrorMessage(t.invalidEmail);
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(
        '/play-applications',
        {
          last_name: trimmedLastName,
          first_name: trimmedFirstName,
          email: trimmedEmail,
          message: trimmedMessage || null,
        }
      );

      const application =
        response.data?.application || response.data;

      if (application?.status === 'approved') {
        navigate('/play-approval/approved', {
          replace: true,
        });
        return;
      }

      navigate('/play-approval/pending', {
        replace: true,
      });
    } catch (error) {
      const fallbackMessage =
        lang === 'en'
          ? '신청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. (미번역)'
          : '신청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

      setErrorMessage(
        getApiErrorMessage(error, fallbackMessage)
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <section style={styles.leftSection}>
            <img
              src={logo}
              alt="DILEMMA.I"
              draggable={false}
              style={styles.logo}
            />

            <div style={styles.title}>
              {t.title}
            </div>

            <div style={styles.descriptionArea}>
              <div style={styles.description}>
                {t.description}
              </div>

              <div style={styles.periodDescription}>
                {t.periodDescription}
              </div>
            </div>
          </section>

          <section style={styles.rightSection}>
            <div style={styles.nameRow}>
              <input
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setErrorMessage('');
                }}
                placeholder={t.lastNamePlaceholder}
                style={styles.nameInput}
                disabled={isSubmitting}
              />

              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setErrorMessage('');
                }}
                placeholder={t.firstNamePlaceholder}
                style={styles.nameInput}
                disabled={isSubmitting}
              />
            </div>

            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage('');
              }}
              placeholder={t.emailPlaceholder}
              style={styles.emailInput}
              disabled={isSubmitting}
            />

            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setErrorMessage('');
              }}
              placeholder={t.messagePlaceholder}
              style={styles.messageInput}
              disabled={isSubmitting}
            />

            <div style={styles.errorArea}>
              {errorMessage && (
                <div style={styles.errorMessage}>
                  {errorMessage}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              style={{
                ...styles.submitButton,
                ...(isSubmitting
                  ? styles.submitButtonDisabled
                  : {}),
              }}
              disabled={isSubmitting}
            >
              <img
                src={demoApplyButton}
                alt=""
                draggable={false}
                style={styles.submitButtonImage}
              />
            </button>
          </section>
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
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 'min(1120px, 76vw)',
    minHeight: '620px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    backgroundColor: '#FCFDFA',
    clipPath:
      'polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px)',
    boxSizing: 'border-box',
    padding: '90px 90px 72px',
  },

  leftSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingRight: '60px',
    boxSizing: 'border-box',
  },

  logo: {
    width: '330px',
    maxWidth: '100%',
    height: 'auto',
    objectFit: 'contain',
    marginBottom: '22px',
  },

  title: {
    fontFamily:
      'Cafe24Ohsquareair, Pretendard, sans-serif',
    fontSize: '26px',
    fontWeight: 600,
    lineHeight: 1.45,
    color: '#252C30',
    whiteSpace: 'pre-line',
  },

  descriptionArea: {
    marginTop: 'auto',
    paddingBottom: '40px',
  },

  description: {
    fontFamily: 'Pretendard, sans-serif',
    fontSize: '18px',
    fontWeight: 500,
    lineHeight: 1.45,
    color: '#3D484D',
    whiteSpace: 'pre-line',
    marginBottom: '18px',
  },

  periodDescription: {
    fontFamily: 'Pretendard, sans-serif',
    fontSize: '18px',
    fontWeight: 500,
    lineHeight: 1.45,
    color: '#3D484D',
    whiteSpace: 'pre-line',
  },

  rightSection: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingTop: '5px',
  },

  nameRow: {
    width: '100%',
    display: 'flex',
    gap: '22px',
  },

  nameInput: {
    width: '50%',
    height: '70px',
    border: 'none',
    outline: 'none',
    padding: '0 24px',
    backgroundColor: '#E6ECEF',
    fontFamily: 'Pretendard, sans-serif',
    fontSize: '16px',
    color: '#252C30',
    boxSizing: 'border-box',
    userSelect: 'text',
  },

  emailInput: {
    width: '100%',
    height: '70px',
    marginTop: '38px',
    border: 'none',
    outline: 'none',
    padding: '0 24px',
    backgroundColor: '#E6ECEF',
    fontFamily: 'Pretendard, sans-serif',
    fontSize: '16px',
    color: '#252C30',
    boxSizing: 'border-box',
    userSelect: 'text',
  },

  messageInput: {
    width: '100%',
    height: '230px',
    marginTop: '38px',
    border: 'none',
    outline: 'none',
    resize: 'none',
    padding: '24px',
    backgroundColor: '#E6ECEF',
    fontFamily: 'Pretendard, sans-serif',
    fontSize: '15px',
    lineHeight: 1.5,
    color: '#252C30',
    boxSizing: 'border-box',
    userSelect: 'text',
  },

  errorArea: {
    minHeight: '30px',
    paddingTop: '8px',
  },

  errorMessage: {
    fontFamily: 'Pretendard, sans-serif',
    fontSize: '13px',
    color: '#dc2626',
  },

  submitButton: {
    alignSelf: 'flex-end',
    marginTop: '4px',
    padding: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },

  submitButtonDisabled: {
    cursor: 'default',
    opacity: 0.55,
  },

  submitButtonImage: {
    display: 'block',
    width: '260px',
    height: 'auto',
  },
};
