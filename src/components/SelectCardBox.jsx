import React from 'react';
import { FontStyles, Colors } from '../components/styleConstants';

export default function SelectCardBox({ srcFrame, title, count, avatars }) {
  return (
    <div style={{ position:'relative', width:360, height:391 }}>
      {/* 프레임 이미지 */}
      <img
        src={srcFrame}
        alt=""
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'fill' }}
      />

      {/* 내용 */}
      <div
        style={{
          position:'absolute', inset:0, zIndex:1,
          display:'flex', flexDirection:'column',
          justifyContent:'center', alignItems:'center',
        }}
      >
        <p style={{ ...FontStyles.headlineSmall, color:Colors.grey06 }}>{title}</p>
        <p style={{ ...FontStyles.headlineLarge,  color:Colors.grey06, margin:'16px 0' }}>
          {count}명
        </p>
        <div style={{ display:'flex', gap:12, marginTop:24 }}>
          {avatars.map((src,i)=>(
            <img key={i} src={src} alt="" style={{ width:48, height:48 }} />
          ))}
        </div>
      </div>
    </div>
  );
}