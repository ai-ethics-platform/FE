import React, { useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Colors, FontStyles } from './styleConstants';
import PrimaryButton from './PrimaryButton';

// TODO: 백엔드와 정확한 엔드포인트가 다르면 여기만 바꾸면 됩니다.
const FIND_PW_ENDPOINT = '/auth/find-password';

function buildBirthdate(y, m, d) {
  const yy = (y || '').trim();
  const mm = (m || '').trim();
  const dd = (d || '').trim();
  if (!yy || !mm || !dd) return '';
  return `${yy}/${mm}/${dd}`;
}

function onlyDigits(s) {
  return String(s ?? '').replace(/\D/g, '');
}

function isEmailComFormat(email) {
  const v = String(email ?? '').trim();
  return /^[^\s@]+@[^\s@]+\.com$/i.test(v);
}

function inRangeInt(value, min, max) {
  if (value === '' || value == null) return false;
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max;
}

function preventNonDigitKeyDown(e) {
  if (e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
  if (allowed.includes(e.key)) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
}

function BirthField({
  value,
  onChange,
  placeholder,
  width = 104,
  maxLength = 4,
  onKeyDown,
  onPaste,
  style,
}) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      inputMode="numeric"
      pattern="[0-9]*"
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      style={{
        ...(width ? { width } : {}),
        height: 56,
        background: Colors.grey01,
        border: 'none',
        borderRadius: 0,
        padding: '0 12px',
        textAlign: 'center',
        ...FontStyles.body,
        fontSize: 'clamp(1.02rem, 1.5vw, 1.15rem)',
        color: Colors.grey06,
        outline: 'none',
        ...style,
      }}
    />
  );
}

