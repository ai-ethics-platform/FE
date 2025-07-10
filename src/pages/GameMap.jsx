// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// import Layout from '../components/Layout';
// import GameMapFrame from '../components/GameMapFrame';

// import homeIcon from '../assets/homeIcon.svg';
// import aiIcon from '../assets/aiIcon.svg';
// import internationalIcon from '../assets/internationalIcon.svg';

// export default function GameMap() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const originalOverflow = document.body.style.overflow;
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = originalOverflow;
//     };
//   }, []);

//   const subtopic = '라운드 선택';
//   const round = Number(localStorage.getItem('currentRound') ?? 1); // 라운드 정보 표시

//   const handleSelect = (subtopic) => {
//     const category = localStorage.getItem('category') || '안드로이드';
//     const mode = 'neutral';

//     console.log('[선택된 값 확인]');
//     console.log('category:', category);
//     console.log('subtopic:', subtopic);
//     console.log('mode:', mode);

//     localStorage.setItem('category', category);
//     localStorage.setItem('subtopic', subtopic);
//     localStorage.setItem('mode', mode);

//     navigate('/game01', {
//       state: { category, subtopic, mode },
//     });
//   };

//   return (
//     <Layout
//       subtopic={subtopic}
//       round={round}
//       me="1P"
//     >
//       {/* 카드 프레임 영역만 children으로 들어감 */}
//       <div style={{
//         display: 'flex',
//         flexDirection: 'row',
//         gap: 8,
//         marginLeft: 60,
//         marginTop: 12,
//       }}>
//         <GameMapFrame
//           icon={homeIcon}
//           title="가정"
//           options={['가정 1', '가정 2']}
//           onSelectOption={handleSelect}
//         />

//         <GameMapFrame
//           icon={aiIcon}
//           title="국가 인공지능 위원회"
//           options={['국가 인공지능 위원회 1', '국가 인공지능 위원회 2']}
//           onSelectOption={handleSelect}
//         />

//         <GameMapFrame
//           icon={internationalIcon}
//           title="국제 인류발전 위원회"
//           options={['국제 인류 발전 위원회 1']}
//           onSelectOption={handleSelect}
//         />
//       </div>
//     </Layout>
//   );
// }
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import GameMapFrame from '../components/GameMapFrame';

import homeIcon from '../assets/homeIcon.svg';
import aiIcon from '../assets/aiIcon.svg';
import internationalIcon from '../assets/internationalIcon.svg';

export default function GameMap() {
  const navigate = useNavigate();

  const subtopic = '라운드 선택';
  const round = Number(localStorage.getItem('currentRound') ?? 1);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleSelect = (subtopic) => {
    const category = localStorage.getItem('category') || '안드로이드';
    const mode = 'neutral';

    localStorage.setItem('category', category);
    localStorage.setItem('subtopic', subtopic);
    localStorage.setItem('mode', mode);

    navigate('/game01', {
      state: { category, subtopic, mode },
    });
  };

  // ✅ 완료된 토픽 불러오기
  const completedTopics = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
  const isCompleted = (name) => completedTopics.includes(name);

  // ✅ 해금된 옵션 계산
  const getUnlockedOptions = () => {
    const unlocked = new Set(['가정 1']); // 기본 해금

    if (isCompleted('가정 1')) {
      unlocked.add('가정 2');
      unlocked.add('국가 인공지능 위원회 1');
    }
    if (isCompleted('국가 인공지능 위원회 1')) {
      unlocked.add('국가 인공지능 위원회 2');
      unlocked.add('국제 인류 발전 위원회 1');
    }

    return unlocked;
  };

  const unlockedOptions = getUnlockedOptions();

  // ✅ 옵션 생성 함수
  const createOption = (text) => ({
    text,
    disabled: !unlockedOptions.has(text),
    onClick: () => handleSelect(text),
  });

  return (
    <Layout subtopic={subtopic} round={round} me="1P">
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 8,
          marginLeft: 60,
          marginTop: 12,
        }}
      >
        {/* 가정 */}
        <GameMapFrame
          icon={homeIcon}
          title="가정"
          option1={createOption('가정 1')}
          option2={createOption('가정 2')}
        />

        {/* 국가 인공지능 위원회 */}
        <GameMapFrame
          icon={aiIcon}
          title="국가 인공지능 위원회"
          option1={createOption('국가 인공지능 위원회 1')}
          option2={createOption('국가 인공지능 위원회 2')}
        />

        {/* 국제 인류발전 위원회 */}
        <GameMapFrame
          icon={internationalIcon}
          title="국제 인류발전 위원회"
          option1={createOption('국제 인류 발전 위원회 1')}
        />
      </div>
    </Layout>
  );
}
