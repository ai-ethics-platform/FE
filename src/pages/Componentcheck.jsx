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

      </div>
      <CreateRoom/>
      </Background>
    );
  }