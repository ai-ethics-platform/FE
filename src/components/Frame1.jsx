import React from 'react'
import logo from '../assets/logo.svg'

const logoStyle = {
  width: 'clamp(180px, 60vw, 420px)',
  height: 'auto',
}
export default function Frame1() {
  return (
    <div style={{
      backgroundColor: 'transparent', // 혹은 필요에 따라 반투명 rgba
     
    }}>
      <img src={logo} alt="logo" style={logoStyle} />
      {/* 여기에 다른 벡터 컴포넌트들 */}
    </div>
  )
}