export default function FindPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [birthY, setBirthY] = useState('');
  const [birthM, setBirthM] = useState('');
  const [birthD, setBirthD] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [errorText, setErrorText] = useState('');

  const birthdate = useMemo(() => buildBirthdate(birthY, birthM, birthD), [birthY, birthM, birthD]);
  const emailOk = useMemo(() => isEmailComFormat(email), [email]);
  const birthOk = useMemo(() => {
    const yOk = /^\d{4}$/.test(birthY) && inRangeInt(birthY, 1900, 2025);
    const mOk = /^\d{1,2}$/.test(birthM) && inRangeInt(birthM, 1, 12);
    const dOk = /^\d{1,2}$/.test(birthD) && inRangeInt(birthD, 1, 31);
    return yOk && mOk && dOk;
  }, [birthY, birthM, birthD]);

  const emailError = useMemo(() => {
    if (!email.trim()) return '';
    return emailOk ? '' : '유효한 이메일 주소를 입력하세요';
  }, [email, emailOk]);
  const birthError = useMemo(() => {
    if (!birthY && !birthM && !birthD) return '';
    return birthOk ? '' : '올바른 형식은 2001-01 입니다.';
  }, [birthY, birthM, birthD, birthOk]);

  const canSubmit = useMemo(() => {
    return emailOk && birthOk && birthdate && !loading;
  }, [emailOk, birthOk, birthdate, loading]);

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setErrorText('');
    setResultText('');
    try {
      const body = { email: email.trim(), birthdate };
      const { data } = await axiosInstance.post(FIND_PW_ENDPOINT, body);
      const msg = data?.message || data?.detail || (typeof data === 'string' ? data : null);
      setResultText(msg ? String(msg) : '입력하신 이메일로 비밀번호가 전송되었습니다.');
    } catch (e) {
      const status = e?.response?.status;
      const detail = e?.response?.data?.detail || e?.response?.data?.message;
      setErrorText(
        status === 404
          ? `비밀번호 찾기 API 경로가 달라서 실패했습니다. (${FIND_PW_ENDPOINT})`
          : (detail ? String(detail) : '비밀번호 찾기에 실패했습니다.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: 560,
        maxWidth: '92vw',
        background: '#FAFAF7',
        borderRadius: 0,
        padding: '32px 44px 28px',
        boxShadow: '0 18px 46px rgba(0,0,0,0.22)',
        position: 'relative',
      }}
    >
      <button
        type="button"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 18,
          right: 18,
          width: 30,
          height: 30,
          border: 'none',
          background: Colors.brandPrimary,
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: '#fff', fontSize: 18, lineHeight: 1 }}>×</span>
      </button>

      <div style={{ ...FontStyles.headlineSmall, textAlign: 'center', color: Colors.brandPrimary, marginBottom: 28 }}>
        비밀번호 찾기
      </div>

      {/* 입력 섹션: 공통 폭을 맞춰 좌/우 라인이 딱 맞도록 */}
      <div style={{ width: 'min(520px, 100%)', margin: '0 auto' }}>
        <div style={{ ...FontStyles.bodyBold, color: Colors.grey06, marginBottom: 10 }}>
          아이디(이메일)를 입력해 주세요.
        </div>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
          placeholder="user@example.com"
          inputMode="email"
          autoComplete="email"
          style={{
            width: '100%',
            height: 56,
            background: Colors.grey01,
            border: 'none',
            borderRadius: 0,
            padding: '0 12px',
            ...FontStyles.body,
            color: Colors.grey06,
            outline: 'none',
            marginBottom: emailError ? 10 : 22,
          }}
        />
        {!!emailError && (
          <div style={{ marginBottom: 18, ...FontStyles.caption, color: Colors.systemRed }}>
            {emailError}
          </div>
        )}

        <div style={{ ...FontStyles.bodyBold, color: Colors.grey06, marginBottom: 10 }}>
          생년월일을 입력해 주세요.
        </div>
        <div style={{ display: 'flex', width: '100%', gap: 18, marginBottom: birthError ? 10 : 22 }}>
          <BirthField
            value={birthY}
            onChange={(e) => setBirthY(e.target.value.slice(0, 4))}
            onKeyDown={preventNonDigitKeyDown}
            onPaste={(e) => {
              e.preventDefault();
              setBirthY(onlyDigits(e.clipboardData.getData('text')).slice(0, 4));
            }}
            placeholder="년도"
            width={undefined}
            maxLength={4}
            style={{ flex: 1.6, minWidth: 140 }}
          />
          <BirthField
            value={birthM}
            onChange={(e) => setBirthM(e.target.value.slice(0, 2))}
            onKeyDown={preventNonDigitKeyDown}
            onPaste={(e) => {
              e.preventDefault();
              setBirthM(onlyDigits(e.clipboardData.getData('text')).slice(0, 2));
            }}
            placeholder="월"
            width={undefined}
            maxLength={2}
            style={{ flex: 1, minWidth: 96 }}
          />
          <BirthField
            value={birthD}
            onChange={(e) => setBirthD(e.target.value.slice(0, 2))}
            onKeyDown={preventNonDigitKeyDown}
            onPaste={(e) => {
              e.preventDefault();
              setBirthD(onlyDigits(e.clipboardData.getData('text')).slice(0, 2));
            }}
            placeholder="일"
            width={undefined}
            maxLength={2}
            style={{ flex: 1, minWidth: 96 }}
          />
        </div>
        {!!birthError && (
          <div style={{ marginBottom: 18, ...FontStyles.caption, color: Colors.systemRed, textAlign: 'center' }}>
            {birthError}
          </div>
        )}
      </div>

      <PrimaryButton
        style={{
          width: 'min(216px, 63%)',
          height: 48,
          padding: '0 20px',
          display: 'block',
          margin: '24px auto 0',
          fontSize: 'clamp(0.95rem, 1.6vw, 1.05rem)',
        }}
        onClick={submit}
        disabled={!canSubmit}
      >
        {loading ? '전송 중...' : '비밀번호 찾기'}
      </PrimaryButton>

      {!!resultText && (
        <div style={{ marginTop: 18, textAlign: 'center', ...FontStyles.caption, color: Colors.brandPrimary }}>
          {resultText}
        </div>
      )}
      {!!errorText && (
        <div style={{ marginTop: 18, textAlign: 'center', ...FontStyles.caption, color: Colors.systemRed }}>
          {errorText}
        </div>
      )}
    </div>
  );
}


