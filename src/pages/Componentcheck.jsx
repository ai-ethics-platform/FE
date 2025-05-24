import React from 'react';
import { Link } from 'react-router-dom';
import Background from '../components/Background';
import login from "../assets/login.svg";
import password from "../assets/password.svg";
import passwordcheck from "../assets/passwordcheck.svg";
import eyeon from "../assets/eyeon.svg";
import eyeoff from "../assets/eyeoff.svg";

import lock from "../assets/lock.svg";
import back from "../assets/back.svg";
import close from "../assets/close.svg";
import arrowLdefault from "../assets/arrowLdefault.svg";
import arrowRdefault from "../assets/arrowRdefault.svg";
import arrowLhover from "../assets/arrowLhover.svg";
import arrowRhover from "../assets/arrowRhover.svg";
import arrowUp from "../assets/arrowUp.svg";
import arrowDown from "../assets/arrowDown.svg";

import roomcreate from "../assets/roomcreate.svg"
import joinviacode from "../assets/joinviacode.svg";
import joinrandom from "../assets/joinrandom.svg";
import cardframe from "../assets/cardframe.svg";

import CreateRoom from '../components/CreateRoom';
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
      </div>
     {/* CreateRoom 컴포넌트와 버튼 사이에 여백 추가 */}
     <div style={{ marginTop: 32, position: 'relative', zIndex: 10 }}>
        <CreateRoom />
      </div>

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

    </Background>
    );
  }