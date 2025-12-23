import React, { useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Colors, FontStyles } from './styleConstants';
import PrimaryButton from './PrimaryButton';
// TODO: 백엔드와 정확한 엔드포인트가 다르면 여기만 바꾸면 됩니다.
const FIND_ID_ENDPOINT = '/auth/find-username';

function buildBirthdate(y, m) {
  const yy = (y || '').trim();
  const mm = (m || '').trim();
  if (!yy || !mm) return '';
  // 화면/에러 문구와 동일하게 YYYY-MM 형태로 전송
  const mm2 = String(Number(mm)).padStart(2, '0');
  return `${yy}/${mm2}`;
}

function onlyDigits(s) {
  return String(s ?? '').replace(/\D/g, '');
}

function isEmailComFormat(email) {
  const v = String(email ?? '').trim();
  // "user@domain.com" 형태를 의도한 요구사항으로 해석 (대소문자 무관)
  return /^[^\s@]+@[^\s@]+\.com$/i.test(v);
}

function inRangeInt(value, min, max) {
  if (value === '' || value == null) return false;
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max;
}

function preventNonDigitKeyDown(e) {
  // 조합/단축키는 그대로 통과
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

export default function FindIdModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [birthY, setBirthY] = useState('');
  const [birthM, setBirthM] = useState('');
  const [gender, setGender] = useState(''); // '남' | '여'
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [errorText, setErrorText] = useState('');

  const birthdate = useMemo(() => buildBirthdate(birthY, birthM), [birthY, birthM]);
  const emailOk = useMemo(() => isEmailComFormat(email), [email]);
  const birthOk = useMemo(() => {
    const yOk = /^\d{4}$/.test(birthY) && inRangeInt(birthY, 1900, 2025);
    const mOk = /^\d{1,2}$/.test(birthM) && inRangeInt(birthM, 1, 12);
    return yOk && mOk;
  }, [birthY, birthM]);

  const emailError = useMemo(() => {
    if (!email.trim()) return '';
    return emailOk ? '' : '유효한 이메일 주소를 입력하세요';
  }, [email, emailOk]);
  const birthError = useMemo(() => {
    if (!birthY && !birthM) return '';
    return birthOk ? '' : '올바른 형식은 2001-01 입니다.';
  }, [birthY, birthM, birthOk]);

  const canSubmit = useMemo(() => {
    return emailOk && birthOk && birthdate && (gender === '남' || gender === '여') && !loading;
  }, [emailOk, birthOk, birthdate, gender, loading]);

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setErrorText('');
    setResultText('');
    try {
      const body = { email: email.trim(), birthdate, gender };
      const { data } = await axiosInstance.post(FIND_ID_ENDPOINT, body);

      // 응답 형태가 확정되지 않아서 최대한 유연하게 처리
      const msg =
        data?.message ||
        data?.detail ||
        (typeof data === 'string' ? data : null);
      const found =
        data?.username ||
        data?.user_id ||
        data?.email ||
        data?.result ||
        null;

      if (found) {
        setResultText(`사용자의 아이디(이메일)은 ${found} 입니다.`);
      } else if (msg) {
        setResultText(String(msg));
      } else {
        setResultText('요청이 완료되었습니다.');
      }
    } catch (e) {
      const status = e?.response?.status;
      const detail = e?.response?.data?.detail || e?.response?.data?.message;
      setErrorText(
        status === 404
          ? `아이디 찾기 API 경로가 달라서 실패했습니다. (${FIND_ID_ENDPOINT})`
          : (detail ? String(detail) : '아이디 찾기에 실패했습니다.')
      );
    } finally {
      setLoading(false);
    }
  };

  const GenderButton = ({ label }) => {
    const selected = gender === label;
    return (
      <button
        type="button"
        onClick={() => setGender(label)}
        style={{
          flex: 1,
          height: 56,
          background: selected ? Colors.grey01 : '#fff',
          border: `1px solid ${selected ? Colors.brandPrimary : Colors.grey02}`,
          color: Colors.grey06,
          cursor: 'pointer',
          ...FontStyles.body,
        }}
      >
        {label === '남' ? '남자' : '여자'}
      </button>
    );
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
        아이디 찾기
      </div>

      {/* 입력 섹션: 공통 폭을 맞춰 좌/우 라인이 딱 맞도록 */}
      <div style={{ width: 'min(520px, 100%)', margin: '0 auto' }}>
        {/* 이메일 */}
        <div style={{ ...FontStyles.bodyBold, color: Colors.grey06, marginBottom: 10 }}>
          이메일을 입력해 주세요.
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

        {/* 생년월일 */}
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
        </div>
        {!!birthError && (
          <div style={{ marginBottom: 18, ...FontStyles.caption, color: Colors.systemRed, textAlign: 'center' }}>
            {birthError}
          </div>
        )}

        {/* 성별 */}
        <div style={{ ...FontStyles.bodyBold, color: Colors.grey06, marginBottom: 10 }}>
          성별을 선택해 주세요.
        </div>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'center', gap: 18, marginBottom: 28 }}>
          <GenderButton label="남" />
          <GenderButton label="여" />
        </div>
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
            아이디 찾기
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


