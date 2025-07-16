// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';

// import Layout from '../components/Layout';
// import SelectCardToggle from '../components/SelectButton';
// import Continue from '../components/Continue';
// import contentBoxFrame from '../assets/contentBox4.svg';
// import { Colors, FontStyles } from '../components/styleConstants';

// import { getDilemmaImages } from '../components/dilemmaImageLoader';
// import axiosInstance from '../api/axiosInstance';
// import { fetchWithAutoToken } from '../utils/fetchWithAutoToken';

// const CARD_W = 640;
// const CARD_H = 170;
// const CIRCLE = 16;
// const BORDER = 2;
// const LINE = 3;

// export default function Game03() {
//   const nav = useNavigate();
//   const pollingRef = useRef(null);

//   // localStorage
//   const roleId        = Number(localStorage.getItem('role_id'));
//   const roomCode      = localStorage.getItem('room_code') ?? '';
//   const category      = localStorage.getItem('category') ?? '안드로이드';
//   const subtopic      = localStorage.getItem('subtopic') ?? '가정 1';
//   const mode          = localStorage.getItem('mode') ?? 'neutral';
//   const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex') ?? 0);

//   // roleName 매핑
//   const roleNames = { 1: '요양보호사 K', 2: '노모 L', 3: '자녀 J' };
//   const roleName  = roleNames[roleId] || '요양보호사 K';

//   const comicImages = getDilemmaImages(category, subtopic, mode, selectedIndex);

//   // state
//   const [step, setStep]         = useState(1);
//   const [agree, setAgree]       = useState(null);
//   const [conf, setConf]         = useState(0);
//   const [isWaiting, setWaiting] = useState(false);
//   const pct = conf ? ((conf - 1) / 4) * 100 : 0;

//   const [round, setRound] = useState(1);
//   useEffect(() => {
//     const completed     = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
//     const calculated    = completed.length + 1;
//     setRound(calculated);
//     localStorage.setItem('currentRound', calculated.toString());
//   }, []);
//   // consensus 상태 확인 (폴링)
//   const pollConsensus = async () => {
//     try {
//       await fetchWithAutoToken();
//       const res = await axiosInstance.get(
//         `/rooms/${roomCode}/rounds/${round}/status`
//       );
//       console.log('개인선택 조회 response ▶', res.data);

//     //  const { all_completed } = res.data;
//       if (res.data.all_completed) {
//         clearTimeout(pollingRef.current);
//         setWaiting(false);
//         setStep(2);
//         console.log("개인선택 전체 완료");
//       } else {
//         pollingRef.current = setTimeout(pollConsensus, 2000);
//       }
//     } catch (err) {
//       console.error('방에서의 선택 조회 중 오류:', err);
//       // 실패 시 잠시 후 재시도
//       pollingRef.current = setTimeout(pollConsensus, 5000);
//     }
//   };
//   const accessToken  = localStorage.getItem('access_token');
//   const refreshToken = localStorage.getItem('refresh_token');
//  console.log("accesstoken: ",accessToken);
//  console.log('refreshToken:',refreshToken);
//   // 개인 선택 POST 및 consensus 폴링 시작
//   const handleSubmitChoice = async () => {
//     const choiceInt = agree === 'agree' ? 1 : 2;
//     try {
//       setWaiting(true);
//       await fetchWithAutoToken();
//       await axiosInstance.post(
//         `/rooms/rooms/round/${roomCode}/choice`,
//         { round_number: round, choice: choiceInt }
//       );
//       // 선택 성공 후에 consensus 시작
//       pollConsensus();
//     } catch (err) {
//       console.error('선택 전송 중 오류:', err);
//       setWaiting(false);
//     }
//   };

//   return (
//     <Layout subtopic={subtopic} round={round} me="3P">

//       {step === 1 && (
//         <>
//           <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
//             {comicImages.map((img, idx) => (
//               <img
//                 key={idx}
//                 src={img}
//                 alt={`설명 이미지 ${idx + 1}`}
//                 style={{ width: 230, height: 135.38, objectFit: 'contain' }}
//               />
//             ))}
//           </div>

//           <Card width={936} height={216} extraTop={60}>
//             <p style={title}>
//               Q1) 당신은 <strong>{roleName}</strong>입니다.<br/>
//               24시간 개인정보 수집 업데이트에 동의하시겠습니까?
//             </p>
//             <div style={{ display: 'flex', gap: 24 }}>
//               <SelectCardToggle
//                 label="동의"
//                 selected={agree === 'agree'}
//                 onClick={() => setAgree('agree')}
//                 width={220}
//                 height={56}
//               />
//               <SelectCardToggle
//                 label="비동의"
//                 selected={agree === 'disagree'}
//                 onClick={() => setAgree('disagree')}
//                 width={220}
//                 height={56}
//               />
//             </div>
//           </Card>

