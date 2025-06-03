// src/pages/GameIntro.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

import Layout       from '../components/Layout';   // ← Layout 사용
import ContentBox2  from '../components/ContentBox2';
import Continue     from '../components/Continue';

const fullText =
  '  우리 가족은 최종적으로  감정 업데이트에 동의하였고,\n' +
  '   HomeMate와 더욱 친밀한 교류를 이어나가게 되었습니다.\n\n' +
  '   비록 몇몇 문제들이 있었지만 HomeMate의 편의성 덕분에 이후\n' +
  '   우리 가정 뿐 아니라 여러 가정에서 HomeMate를 사용하게 되었습니다.\n\n' +
  '   이후, 가정 뿐 아니라 국가적인 고민거리들이 나타나게 되는데...';

export default function GameIntro() {
  const navigate = useNavigate();
  const subtopic = '가정 1';

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
        <ContentBox2 text={fullText} width={936} height={407} />

        {/* 다음 버튼 */}
        <Continue
          width={264}
          height={72}
          step={1}
          onClick={() => {
            console.log('클릭됨');
            navigate('/selectroom');
          }}
        />
      </div>
    </Layout>
  );
}
