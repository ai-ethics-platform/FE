import React, { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ResultStatCard from '../components/ResultStatCard';

export default function Game09() {
  const navigate = useNavigate();
  const [openProfile, setOpenProfile] = useState(null);
  
  const subtopic = "결과: 다른 사람들이 선택한 미래";
  const handleBackClick = () => {
    navigate('/game08'); 
  };
  return (
    <Layout subtopic={subtopic} onProfileClick={setOpenProfile}  onBackClick={handleBackClick}    allowScroll >
        <div style={{ display: 'grid', gap: 24, width: '100%' }}>
        <ResultStatCard subtopic="AI의 개인 정보 수집" agreePct={36} disagreePct={64} />
        <ResultStatCard subtopic="안드로이드의 감정 표현" agreePct={28} disagreePct={72} />
        <ResultStatCard subtopic="아이들을 위한 서비스" agreePct={45} disagreePct={55} />
        <ResultStatCard subtopic="설명 가능한 AI" agreePct={52} disagreePct={48} />
        <ResultStatCard subtopic="지구, 인간, AI" agreePct={33} disagreePct={67} />
      </div>
    </Layout>
  );
}