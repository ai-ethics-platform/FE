import React from 'react'
import vector14 from '../assets/vector14.svg'

export default function Frame14() {
  return (
        <div style={{
            position: 'absolute',
            left: '20.625%',  
            top:  '11.13%' ,    
            width:    '1500px',      // 50/1920*100   // Figma Auto Layout H
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',       // Figma Auto Layout Gap
            boxSizing: 'border-box',
          }}>
          <img src={vector14} alt="" style={{ display: 'block' }} />
          {/* 나머지 벡터들도 동일하게 */}
        </div>
  )
}

