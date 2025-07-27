import React from 'react';
import { Link } from 'react-router-dom';
import Background from '../components/Background';
import login from "../assets/login.svg";
import password from "../assets/password.svg";
import passwordcheck from "../assets/passwordcheck.svg";
import eyeon from "../assets/eyeon.svg";
import eyeoff from "../assets/eyeoff.svg";
import homeIcon from '../assets/homeIcon.svg';
import lock from "../assets/lock.svg";
import back from "../assets/back.svg";
import close from "../assets/close.svg";
import arrowLdefault from "../assets/arrowLdefault.svg";
import arrowRdefault from "../assets/arrowRdefault.svg";
import arrowLhover from "../assets/arrowLhover.svg";
import arrowRhover from "../assets/arrowRhover.svg";
import arrowUp from "../assets/arrowUp.svg";
import arrowDown from "../assets/arrowDown.svg";
import mikeon from "../assets/1playermikeon.svg";
import roomcreate from "../assets/roomcreate.svg"
import joinviacode from "../assets/joinviacode.svg";
import joinrandom from "../assets/joinrandom.svg";
import cardframe from "../assets/cardframe.svg";
import next2 from "../assets/next2.svg";
import Next2 from "../components/Next2";
import CreateRoom from '../components/CreateRoom';
import CreateRoom2 from '../components/CreateRoom2';
import PrimaryButton from '../components/PrimaryButton';  
import SecondaryButton from '../components/SecondaryButton';
import TextButton from '../components/TextButton';
import InputBoxLarge from '../components/InputBoxLarge';
import InputBoxSmall from '../components/InputBoxSmall';
import SelectCard from "../components/SelectCard";
import SelectDrop from "../components/SelectDrop";
import SelectButton from "../components/SelectButton";
import RoomCard from '../components/RoomCard';
import StatusCard from '../components/StatusCard';
import UserProfile from '../components/Userprofile';
import ContentTextBox from "../components/ContentTextBox";
import LogoutPopup from '../components/LogoutPopup';
import BackButton from '../components/BackButton';
import CloseButton from '../components/CloseButton';
import nocheckbutton from '../assets/nocheckbutton.svg';
import checkbutton from '../assets/checkbutton.svg';
import JoinRoom from '../components/JoinRoom';
import ContentBox2 from '../components/ContentBox2';
import GameFrame from '../components/GameFrame';
import RoomCode from '../components/RoomCode';
import GameMapFrame from '../components/GameMapFrame';
import GameMapOptionBox from '../components/GameMapOptionBox';
import CharacterPopup from '../components/CharacterPopUp';
import { Colors } from '../components/styleConstants';


const fullText = `지금은 20XX년,\n국내 최대 로봇 개발사 A가 다기능 돌봄 로봇 HomeMate를 개발했습니다.\n\n` +
  `이 로봇의 기능은 아래와 같습니다.\n` +
  `• 가족의 감정, 건강 상태, 생활 습관 등을 입력하면 맞춤형 알림, 식단 제안 등의 서비스를 제공\n` +
  `• 기타 업데이트 시 정교화된 서비스 추가 가능`; 
export default function Componentcheck() {
    return (
      <Background bgIndex={2}>
         <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',     // 여러 줄로 감싸기
          gap: 24,              // 이미지 사이 간격
          padding: 32,          // 바깥 여백
          justifyContent: 'flex-start', // 왼쪽 정렬 (or 'center')
        }}
      >
        {/* Home 아이콘 */}
      <img src={login}/>
      <img src={password}/>
      <img src={passwordcheck}/>
      <img src={eyeon}/>
      <img src={eyeoff}/>

      {/*Lock 아이콘  */}
      <img src={lock}/>
      <img src={back}/>
      <img src={close}/>
      <img src={arrowLdefault}/>
      <img src={arrowRdefault}/>
      <img src={arrowLhover}/>
      <img src={arrowRhover}/>
      {/*System 아이콘 */}
      <img src={arrowUp}/>
      <img src={arrowDown}/>
      
      {/* Room graphic */}
      <img src = {roomcreate}/>
      <img src = {joinviacode}/>
      <img src = {joinrandom}/>
      <img src = {cardframe}/>
      <img src={nocheckbutton}/>
      <img src={checkbutton}/> 
