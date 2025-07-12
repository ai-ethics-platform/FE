import React, { useState } from 'react';
import frame from '../assets/gamemapcard.svg';
import frameHover from '../assets/gamemapcardactive.svg';
import frameActive from '../assets/gamemapcardactive.svg';
import lockIcon from '../assets/lock.svg';
import { Colors, FontStyles } from './styleConstants';
import { CardSizes } from './stylecardsize';
import GameMapOptionBox from './GameMapOptionBox'; 
export default function GameMapFrame({
  icon,
  title,
  description,
  disabled = false,
  onClick,
  options = [],
  onSelectOption = () => {},
  option1,
  option2,}) 
  {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  const opt1 = option1 || (options[0]
    ? { text: options[0], disabled: false, onClick: () => onSelectOption(options[0]) }
    : null);
  const opt2 = option2 || (options[1]
    ? { text: options[1], disabled: true, onClick: () => onSelectOption(options[1]) }
    : null);

  const getFrameImage = () => {
    if (isActive) return frameActive;
    if (isHovered) return frameHover;
    return frame;
  };

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={{
        position: 'relative',
        width: CardSizes.width,
        height: CardSizes.height, 
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        cursor: disabled ? 'default' : 'pointer',
      }}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => !disabled && setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
    >
      <img
        src={getFrameImage()}
        alt="프레임"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '95%',
          height: '95%',
          objectFit: 'fill',
          zIndex: 0,
        }}
      />

      {disabled && (
        <img
          src={lockIcon}
          alt="잠금"
          style={{
            position: 'absolute',
            top: 65,
            right: 50,
            width: 40,
            height: 40,
            zIndex: 2,
          }}
        />
      )}

      <div
        style={{
          position: 'relative',
          zIndex: 3,
          width: '95%',
          height: '95%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: CardSizes.playerTop,
          color: Colors.grey07,
          textAlign: 'center',
        }}
      >
        <img
          src={icon}
          alt="카드 아이콘"
          style={{
            width: CardSizes.icon.width,
            height: CardSizes.icon.width,
            marginBottom: 15,
          }}
        />
        <div style={{ ...FontStyles.headlineSmall, color: Colors.brandPrimary, marginBottom: 15 }}>
          {title}
        </div>
        <div
          style={{
            width: '60%',
            height: 1,
            backgroundColor: Colors.grey01,
            marginBottom: 16,
          }}
        />
        <div
          style={{
            ...FontStyles.body,
            color: Colors.grey06,
            width: '80%',
          }}
        >
          {description}
        </div>
      </div>

      {isHovered && (
        <div
          style={{
            position: 'absolute',
            top: '90%',
            left: '45%',
            zIndex: 5,
          }}
        >
        <GameMapOptionBox option1={opt1} option2={opt2} />
        </div>
      )}
    </div>
  );
}
