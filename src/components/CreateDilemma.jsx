import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import closeIcon from '../assets/close.svg';
import PrimaryButton from './PrimaryButton';
import { Colors, FontStyles } from './styleConstants';
import axiosInstance from '../api/axiosInstance';
import InputBoxSmall from './InputBoxSmall'; 

export default function CreateDilemma({ onClose }) {
 const navigate = useNavigate();
 const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [email, setEmail] = useState('');
  const handleCreateDilemma = async () => {
    navigate('/create01');
  };

 
  return (
    <div
      style={{
        width: 552,
        height: 548,
        justifyContent: 'center',
        backgroundColor: Colors.componentBackgroundFloat,
        borderRadius: 12,
        padding: 32,
        position: 'relative',
        ...FontStyles.body,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <img
        src={closeIcon}
        alt="close"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          width: 40,
          height: 40,
          cursor: 'pointer',
        }}
      />

      <div style={{ ...FontStyles.headlineNormal, color: Colors.brandPrimary, marginBottom: 8 }}>
         딜레마 게임 만들기 
      </div>
      <div style={{ ...FontStyles.body,color: Colors.systemRed, marginBottom: 15 }}>
        *현재 딜레마 게임 만들기는 교수자 대상으로 제공하고 있습니다. 
      </div>
      <div style={{ textAlign:'center',...FontStyles.body,color: Colors.grey06, marginBottom: 32 }}>
        원하시는 주제로 딜레마 게임을 직접 만들어 교육에서 활용할 수 있습니다.<br/>
        부적절한 콘텐츠를 제작하는 것을 방지하기 위해 정보를 제공받고 있습니다. <br/>
        아래에 선생님의 정보를 입력해주세요. 
        </div>
        <div style={{ width: '100%', marginBottom: 24 }}>
        <InputBoxSmall
          label="이름"
          width='300px'
          value={name}
          placeholder='이름을 입력하세요'
          onChange={(e) => setName(e.target.value)}
        />
        <InputBoxSmall
          label="근무지"
          width='300px'
          value={school}
          placeholder='학교를 입력하세요'
          onChange={(e) => setSchool(e.target.value)}
        />
        <InputBoxSmall
          label={
            <>
            교수자용<br/>
            이메일</>
          }
          width='300px'
          value={email}
          placeholder='학교 메일을 입력하세요'
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <PrimaryButton
        onClick={handleCreateDilemma}
        style={{
          width: 168,
          height: 72,
        }}
      >
        {'시작하기'}
      </PrimaryButton>
    </div>
  );
}
