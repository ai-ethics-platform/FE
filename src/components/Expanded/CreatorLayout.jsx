import React, { useEffect, useState } from 'react';
import { Colors } from '../styleConstants';
import HeaderBar from './HeaderBar'; // 아이콘 내장 버전 가정

const HEADER_H = 56;

export default function CreatorLayout({
  // 헤더 제어
  headerLeftType = 'home',           // 'home' | 'back'
  headerNextDisabled = false,
  onHeaderLeftClick = () => {},
  onHeaderNextClick = () => {},
  children,
  style = {},
}) {

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: Colors.grey01, // 페이지 배경
        overflow: 'hidden',
        ...style,
      }}
    >
     <HeaderBar
            leftType={headerLeftType}
            nextDisabled={headerNextDisabled}
            onLeftClick={onHeaderLeftClick}
            onNextClick={onHeaderNextClick}
            height={HEADER_H}
      />
      <div
        style={{
          height: `calc(100% - ${HEADER_H}px)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',  // 가운데 배치 (원하면 빼도 됨)
        }}
      >
        {children}
      </div>


       </div>
       
  );
}
