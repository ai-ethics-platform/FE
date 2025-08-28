import React, { useState } from 'react';
import { Colors, FontStyles } from '../styleConstants';
import inputBg from '../../assets/input.svg'; 

export default function CustomInput({
  width = 400,
  height = 120,
  placeholder = "여기에 입력하세요",
  backgroundColor = Colors.grey00,
  useSvgBackground = true, 
  value,
  onChange,
  padding = "20px 24px", 
}) {
  const [isFocused, setIsFocused] = useState(false);

  //  <br/> → \n 변환
  const formattedPlaceholder = placeholder.replace(/<br\s*\/?>/gi, "\n");

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        //borderRadius: 8,
        overflow: "hidden",
        background: useSvgBackground ? "transparent" : backgroundColor,
      }}
    >
      {useSvgBackground && (
        <img
          src={inputBg}
          alt="input background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
          }}
        />
      )}

      <textarea
        value={value}
        onChange={onChange}
        placeholder={formattedPlaceholder} 
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: "none",
          outline: "none",
          resize: "none",
          background: "transparent",
          color: Colors.grey06,
          ...FontStyles.body,
          lineHeight: "1.5",
          padding,
          boxSizing: "border-box",
          zIndex: 1,
          whiteSpace: "pre-line",
        }}
      />

      <style>
        {`
          textarea::placeholder {
            color: ${Colors.grey05};
            white-space: pre-line; /*  placeholder도 줄바꿈 반영 */
          }
        `}
      </style>
    </div>
  );
}
