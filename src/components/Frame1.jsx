import React from 'react'
import logo from '../assets/logo.svg'

const logoStyle = {
  width: 'clamp(180px, 60vw, 420px)',
  height: 'auto',
}
export default function Frame1() {
  return (
    <div style={{
      backgroundColor: 'transparent', 
     
    }}>
      <img src={logo} alt="logo" style={logoStyle} />
    </div>
  )
}
