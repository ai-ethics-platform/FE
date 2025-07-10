// 결과 
import React from 'react';
import { useNavigate } from 'react-router-dom';

import Layout       from '../components/Layout';   // ← Layout 사용
import ContentBox2  from '../components/ContentBox2';
//import Continue from '../components/Continue';

const fullText =
  '  여러분의 결정으로 가정용 로봇은 보다 정확한 서비스를 제공하였고, 여러분의 친구처럼 제 역할을 다하고 있습니다. '
export default function Game09() {
  const navigate = useNavigate();
  const subtopic = '다른 사람들이 선택한 미래 ';

  return (
    <Layout subtopic={subtopic} me="1P">
      {/* Stage 안에서는 자유롭게 배치 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
        }}
      >
        {/* 본문 텍스트 박스 */}
        <ContentBox2 text={fullText} width={936} height={107} />
      </div>
    </Layout>
  );
}
