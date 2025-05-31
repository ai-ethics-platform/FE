import React, { useState } from 'react';
import contentbox from '../assets/contentbox.svg';
import pagnationLeft from '../assets/paginationleft.svg';
import pagnationRight from '../assets/paginationright.svg';
import pagnationBoth from '../assets/paginationboth.svg';
import continueBtn from '../assets/readydefault.svg';
import { Colors, FontStyles } from './styleConstants';

export default function StoryInputBox({ paginationType = 'both' }) {
  const [text, setText] = useState('');
  const maxLines = 3;

  const handleChange = (e) => {
    const lines = e.target.value.split('\n');
    if (lines.length <= maxLines) {
      setText(e.target.value);
    }
  };

  const paginationIcons = {
    left: pagnationLeft,
    right: pagnationRight,
    both: pagnationBoth,
  };

  return (
    <div style={{ position: 'relative', width: 740, height: 180 }}>
      {/* 프레임 이미지 */}
      <img
        src={contentbox}
        alt="frame"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* 콘텐츠 영역 */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          right: 24,
          bottom: 24,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 1,
          ...FontStyles.caption,
        }}
      >
        {/* 설명 텍스트 */}
        <div style={{ ...FontStyles.caption, fontWeight: 600, color: Colors.grey07 }}>
          메인 스토리 내용을 입력해 주세요. 최대 3줄까지 입력이 가능합니다. 3줄 입력 시에 서브 텍스트 삽입은 불가능해요
        </div>

        {/* 입력 필드 */}
        <textarea
          placeholder="(서브 텍스트를 입력해 주세요.)"
          value={text}
          onChange={handleChange}
          rows={3}
          style={{
            width: '100%',
            border: 'none',
            backgroundColor: 'transparent',
            resize: 'none',
            color: Colors.grey05,
            ...FontStyles.caption,
            outline: 'none',
          }}
        />

        {/* 하단 버튼 및 페이지네이션 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img
            src={paginationIcons[paginationType]}
            alt="pagination"
            style={{ height: 24 }}
          />
          <img
            src={continueBtn}
            alt="Continue"
            style={{ height: 48, cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
}
