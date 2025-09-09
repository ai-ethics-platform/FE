// // import React, { useEffect, useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import Background from '../components/Background';
// // import BackButton from '../components/BackButton';
// // import RoomCard from '../components/RoomCard';
// // import LogoutPopup from '../components/LogoutPopup'; 
// // import JoinRoom from '../components/JoinRoom';
// // import CreateRoom from '../components/Expanded/CreateDilemmaRoom';
// // import createIcon from '../assets/roomcreate.svg';
// // import joinIcon from '../assets/joinviacode.svg';
// // import dilemmaIcon from "../assets/dilemmaIcon.svg";
// // import { FontStyles,Colors } from '../components/styleConstants';

// // import GameFrame from "../components/GameFrame";
// // export default function SelectRoom() { 
// //   const navigate = useNavigate();
// //   const [title, setTitle] = useState(localStorage.getItem('creatorTitle') || '');

// //   const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false); 
// //   const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
// //   const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

// // useEffect(() => {
// //     const originalOverflow = document.body.style.overflow;
// //     document.body.style.overflow = 'hidden';
// //     return () => {
// //       document.body.style.overflow = originalOverflow;
// //     };
// //   }, []);

// //   const handleBackClick = () => {
// //     setIsLogoutPopupOpen(true); 
// //   };

// //   const handleLogout = () => {
// //     navigate('/'); 
// //   };
// //   return (
// //     <Background bgIndex={2}>
// //       <div
// //         style={{
// //           minHeight: '100vh',
// //           display: 'flex',
// //           justifyContent: 'center',
// //           alignItems: 'center',
// //           paddingTop: 0,
// //         }}
// //       >
// //         {/* 가운데 정렬된 세로 스택 */}
// //         <div
// //           style={{
// //             display: 'flex',
// //             flexDirection: 'column',
// //             alignItems: 'center',
// //             gap: 24,             // GameFrame과 카드 사이 간격
// //           }}
// //         >
// //           <GameFrame topic={title} hideArrows />
// //             <div
// //             style={{
// //               display: 'flex',
// //               flexDirection: 'row',
// //               gap: 20,
// //               flexWrap: 'nowrap',
// //               justifyContent: 'center',
// //               alignItems: 'stretch',
// //               width: '100%',
// //             }}
// //           >
// //             <RoomCard
// //               icon={createIcon}
// //               title="방 만들기"
// //               description={
// //                 <>
// //                   새로운 방을 만들고<br />
// //                   시뮬레이션을 시작하세요.
// //                 </>
// //               }
// //               onClick={() => setIsCreateRoomOpen(true)}
// //             />
// //             <RoomCard
// //               icon={joinIcon}
// //               title="방 참여하기"
// //               description={
// //                 <>
// //                   코드를 통해 비공개 방에<br />
// //                   참여할 수 있습니다.
// //                 </>
// //               }
// //               onClick={() => setIsJoinRoomOpen(true)}
// //             />
// //           </div>
// //         </div>
// //       </div>
  
// //       {/* 팝업들 */}
// //       {isLogoutPopupOpen && (
// //         <div style={overlayStyle}>
// //           <LogoutPopup
// //             onClose={() => setIsLogoutPopupOpen(false)}
// //             onLogout={handleLogout}
// //           />
// //         </div>
// //       )}
  
// //       {isJoinRoomOpen && (
// //         <div style={overlayStyle}>
// //           <JoinRoom onClose={() => setIsJoinRoomOpen(false)} />
// //         </div>
// //       )}
  
// //       {isCreateRoomOpen && (
// //         <div style={{ ...overlayStyle, backgroundColor: 'rgba(103,103,103,0.4)' }}>
// //           <CreateRoom disabled={true} onClose={() => setIsCreateRoomOpen(false)} />
// //         </div>
// //       )}
// //     </Background>
// //   );
// // }
// // const overlayStyle = {
// //     position: 'fixed',
// //     top: 0,
// //     left: 0,
// //     width: '100vw',
// //     height: '100vh',
// //     backgroundColor: 'rgba(0, 0, 0, 0.4)',
// //     display: 'flex',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     zIndex: 100,
// //   };

// // 여기에서 GET 해와서 이미지 모두 저장하고 데이터 모두 저장해서 subtopic 저장하기 
// import React, { useEffect, useState } from 'react';
// import { useNavigate,useLocation } from 'react-router-dom';
// import Background from '../components/Background';
// import BackButton from '../components/BackButton';
// import RoomCard from '../components/RoomCard';
// import LogoutPopup from '../components/LogoutPopup'; 
// import JoinRoom from '../components/JoinRoom';
// import CreateRoom from '../components/Expanded/CreateDilemmaRoom';
// import createIcon from '../assets/roomcreate.svg';
// import joinIcon from '../assets/joinviacode.svg';
// import dilemmaIcon from "../assets/dilemmaIcon.svg";
// import { FontStyles,Colors } from '../components/styleConstants';

