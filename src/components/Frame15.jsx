import React from 'react'
import vector15 from '../assets/vector15.svg'

export default function Frame15() {
  return (
    <div style={{
        position: 'absolute',
        left: '20.625%',  
        top:  '11.13%' ,    
        width:    '50px',     
        height:   '796px',   
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',       
        boxSizing: 'border-box',
      }}>
      <img src={vector15} alt="" style={{ display: 'block' }} />
    </div>
  )
}
