import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import arrow from '../assets/arrow-left.svg';
import arrowUp from '../assets/arrowUp.svg';
import SelectCard from '../components/SelectCard';
import PrimaryButton from '../components/PrimaryButton';
import logo from '../assets/logo.svg';
import { FontStyles, Colors } from '../components/styleConstants';
import { translations } from '../utils/language/index';

export default function Signup() {
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = translations[lang].Signup01;

  const [showInfo, setShowInfo] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);

  const isAllAgreed = agree1 && agree2;
  const navigate = useNavigate();

  if (!t) return null; // 언어팩 로드 방어 코드

  return (
    <Background bgIndex={2}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2vh 0', boxSizing: 'border-box' }}>
        <div style={{ width: '50vw', maxWidth: 552, padding: '2vh 24px', boxSizing: 'border-box', ...FontStyles.body }}>
          
          {/* Header */}
          <div style={{ position: 'relative', height: '6vh', maxHeight: 60, marginBottom: '2vh' }}>
            <img src={arrow} alt="back" style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '4vh', maxWidth: 40, cursor: 'pointer' }} onClick={() => navigate('/')} />
            <div style={{ textAlign: 'center', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
              <img src={logo} alt="logo" style={{ height: '5vh', maxHeight: 48 }} />
            </div>
          </div>

          {/* Research Overview */}
          <div style={{ fontSize: 'clamp(1rem, 1.2vw, 1.125rem)', fontWeight: 600, color: '#1E293B', marginBottom: '1vh' }}>
            {t.researchOverview}
          </div>
          <div style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)', lineHeight: 1.6, backgroundColor: '#F1F5F9', padding: '1.5vh 1.5vw', borderRadius: 8, border: '1px solid #CBD5E1' }}>
            {t.overviewContent1}<br /><br />{t.overviewContent2}
          </div>

          {/* Data Collection Accordion */}
          <div style={{ marginTop: '3vh', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowInfo(!showInfo)}>
            <div style={{ fontWeight: 600, fontSize: 'clamp(1rem, 1.2vw, 1.125rem)' }}>{t.dataCollectionTitle}</div>
            <img src={arrowUp} alt="toggle" style={{ width: '3vh', maxWidth: 40, transform: showInfo ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
          </div>
          {showInfo && (
            <div style={{ marginTop: '1vh', backgroundColor: Colors.componentBackground, padding: '1.5vh 1.5vw', borderRadius: 8, border: '1px solid #E5E7EB', color: '#374151', lineHeight: 1.6, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', paddingBottom: 8 }}>{t.tableCol1}</th>
                    <th style={{ textAlign: 'left', paddingBottom: 8 }}>{t.tableCol2}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>{t.data1Name}</td><td>{t.data1Usage}</td></tr>
                  <tr><td>{t.data2Name}</td><td>{t.data2Usage}</td></tr>
                  <tr><td>{t.data3Name}</td><td>{t.data3Usage}</td></tr>
                  <tr><td>{t.data4Name}</td><td>{t.data4Usage}</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Policy Accordion */}
          <div style={{ marginTop: '5vh', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowPolicy(!showPolicy)}>
            <div style={{ fontWeight: 600, fontSize: 'clamp(1rem, 1.2vw, 1.125rem)' }}>{t.dataStorageTitle}</div>
            <img src={arrowUp} alt="toggle" style={{ width: '3vh', maxWidth: 40, transform: showPolicy ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
          </div>
          {showPolicy && (
            <div style={{ marginTop: '1vh', backgroundColor: Colors.componentBackground, padding: '1.5vh 1.5vw', borderRadius: 8, border: '1px solid #E5E7EB', color: '#374151', lineHeight: 1.6 }}>
              <p>{t.policy1}</p>
              <p>{t.policy2}<br />{t.policy2_1}<br />{t.policy2_2}</p>
              <p>{t.policy3}</p><p>{t.policy4}</p><p>{t.policy5}</p>
            </div>
          )}

          {/* Contact Accordion */}
          <div style={{ marginTop: '5vh', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowContact(!showContact)}>
            <div style={{ fontWeight: 600, fontSize: 'clamp(1rem, 1.2vw, 1.125rem)' }}>{t.contactTitle}</div>
            <img src={arrowUp} alt="toggle" style={{ width: '3vh', maxWidth: 40, transform: showContact ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
          </div>
          {showContact && (
            <div style={{ marginTop: '1vh', backgroundColor: '#F8FAFC', padding: '1.5vh 1.5vw', borderRadius: 8, border: '1px solid #E5E7EB', color: '#374151', lineHeight: 1.6 }}>
              <p>{t.contactInfo1}</p><p>{t.contactInfo2}</p>
            </div>
          )}

          {/* Agreement Checkbox */}
          <div style={{ marginTop: '1.5vh', display: 'flex', flexDirection: 'column', gap: '2vh' }}>
            <SelectCard label={t.agreeLabel1} selected={agree1} onClick={() => setAgree1(!agree1)} style={{ width: '100%', height: '8vh', fontSize: 'clamp(0.875rem, 1vw, 1rem)' }} />
            <SelectCard label={t.agreeLabel2} selected={agree2} onClick={() => setAgree2(!agree2)} style={{ width: '100%', height: '8vh', fontSize: 'clamp(0.875rem, 1vw, 1rem)' }} />
          </div>

          {/* Next Button */}
          <div style={{ marginTop: '5vh', textAlign: 'center', marginBottom: '4vh' }}>
            <PrimaryButton disabled={!isAllAgreed} style={{ width: '100%', height: '8vh', maxHeight: 64 }} onClick={() => navigate('/signup02')}>
              {t.nextBtn}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Background>
  );
}