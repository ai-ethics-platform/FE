import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';      
import ContentTextBox from '../components/ContentTextBox';
import Continue from '../components/Continue';
import GameFrame from '../components/GameFrame';

import closeIcon from '../assets/close.svg';

import img1 from '../assets/images/Android_dilemma_2_1.jpg';
import img2 from '../assets/images/Android_dilemma_2_2.jpg';
import img3 from '../assets/images/Android_dilemma_2_3.jpg';
import img4 from '../assets/images/Android_dilemma_2_4.jpg';
const comicImages = [img1, img2, img3, img4];

import profile1Img from '../assets/images/CharacterPopUp1.png';
import profile2Img from '../assets/images/CharacterPopUp2.png';
import profile3Img from '../assets/images/CharacterPopUp3.png';
const profileImages = { '1P': profile1Img, '2P': profile2Img, '3P': profile3Img };

// 🆕 WebRTC integration
import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import UserProfile from '../components/Userprofile';

const paragraphs = [
  { main:
    '    여러분의 결정으로 가정용 로봇은 보다 정확한 서비스를 제공하였고, 여러분의 친구처럼 제 역할을 다하고 있습니다. '
  },
  { main:
    '     국가 내에서는 아이들을 위해 다양한 서비스를 제공하며, 가정용 로봇의 알고리즘은 투명하게 공개되었습니다. '
  },
  { main:
    '    그리고 세계는 지금, 기술적 발전을 조금 늦추었지만 환경과 미래를 위해 나아가고 있죠. '
  },
  { main:
    '    여러분이 선택한 가치가 모여 하나의 미래를 만들었습니다. 그 미래에 여러분은 함께할 준비가 되었나요? '
  }
];

export default function Game08() {
  const navigate = useNavigate();
  const subtopic = '결과: 우리들의 선택';

  // 🆕 WebRTC audio state
  const { voiceSessionStatus, roleUserMapping, myRoleId } = useWebRTC();
  const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);
  const getVoiceState = (role) => {
    if (String(role) === myRoleId) {
      return {
        is_speaking: voiceSessionStatus.isSpeaking,
        is_mic_on:    voiceSessionStatus.isConnected,
        nickname:     voiceSessionStatus.nickname || ''
      };
    }
    return getVoiceStateForRole(role);
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [openProfile, setOpenProfile] = useState(null);

  const handleContinue = () => {
    navigate('/game09', {
      state: { agreement: null, confidence: 0 }, 
    });
  };

  return (
    <>
      {openProfile && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000,
          }}
          onClick={() => setOpenProfile(null)}
        >
          <div
            style={{ position: 'relative', background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.25)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={profileImages[openProfile]}
              alt={`Profile ${openProfile}`}
              style={{ width: 360, height: 'auto', display: 'block' }}
            />
            <img
              src={closeIcon}
              alt="close"
              style={{ position: 'absolute', top: 24, right: 24, width: 40, height: 40, cursor: 'pointer' }}
              onClick={() => setOpenProfile(null)}
            />
          </div>
        </div>
      )}

      <Layout
        subtopic={subtopic}
        onProfileClick={(playerId) => setOpenProfile(playerId)}
      >
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <img
            src={comicImages[currentIndex]}
            alt={`comic ${currentIndex + 1}`}
            style={{ width: 760, height: 'auto', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />

          <div style={{ width: '100%', maxWidth: 900 }}>
            <ContentTextBox
              paragraphs={paragraphs}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              onContinue={handleContinue}
              continueLabel="다른 미래 보러가기"
            />
          </div>
        </div>
      </Layout>
    </>
  );
}