import voiceManager from '../utils/voiceManager';
import React, { useState, useEffect } from 'react';
import { Colors } from './styleConstants';
export default function VoiceToggle({ onChange }) {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem('voice_enabled');
    return stored === null ? true : stored === 'true';
  });

  const handleToggle = async () => {
    const newValue = !enabled;
    setEnabled(newValue);
    localStorage.setItem('voice_enabled', newValue.toString());

    if (onChange) onChange(newValue);

    console.log('Voice enabled changed to:', newValue);

    if (newValue === false) {
      await voiceManager.disableVoiceFeatures(); //
    } else {
      // 필요시 다시 enable 로직
    }
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        background: enabled ? Colors.brandPrimary : Colors.grey03,
        color: enabled? 'white':'black',
        border: 'none',
        padding: '8px 16px',
        borderRadius: 8,
        fontWeight: 'bold',
        cursor: 'pointer',
      }}
    >
      {enabled ? 'ON' : 'OFF'}
    </button>
  );
}
