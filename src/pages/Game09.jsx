import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ResultStatCard from '../components/ResultStatCard';
import axiosInstance from '../api/axiosInstance';

// [이미지 임포트] 기존 개발자가 설정한 기본 캐릭터 이미지 경로
import defaultAndroidLeftImageSrc from "../assets/images/Android_dilemma_1_1.jpg";
import defaultAwsLeftImageSrc from "../assets/images/Killer_Character3.jpg";

// 언어팩 가져오기
import { translations } from '../utils/language';

export default function Game09() {
  const navigate = useNavigate();
  const [openProfile, setOpenProfile] = useState(null);
  const [stats, setStats] = useState({});  
  
  const lang = localStorage.getItem('app_lang') || 'ko';
  const rawCategory = (localStorage.getItem('category') || '안드로이드').trim();

  // [기존 디버깅 로그 유지] 
  window.DEBUG_TRANS = translations;
  window.DEBUG_LANG = lang;
  
  console.log("결과 페이지 동기화 데이터 분석 시작");

  const isAWS = useMemo(() => {
    const lowCat = rawCategory.toLowerCase();
    return lowCat.includes('autonomous') || lowCat.includes('aws') || lowCat.includes('자율');
  }, [rawCategory]);

  const t = translations[lang]?.Game09 || translations[lang]?.game09 || translations['ko']?.Game09;

  if (!t) {
    console.error(`🚨 Game09 언어팩 로드 실패! lang: ${lang}`);
    return <div style={{marginTop: 100, textAlign: 'center', color: 'white'}}>Language Pack Error (Game09)</div>;
  }

  const subtopicTitle = t.title;

  const subtopics = isAWS
    ? ['AI 알고리즘 공개', 'AWS의 권한', '사람이 죽지 않는 전쟁', 'AI의 권리와 책임', 'AWS 규제']
    : ['AI의 개인 정보 수집', '안드로이드의 감정 표현', '아이들을 위한 서비스', '설명 가능한 AI', '지구, 인간, AI'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const results = {};
        // 단체가 합의하여 저장한 최종 결과값 로드 
        const storedChoices = JSON.parse(localStorage.getItem("subtopicResults") ?? "{}");

        for (const topic of subtopics) {
          const { data } = await axiosInstance.get(
            `/rooms/rooms/statistics/subtopic/${encodeURIComponent(topic)}`,
            { params: { exclude_dummy: true } }
          );

          //개인 플레이 여부와 상관없이 단체 합의 결과만 표시함
          const groupChoice = storedChoices[topic] || null;

          results[topic] = {
            agreePct: data.choice_1_percentage ?? 0,
            disagreePct: data.choice_2_percentage ?? 0,
            isSelected: groupChoice, 
          };
        }
        setStats(results);
      } catch (err) {
        console.error("통계 불러오기 실패:", err);
      }
    };

    fetchStats();
  }, [isAWS]);

  const getDisplayName = (topic) => {
    if (lang === 'ko') return topic;
    const mapping = translations[lang]?.GameMap || {};
    return mapping[topic] || topic;
  };

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
      {/* 사용자님이 유지하길 원하시는 기존 grid 레이아웃 스타일 */}
      <div style={{ display: 'grid', gap: 24, width: '100%' }}>
        {subtopics.map((topic) => (
          <ResultStatCard
            key={topic}
            subtopic={getDisplayName(topic)}
            agreePct={stats[topic]?.agreePct ?? 0}
            disagreePct={stats[topic]?.disagreePct ?? 0}
            isSelected={stats[topic]?.isSelected} 
            leftImageSrc={isAWS ? defaultAwsLeftImageSrc : defaultAndroidLeftImageSrc}
          />
        ))}
      </div>
    </Layout>
  );
}