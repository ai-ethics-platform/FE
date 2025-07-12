import React from 'react'
import vector14 from '../assets/vector14.svg'

export default function Frame14() {
  return (
        <div style={{
            position: 'absolute',
            left: '20.625%',  
            top:  '11.13%' ,    
            width:    '1500px',      
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',       
            boxSizing: 'border-box',
          }}>
          <img src={vector14} alt="" style={{ display: 'block' }} />
        </div>
  )
}

