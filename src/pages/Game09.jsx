
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ResultStatCard from '../components/ResultStatCard';
import axiosInstance from '../api/axiosInstance';

export default function Game09() {
  const navigate = useNavigate();
  const [openProfile, setOpenProfile] = useState(null);
  const [stats, setStats] = useState({});  
  const [category, setCategory] = useState(localStorage.getItem('category') || '안드로이드'); 

  const subtopicTitle = "결과: 다른 사람들이 선택한 미래";

  const subtopics = category === '자율 무기 시스템'
  ? [
      'AI 알고리즘 공개',
      'AWS의 권한',
      '사람이 죽지 않는 전쟁',
      'AI의 권리와 책임',
      'AWS 규제',
    ]
  : [
      'AI의 개인 정보 수집',
      '안드로이드의 감정 표현',
      '아이들을 위한 서비스',
      '설명 가능한 AI',
      '지구, 인간, AI',
    ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const results = {};
        for (const topic of subtopics) {
          const { data } = await axiosInstance.get(
            `/rooms/rooms/statistics/subtopic/${encodeURIComponent(topic)}`,
            {
              params: { exclude_dummy: true }
            }
          );

          // API 응답값 매핑
          const agreePct = data.choice_1_percentage ?? 0;
          const disagreePct = data.choice_2_percentage ?? 0;
          
          // agreePct와 disagreePct 중 더 큰 값을 기준으로 isSelected 결정
        //  const isSelected = agreePct >= disagreePct ? 'agree' : 'disagree';
          // localStorage에서 내가 선택한 값 불러오기
          let myChoice = "disagree";
          try {
            const stored = JSON.parse(localStorage.getItem("subtopicResults") ?? "{}");
            myChoice = stored?.[topic] ?? "disagree";
          } catch {}
          results[topic] = {
            agreePct,
            disagreePct,
            isSelected:myChoice, // isSelected 추가
          };
        }
        setStats(results);
      } catch (err) {
        console.error("통계 불러오기 실패:", err);
      }
    };

    fetchStats();
  }, []);

  const handleBackClick = () => {
    const idx = window.history.state?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/game08');
  };

  return (
    <Layout
      subtopic={subtopicTitle}
      onProfileClick={setOpenProfile}
      onBackClick={handleBackClick}
      allowScroll
    >
      <div style={{ display: 'grid', gap: 24, width: '100%' }}>
        {subtopics.map((topic) => (
          <ResultStatCard
            key={topic}
            subtopic={topic}
            agreePct={stats[topic]?.agreePct ?? 0}
            disagreePct={stats[topic]?.disagreePct ?? 0}
            isSelected={stats[topic]?.isSelected} // isSelected를 넘겨줌
          />
        ))}
      </div>
    </Layout>
  );
} 