//           <div style={{ marginTop: 40, textAlign: 'center' }}>
//             {isWaiting ? (
//               <p>다른 플레이어 선택을 기다리는 중…</p>
//             ) : (
//               <Continue
//                 width={264}
//                 height={72}
//                 step={1}
//                 disabled={!agree}
//                 onClick={handleSubmitChoice}
//               />
//             )}
//           </div>
//         </>
//       )}

//       {step === 2 && (
//         <>
//           <Card width={936} height={216} extraTop={150}>
//             <p style={title}>Q2) 당신의 선택에 얼마나 확신이 있나요?</p>
//             <div style={{ position: 'relative', width: '80%', minWidth: 300 }}>
//               <div
//                 style={{
//                   position: 'absolute',
//                   top: 12, left: 0, right: 0,
//                   height: LINE, background: Colors.grey03,
//                 }}
//               />
//               <div
//                 style={{
//                   position: 'absolute',
//                   top: 12, left: 0,
//                   width: `${pct}%`, height: LINE,
//                   background: Colors.brandPrimary,
//                 }}
//               />
//               <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
//                 {[1,2,3,4,5].map((n) => {
//                   const isNow = conf === n;
//                   const passed = conf > n;
//                   return (
//                     <div key={n} style={{ textAlign: 'center' }}>
//                       <div
//                         onClick={() => setConf(n)}
//                         style={{
//                           width: CIRCLE, height: CIRCLE,
//                           borderRadius: '50%',
//                           background: isNow ? Colors.grey01 : passed ? Colors.brandPrimary : Colors.grey03,
//                           border: `${BORDER}px solid ${isNow ? Colors.brandPrimary : 'transparent'}`,
//                           cursor: 'pointer', margin: '0 auto',
//                         }}
//                       />
//                       <span style={{...FontStyles.caption, color: Colors.grey06, marginTop:4, display:'inline-block'}}>
//                         {n}
//                       </span>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </Card>

//           <div style={{ marginTop: 80 }}>
//             <Continue
//               width={264}
//               height={72}
//               step={2}
//               disabled={conf === 0}
//               onClick={() => nav('/game04', { state: { agreement: agree, confidence: conf } })}
//             />
//           </div>
//         </>
//       )}

//     </Layout>
//   );
// }

// function Card({ children, extraTop = 0, width = CARD_W, height = CARD_H, style = {} }) {
//   return (
//     <div style={{ width, height, marginTop: extraTop, position: 'relative', ...style }}>
//       <img src={contentBoxFrame} alt="" style={{ width:'100%', height:'100%', objectFit:'fill' }} />
//       <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:24, padding:'0 24px' }}>
//         {children}
//       </div>
//     </div>
//   );
// }

// const title = {
//   ...FontStyles.title,
//   color: Colors.grey06,
//   textAlign: 'center',
// };
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import SelectCardToggle from '../components/SelectButton';
import Continue from '../components/Continue';
import contentBoxFrame from '../assets/contentBox4.svg';
import { Colors, FontStyles } from '../components/styleConstants';

import { getDilemmaImages } from '../components/dilemmaImageLoader';
import axiosInstance from '../api/axiosInstance';
import { fetchWithAutoToken } from '../utils/fetchWithAutoToken';

const CARD_W = 640;
const CARD_H = 170;
const CIRCLE = 16;
const BORDER = 2;
const LINE = 3;

