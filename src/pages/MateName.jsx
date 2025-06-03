// src/pages/MateName.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Layout          from '../components/Layout';       // 변경된 Layout 사용
import InputBoxSmall   from '../components/InputBoxSmall';
import ContentTextBox2 from '../components/ContentTextBox';

import character1 from '../assets/images/character1.png';
import character2 from '../assets/images/character2.png';
import character3 from '../assets/images/character3.png';

export default function MateName() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedIndex = location.state?.selectedIndex ?? 0;
  const images = [character1, character2, character3];

  const [name, setName] = useState('');

  const paragraphs = [
    {
      main: '  여러분이 사용자라면 HomeMate를 어떻게 부를까요?',
      sub: '(함께 토론한 후 1P가 입력하고 "다음" 버튼을 클릭해 주세요)',
    },
  ];

  const handleContinue = () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요!');
      return;
    }
    navigate('/game01', {
      state: { selectedIndex, name },
    });
  };

  return (
    <Layout subtopic="가정 1" me="1P">
      {/* Stage 내부 : 중앙 정렬 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {/* ① 선택된 캐릭터 이미지 */}
        <img
          src={images[selectedIndex]}
          alt="Selected Character"
          style={{
            width: 264,
            height: 360,
            objectFit: 'cover',
            borderRadius: 4,
            border: '2px solid #354750',
          }}
        />

        {/* ② 작은 입력창 */}
        <InputBoxSmall
          placeholder="여러분의 HomeMate 이름을 입력하세요"
          width={520}
          height={64}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* ③ 텍스트 박스 + 다음 버튼 */}
        <div style={{ width: '100%', maxWidth: 936 }}>
          <ContentTextBox2
            paragraphs={paragraphs}
            onContinue={handleContinue}
          />
        </div>
      </div>
    </Layout>
  );
}
