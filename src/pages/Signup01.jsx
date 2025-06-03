import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import arrow from '../assets/arrow-left.svg';
import arrowUp from '../assets/arrowUp.svg';
import SelectCard from '../components/SelectCard';
import PrimaryButton from '../components/PrimaryButton';
import logo from '../assets/logo.svg';

export default function Signup() {
  const [showInfo, setShowInfo] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);

  const isAllAgreed = agree1 && agree2;
  const navigate = useNavigate();

  return (
    <Background bgIndex={2}>
      <div
        style={{
          maxWidth: 552,
          margin: '0 auto',
          padding: '40px 24px',
          fontFamily: 'Pretendard, sans-serif',
          color: '#1E293B',
        }}
      >
        {/* 뒤로가기 + 로고 */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <img
            src={arrow}
            alt="back"
            style={{
              cursor: 'pointer',
              position: 'absolute',
              left: 'calc(50% - 280px)',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            onClick={() => navigate('/')}
          />
          <div style={{ textAlign: 'center' }}>
            <img src={logo} alt="logo" style={{ height: 48 }} />
          </div>
        </div>

        {/* 연구 소개 */}
        <div
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            backgroundColor: '#F1F5F9',
            padding: 16,
            borderRadius: 8,
            border: '1px solid #CBD5E1',
          }}
        >
          본 연구의 목적은 AI 윤리교육의 새로운 학습 방식을 제안하기 위해 도덕적 추론과 사고 중심의 AI 윤리 교수학습을 지원하는 대화형 게임 플랫폼을 개발하고, 이에 대한 효과성을 검증하는 것입니다.
          <br />
          <br />
          게임은 AI와 관련한 딜레마 상황에서의 의사결정을 자연스러운 대화 과정에서 시뮬레이션 하는 형식으로 진행되며, 대화 중 수집되는 정보는 연구에만 사용됩니다.
        </div>

        {/* 수집 및 활용 항목 토글 */}
        <div
          style={{
            marginTop: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setShowInfo((prev) => !prev)}
        >
          <div style={{ fontWeight: 600 }}>수집 및 활용 항목 *</div>
          <img
            src={arrowUp}
            alt="toggle"
            style={{
              transform: showInfo ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </div>

        {showInfo && (
          <div
            style={{
              marginTop: 16,
              backgroundColor: '#F8FAFC',
              padding: 16,
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              color: '#374151',
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', paddingBottom: 8 }}>수집 항목</th>
                  <th style={{ textAlign: 'left', paddingBottom: 8 }}>활용 목적</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>아이디 및 비밀번호</td>
                  <td>참여자 구분, 실험 반복 방지 및 응답 관리</td>
                </tr>
                <tr>
                  <td>성별, 생년월일 및 학업 단계</td>
                  <td>성별, 연령, 학년 등 인구통계학적 요인에 따른 차이 분석</td>
                </tr>
                <tr>
                  <td>음성 대화 내용 및 발화 데이터</td>
                  <td>의사결정 과정 및 윤리적 판단 기준에 대한 분석</td>
                </tr>
                <tr>
                  <td>게임 플레이 기록</td>
                  <td>의사결정 과정 및 윤리적 판단 기준에 대한 분석</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 데이터 보관 및 처리 방침 토글 */}
        <div
          style={{
            marginTop: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setShowPolicy((prev) => !prev)}
        >
          <div style={{ fontWeight: 600 }}>데이터 보관 및 처리 방침 *</div>
          <img
            src={arrowUp}
            alt="toggle"
            style={{
              transform: showPolicy ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </div>

        {showPolicy && (
          <div
            style={{
              marginTop: 16,
              fontSize: 14,
              color: '#374151',
              backgroundColor: '#F8FAFC',
              padding: 16,
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              lineHeight: 1.6,
            }}
          >
            <p>
              - 수집된 데이터는 AI 윤리와 관련된 사용자의 선택을 분석하는 데 활용됩니다.
            </p>
            <p>
              - A는 A 플랫폼의 운영과 관련하여 생성되는 데이터 및 기타 정보를 수집·집계·분석할 권리를 가지며, 이를 통해 ① 플랫폼 기능을 개발·개선하고, ② 개인을 식별할 수 없는 익명화된 형태로 도출된 결과를 자유롭게 공개할 수 있습니다.
            </p>
            <p>
              - 사용자는 idllabewha@gmail.com 으로 서면 요청함으로써 자신의 개인정보 삭제 및 데이터 활용에 대한 동의를 철회할 수 있습니다.
            </p>
            <p>
              - 연구 목적으로 이용에 동의한 데이터는 사용자 개인정보와 분리되어 안전하게 암호화된 상태로 저장되며, n년간 보관 후 폐기됩니다.
            </p>
            <p>
              - 모든 데이터는 비식별화 처리되어 개인이 식별되지 않도록 안전하게 관리됩니다.
            </p>
          </div>
        )}

        {/* 연구 책임자 및 문의처 토글 */}
        <div
          style={{
            marginTop: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setShowContact((prev) => !prev)}
        >
          <div style={{ fontWeight: 600 }}>연구 책임자 및 문의처 *</div>
          <img
            src={arrowUp}
            alt="toggle"
            style={{
              transform: showContact ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </div>

        {showContact && (
          <div
            style={{
              marginTop: 16,
              fontSize: 14,
              color: '#374151',
              backgroundColor: '#F8FAFC',
              padding: 16,
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              lineHeight: 1.6,
            }}
          >
            <p>- 연구 책임자: 이화여자대학교 교육공학과 소효정 교수 연구팀</p>
            <p>- 연락처: idllabewha@gmail.com</p>
          </div>
        )}

        {/* 체크박스들 */}
        <div style={{ marginTop: 24 }}>
          <SelectCard
            label="개인정보 수집 및 연구 활용에 동의합니다."
            selected={agree1}
            onClick={() => setAgree1((prev) => !prev)}
          />
          <div style={{ height: 16 }} />
          <SelectCard
            label="중등 및 대학생 대상 AI 체험설계 연구에 활용하는 것에 동의합니다."
            selected={agree2}
            onClick={() => setAgree2((prev) => !prev)}
          />
        </div>

        {/* 다음 버튼 */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <PrimaryButton disabled={!isAllAgreed} style={{ width: 552, height: 72 }} onClick={() => navigate('/signup02')}>다음</PrimaryButton>
        </div>
      </div>
    </Background>
  );
}