<img src ={mikeon}/>
<img src ={next2}/>

      </div>
     {/* <div style={{ marginTop: 32, position: 'relative', zIndex: 10 }}>
        <CreateRoom />
      </div> */}
      <Next2 onClick={() => console.log('다음 클릭')} disabled={false} />

<UserProfile
  player="1P"
  isLeader={true}    // 방장이면 crown
  isMe={true}        // 내 프로필이라면 왼쪽 스피킹 바
  isSpeaking={false}  // 말하고 있는 사람은 mikeon 아이콘
/>
<UserProfile player="2P"   isSpeaking={true} characterDesc="디테일 있음" />
      {/* 버튼 클릭 불가 문제 해결을 위해 zIndex 부여 */}
      <div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
        <PrimaryButton disabled={false}>버튼 텍스트</PrimaryButton>
      </div>
      <div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
        <SecondaryButton disabled={false}>버튼 텍스트</SecondaryButton>
      </div>
      <div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
        <TextButton disabled={false}>버튼 텍스트</TextButton>
      </div>
      <div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
        <InputBoxLarge>버튼 텍스트</InputBoxLarge>
      </div>

      {/* API 연결 후 에러가 존재하는 로직 다시 만들어야함 컴포넌트는 그대로 해도됨  */}
      <div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
        <InputBoxLarge errorMessage="이메일 형식이 올바르지 않습니다." >버튼 텍스트</InputBoxLarge>
      </div>
      <div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
        <InputBoxSmall >버튼 텍스트</InputBoxSmall>
      </div>
      <div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
        <SelectCard/>
      </div>
      <div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
      <SelectDrop options={['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5']} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 32 }}>
      <SelectButton label="버튼 텍스트 1" />
    </div>
    <div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
    <RoomCard disabled={false} />
    </div>
    <div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
    <StatusCard player="1P" isOwner={true}  />
    </div>
    <div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
    <StatusCard player="2P" isOwner={false}  />
    </div>
    <div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
    <UserProfile player="3P" characterDesc="요양보호사 K" />
    </div>
     <div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
    <UserProfile player="3P" />
    </div>

    <div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
    <ContentTextBox paginationType="both" />
    </div>
    <div>
      <LogoutPopup />
    </div>  
    <div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
    <BackButton />
    </div>
    <div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
    <CloseButton />
    </div>
   <div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
    <JoinRoom />
    </div>
    <ContentBox2 text={fullText} typingSpeed={50} />
    <GameMapOptionBox
        option1={{
          text: '가정 1',
          disabled: false,
          onClick: () => console.log('가정 1 클릭'),
        }}
        option2={{
          text: '가정 2',
          disabled: false,
          onClick: () => console.log('가정 2 클릭'),
        }}/>
          
<ContentTextBox
  paragraphs={[
    { main: ' AI가 인간처럼 말할 수 있을까요?', sub: '(AI가 말하는 능력에 대한 의문)' },
    { main: '말할 수 있다는 것은 단순한 언어 모방을 넘어서요.', sub: '(의미 이해와 감정을 담는 능력)' },
    { main: ' 우리가 이를 윤리적으로 어떻게 받아들여야 할까요?', sub: '(AI와 윤리의 접점)' },
  ]}
  onContinue={() => console.log('모든 단락 끝!')}
/>

<div style={{ position: 'absolute', top: 120, left: 584 }}>
  <GameFrame
    topic='안드로이드'
  />
</div>

<div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
<GameMapFrame
  icon={homeIcon}
  title="가정"
  options={['가정 1', '가정 2']}
  onSelectOption={(option) => {
    console.log(`${option} 선택됨`);
    // 필요한 동작 추가
  }}
/>    </div>
 

<div style={{ position: 'relative', zIndex: 100, marginTop: 40 }}>
<CreateRoom2/>
<RoomCode roomCode="154152" />
   <div style={{ marginTop: 20 }}>
        <SecondaryButton
          style={{
            width: 168,
            height: 72,
            justifyContent: 'center',
            marginBottom: 12,
          }}
          onClick={() => navigate('/game08')}
        >
          결과 보기
        </SecondaryButton>
      </div>
  </div>

  <CharacterPopup 
  subtopic="AI의 개인 정보 수집"
  roleId={3}
  mateName="단밤이" 
/>
    </Background>
    );
  }