// import GameFrame from "../components/GameFrame";
// export default function SelectRoom() { 
//   const navigate = useNavigate();
//   const [title, setTitle] = useState(localStorage.getItem('creatorTitle') || '');

//   const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false); 
//   const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
//   const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

// useEffect(() => {
//     const originalOverflow = document.body.style.overflow;
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = originalOverflow;
//     };
//   }, []);
//   const location = useLocation();

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const code = params.get('code');
//     if (code) {
//       localStorage.setItem('code', code);
//       // 깔끔하게 ?code 제거
//       navigate('/customroom', { replace: true });
//     }
//   }, [location.search, navigate]);
//   const handleBackClick = () => {
//     setIsLogoutPopupOpen(true); 
//   };

//   const handleLogout = () => {
//     navigate('/'); 
//   };
//   return (
//     <Background bgIndex={2}>
//       <div
//         style={{
//           minHeight: '100vh',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           paddingTop: 0,
//         }}
//       >
//         {/* 가운데 정렬된 세로 스택 */}
//         <div
//           style={{
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             gap: 24,             // GameFrame과 카드 사이 간격
//           }}
//         >
//           <GameFrame topic={title} hideArrows />
//             <div
//             style={{
//               display: 'flex',
//               flexDirection: 'row',
//               gap: 20,
//               flexWrap: 'nowrap',
//               justifyContent: 'center',
//               alignItems: 'stretch',
//               width: '100%',
//             }}
//           >
//             <RoomCard
//               icon={createIcon}
//               title="방 만들기"
//               description={
//                 <>
//                   새로운 방을 만들고<br />
//                   시뮬레이션을 시작하세요.
//                 </>
//               }
//               onClick={() => setIsCreateRoomOpen(true)}
//             />
//             <RoomCard
//               icon={joinIcon}
//               title="방 참여하기"
//               description={
//                 <>
//                   코드를 통해 비공개 방에<br />
//                   참여할 수 있습니다.
//                 </>
//               }
//               onClick={() => setIsJoinRoomOpen(true)}
//             />
//           </div>
//         </div>
//       </div>
  
//       {/* 팝업들 */}
//       {isLogoutPopupOpen && (
//         <div style={overlayStyle}>
//           <LogoutPopup
//             onClose={() => setIsLogoutPopupOpen(false)}
//             onLogout={handleLogout}
//           />
//         </div>
//       )}
  
//       {isJoinRoomOpen && (
//         <div style={overlayStyle}>
//           <JoinRoom onClose={() => setIsJoinRoomOpen(false)} />
//         </div>
//       )}
  
//       {isCreateRoomOpen && (
//         <div style={{ ...overlayStyle, backgroundColor: 'rgba(103,103,103,0.4)' }}>
//           <CreateRoom disabled={true} onClose={() => setIsCreateRoomOpen(false)} />
//         </div>
//       )}
//     </Background>
//   );
// }
// const overlayStyle = {
//     position: 'fixed',
//     top: 0,
//     left: 0,
//     width: '100vw',
//     height: '100vh',
//     backgroundColor: 'rgba(0, 0, 0, 0.4)',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 100,
//   };
  
// SelectRoom.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Background from '../components/Background';
import BackButton from '../components/BackButton';
import RoomCard from '../components/RoomCard';
import LogoutPopup from '../components/LogoutPopup';
import JoinRoom from '../components/JoinRoom';
import CreateRoom from '../components/Expanded/CreateDilemmaRoom';
import createIcon from '../assets/roomcreate.svg';
import joinIcon from '../assets/joinviacode.svg';
import dilemmaIcon from "../assets/dilemmaIcon.svg";
import { FontStyles, Colors } from '../components/styleConstants';
import GameFrame from "../components/GameFrame";
import axiosInstance from '../api/axiosInstance';

