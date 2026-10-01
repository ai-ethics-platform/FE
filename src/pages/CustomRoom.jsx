import { customGameStorage, clearCustomGame, setCustomGameCode, saveCustomGame, isCustomGameReady } from '../utils/customGameStorage';

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

  const [title, setTitle] = useState(customGameStorage.getItem('creatorTitle') || '');
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);
  const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

  const [loadStatus, setLoadStatus] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);
  const code = new URLSearchParams(location.search).get('code') || customGameStorage.getItem('code');
  const ready = loadStatus === 'ready' && isCustomGameReady() && customGameStorage.getItem('code') === code;

  // 스크롤 숨김
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoadStatus('loading');
    setLoadError('');

    const run = async () => {
      try {
        if (!code) throw new Error('게임 코드가 없습니다. 공유 링크로 다시 접속해주세요.');
        clearCustomGame();
        setCustomGameCode(code);
        const res = await axiosInstance.get(`/custom-games/${encodeURIComponent(code)}`, {
          signal: controller.signal,
          timeout: 20000,
        });
        if (!active) return;
        saveCustomGame(res.data, code);
        setTitle(customGameStorage.getItem('creatorTitle') || '');
        setLoadStatus('ready');
      } catch (err) {
        if (!active) return;
        console.error('Failed to load custom game by code:', err);
        setLoadError(code ? '게임 데이터를 불러오지 못했습니다. 다시 시도하거나 새로고침해주세요.' : '게임 코드가 없습니다. 공유 링크로 다시 접속해주세요.');
        setLoadStatus('error');
      }
    };

    run();
    return () => {
      active = false;
      controller.abort();
    };
  }, [code, retry]);

  const handleBackClick = () => setIsLogoutPopupOpen(true);
  const handleLogout = () => {
    clearCustomGame();
    navigate('/');
  };

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
          {loadStatus === 'loading' && (
            <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="42 15">
                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                </circle>
              </svg>
              게임 데이터 받아오는 중
            </div>
          )}
          {loadStatus === 'error' && (
            <div role="alert" style={{ textAlign: 'center' }}>
              <p>{loadError}</p>
              <button type="button" onClick={() => setRetry(value => value + 1)}>다시 시도</button>
            </div>
          )}
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
              disabled={!ready}
              title={loadStatus === 'ready' ? '방 만들기' : loadStatus === 'loading' ? '게임 데이터 받아오는 중' : '게임 데이터를 불러오지 못했습니다'}
              description={loadStatus === 'ready' ? <>새로운 방을 만들고<br />게임을 시작하세요.</> : loadStatus === 'loading' ? '잠시 기다려주세요.' : '다시 시도해주세요.'}
              onClick={() => setIsCreateRoomOpen(true)}
            />
            <RoomCard
              icon={joinIcon}
              disabled={!ready}
              title={loadStatus === 'ready' ? '방 참여하기' : loadStatus === 'loading' ? '게임 데이터 받아오는 중' : '게임 데이터를 불러오지 못했습니다'}
              description={loadStatus === 'ready' ? <>코드를 통해 방에<br />참여할 수 있습니다.</> : loadStatus === 'loading' ? '잠시 기다려주세요.' : '다시 시도해주세요.'}
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
          <JoinRoom custom onClose={() => setIsJoinRoomOpen(false)} />
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