export default function Game03() {
  const nav = useNavigate();
  const pollingRef = useRef(null);

  // localStorage에서 값 가져오기
  const roleId        = Number(localStorage.getItem('myrole_id'));
  const roomCode      = localStorage.getItem('room_code') ?? '';
  const category      = localStorage.getItem('category') ?? '안드로이드';
  const subtopic      = localStorage.getItem('subtopic') ?? '가정 1';
  const mode          = 'neutral';
  const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex') ?? 0);

  // role_id → 역할 이름 매핑
  const roleNames = { 1: '요양보호사 K', 2: '노모 L', 3: '자녀 J' };
  const roleName  = roleNames[roleId] || '요양보호사 K';

  const comicImages = getDilemmaImages(category, subtopic, mode, selectedIndex);

  // 상태
  const [step, setStep]         = useState(1);
  const [agree, setAgree]       = useState(null);
  const [conf, setConf]         = useState(0);
  const [isWaiting, setWaiting] = useState(false);
  const pct = conf ? ((conf - 1) / 4) * 100 : 0;

  const [round, setRound] = useState(1);
  useEffect(() => {
    const completed  = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const calculated = completed.length + 1;
    setRound(calculated);
    localStorage.setItem('currentRound', calculated.toString());
    return () => clearTimeout(pollingRef.current);
  }, []);

  // step 1: 개인 동의/비동의 POST 후 consensus 폴링 시작
  const handleSubmitChoice = async () => {
    const choiceInt = agree === 'agree' ? 1 : 2;
    try {
      setWaiting(true);
      await fetchWithAutoToken();
      await axiosInstance.post(
        `/rooms/rooms/round/${roomCode}/choice`,
        { round_number: round, choice: choiceInt }
      );
      pollConsensus();
    } catch (err) {
      console.error('선택 전송 중 오류:', err);
      setWaiting(false);
    }
  };

  // all_completed 체크 폴링
  const pollConsensus = async () => {
    try {
      await fetchWithAutoToken();
      const res = await axiosInstance.get(
        `/rooms/${roomCode}/rounds/${round}/status`
      );
      console.log('pollConsensus ▶', res.data);
      if (res.data.all_completed) {
        clearTimeout(pollingRef.current);
        setWaiting(false);
        setStep(2);
      } else {
        pollingRef.current = setTimeout(pollConsensus, 2000);
      }
    } catch (err) {
      console.error('consensus 조회 중 오류:', err);
      pollingRef.current = setTimeout(pollConsensus, 5000);
    }
  };

  // step 2: 확신 선택 POST 후 다음 페이지 이동
  const handleSubmitConfidence = async () => {
    try {
      await fetchWithAutoToken();
      await axiosInstance.post(
        `/rooms/rooms/round/${roomCode}/choice/confidence`,
        { round_number: round, confidence: conf }
      );
      console.log("확신도 선택 완료");
      nav('/game04', { state: { agreement: agree, confidence: conf } });
    } catch (err) {
      console.error('확신 전송 중 오류:', err);
    }
  };

  return (
    <Layout subtopic={subtopic} round={round} me="3P">

      {step === 1 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            {comicImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`설명 이미지 ${idx + 1}`}
                style={{ width: 230, height: 135.38, objectFit: 'contain' }}
              />
            ))}
          </div>

          <Card width={936} height={216} extraTop={60}>
            <p style={title}>
              Q1) 당신은 <strong>{roleName}</strong>입니다.<br/>
              24시간 개인정보 수집 업데이트에 동의하시겠습니까?
            </p>
            <div style={{ display: 'flex', gap: 24 }}>
              <SelectCardToggle
                label="동의"
                selected={agree === 'agree'}
                onClick={() => setAgree('agree')}
                width={220}
                height={56}
              />
              <SelectCardToggle
                label="비동의"
                selected={agree === 'disagree'}
                onClick={() => setAgree('disagree')}
                width={220}
                height={56}
              />
            </div>
          </Card>

          <div style={{ marginTop: 40, textAlign: 'center' }}>
            {isWaiting ? (
              <p>다른 플레이어 선택을 기다리는 중…</p>
            ) : (
              <Continue
                width={264}
                height={72}
                step={1}
                disabled={!agree}
                onClick={handleSubmitChoice}
              />
            )}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <Card width={936} height={216} extraTop={150}>
            <p style={title}>Q2) 당신의 선택에 얼마나 확신이 있나요?</p>
            <div style={{ position: 'relative', width: '80%', minWidth: 300 }}>
              <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: LINE, background: Colors.grey03 }} />
              <div style={{ position: 'absolute', top: 12, left: 0, width: `${pct}%`, height: LINE, background: Colors.brandPrimary }} />
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
                {[1,2,3,4,5].map((n) => {
                  const isNow = conf === n;
                  const passed = conf > n;
                  return (
                    <div key={n} style={{ textAlign: 'center' }}>
                      <div
                        onClick={() => setConf(n)}
                        style={{
                          width: CIRCLE, height: CIRCLE,
                          borderRadius: '50%',
                          background: isNow ? Colors.grey01 : passed ? Colors.brandPrimary : Colors.grey03,
                          border: `${BORDER}px solid ${isNow ? Colors.brandPrimary : 'transparent'}`,
                          cursor: 'pointer', margin: '0 auto',
                        }}
                      />
                      <span style={{ ...FontStyles.caption, color: Colors.grey06, marginTop: 4, display: 'inline-block' }}>
                        {n}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <div style={{ marginTop: 80, textAlign: 'center' }}>
            <Continue
              width={264}
              height={72}
              step={2}
              disabled={conf === 0}
              onClick={handleSubmitConfidence}
            />
          </div>
        </>
      )}

    </Layout>
  );
}

function Card({ children, extraTop = 0, width = CARD_W, height = CARD_H, style = {} }) {
  return (
    <div style={{ width, height, marginTop: extraTop, position: 'relative', ...style }}>
      <img src={contentBoxFrame} alt="" style={{ width: '100%', height: '100%', objectFit: 'fill' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24, padding: '0 24px' }}>
        {children}
      </div>
    </div>
  );
}

const title = {
  ...FontStyles.title,
  color: Colors.grey06,
  textAlign: 'center',
};