export default function SelectRoom() {
  const navigate = useNavigate();
  const location = useLocation();

  const [title, setTitle] = useState(localStorage.getItem('creatorTitle') || '');
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);
  const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

  // ---------- utils: 로컬 저장 헬퍼 ----------
  const setStr = (key, val) =>
    localStorage.setItem(key, typeof val === 'string' ? val : (val ?? ''));

  const setArr = (key, arr) =>
    localStorage.setItem(key, JSON.stringify(Array.isArray(arr) ? arr : []));

  // 서버 데이터 -> localStorage 저장
  const persistCustomGame = (payload) => {
    if (!payload) return;

    const { code, title, representative_image_url, representative_images, data } = payload;

    // 공통
    if (code) setStr('code', code);

    // 제목
    setStr('creatorTitle', title || data?.title || '');

    // 이미지(대표)
    // 요구사항: create01에서 로컬에 `repersentative_image_url`로 저장 (요청 그대로 철자 사용)
    setStr('repersentative_image_url', representative_image_url || '');

    // 이미지(대표 묶음)
    // 요구사항: dilemma_image_1, dilemma_image_3, dilemma_image_4_1, dilemma_image_4_2 로 저장
    const repImgs = data?.representativeImages || representative_images || {};
    setStr('dilemma_image_1', repImgs?.dilemma_image_1 || '');
    setStr('dilemma_image_3', repImgs?.dilemma_image_3 || '');
    setStr('dilemma_image_4_1', repImgs?.dilemma_image_4_1 || '');
    setStr('dilemma_image_4_2', repImgs?.dilemma_image_4_2 || '');

    // 데이터 본문
    // opening: 배열
    setArr('opening', data?.opening);

    // roles -> char1/2/3, charDes1/2/3
    const roles = Array.isArray(data?.roles) ? data.roles : [];
    const r1 = roles[0] || {};
    const r2 = roles[1] || {};
    const r3 = roles[2] || {};
    setStr('char1', r1.name || '');
    setStr('char2', r2.name || '');
    setStr('char3', r3.name || '');
    setStr('charDes1', r1.description || '');
    setStr('charDes2', r2.description || '');
    setStr('charDes3', r3.description || '');

    // rolesBackground: 문자열
    setStr('rolesBackground', data?.rolesBackground || '');

    // roleImages -> role_image_1, role_image_2, role_image_3
    const roleImages = data?.roleImages || {};
    setStr('role_image_1', roleImages?.['1'] || '');
    setStr('role_image_2', roleImages?.['2'] || '');
    setStr('role_image_3', roleImages?.['3'] || '');

    // dilemma
    const dilemma = data?.dilemma || {};
    setArr('dilemma_sitation', dilemma?.situation); // 요구 철자 그대로
    setStr('question', dilemma?.question || '');

    const opts = dilemma?.options || {};
    setStr('agree_label', opts?.agree_label || '');
    setStr('disagree_label', opts?.disagree_label || '');

    // flips: 배열
    const flips = data?.flips || {};
    setArr('flips_agree_texts', flips?.agree_texts);
    setArr('flips_disagree_texts', flips?.disagree_texts);

    // finalMessages
    const finals = data?.finalMessages || {};
    setStr('agreeEnding', finals?.agree || '');
    setStr('disagreeEnding', finals?.disagree || '');

    // 화면 상단 프레임에 즉시 반영
    setTitle(localStorage.getItem('creatorTitle') || '');
  };

  // 스크롤 숨김
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // 쿼리로 code 들어오면: 저장 -> GET -> 로컬 저장 -> /customroom
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    const run = async () => {
      if (!code) return;

      try {
        // 코드 저장(먼저)
        localStorage.setItem('code', code);

        // GET /custom-games/{code}
        const res = await axiosInstance.get(`/custom-games/${code}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        // 응답 저장
        persistCustomGame(res?.data);

        // 쿼리 제거 + 커스텀룸 이동
        navigate('/customroom', { replace: true });
      } catch (err) {
        console.error('Failed to load custom game by code:', err);
        // 실패해도 기본 동작은 유지 (원하면 에러 팝업 추가)
      }
    };

    run();
  }, [location.search, navigate]);

  const handleBackClick = () => setIsLogoutPopupOpen(true);
  const handleLogout = () => navigate('/');

  return (
    <Background bgIndex={2}>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 0,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <GameFrame topic={title} hideArrows />
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 20,
              flexWrap: 'nowrap',
              justifyContent: 'center',
              alignItems: 'stretch',
              width: '100%',
            }}
          >
            <RoomCard
              icon={createIcon}
              title="방 만들기"
              description={<>새로운 방을 만들고<br />시뮬레이션을 시작하세요.</>}
              onClick={() => setIsCreateRoomOpen(true)}
            />
            <RoomCard
              icon={joinIcon}
              title="방 참여하기"
              description={<>코드를 통해 비공개 방에<br />참여할 수 있습니다.</>}
              onClick={() => setIsJoinRoomOpen(true)}
            />
          </div>
        </div>
      </div>

      {isLogoutPopupOpen && (
        <div style={overlayStyle}>
          <LogoutPopup onClose={() => setIsLogoutPopupOpen(false)} onLogout={handleLogout} />
        </div>
      )}

      {isJoinRoomOpen && (
        <div style={overlayStyle}>
          <JoinRoom onClose={() => setIsJoinRoomOpen(false)} />
        </div>
      )}

      {isCreateRoomOpen && (
        <div style={{ ...overlayStyle, backgroundColor: 'rgba(103,103,103,0.4)' }}>
          <CreateRoom disabled={true} onClose={() => setIsCreateRoomOpen(false)} />
        </div>
      )}
    </Background>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 100,
};
