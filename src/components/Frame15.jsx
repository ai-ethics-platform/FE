import React from 'react'
import vector15 from '../assets/vector15.svg'

export default function Frame15() {
  return (
    <div style={{
        position: 'absolute',
        left: '20.625%',  
        top:  '11.13%' ,    
        width:    '50px',      // 50/1920*100
        height:   '796px',   // Figma Auto Layout H
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',       // Figma Auto Layout Gap
        boxSizing: 'border-box',
      }}>
      <img src={vector15} alt="" style={{ display: 'block' }} />
      {/* 나머지 벡터들도 동일하게 */}
    </div>
  )
}
