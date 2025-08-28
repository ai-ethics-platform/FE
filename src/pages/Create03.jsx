// api 연결할 것 - 이미지, 화면 내용 3개 
import { useState } from 'react';
import DilemmaOutPopup from '../components/DilemmaOutPopup';
import CreatorLayout from '../components/Expanded/CreatorLayout';
import CreatorContentBox from "../components/Expanded/CreatorContentBox";
import Continue from '../components/Continue';
import { useNavigate } from 'react-router-dom';
import CreateInput from '../components/Expanded/CreateInput';
import inputPlusIcon from '../assets/inputplus.svg'; 
import create02Image from '../assets/images/create02.png';
import { FontStyles, Colors } from '../components/styleConstants';
import NextGreen from "../components/NextOrange";
import BackOrange from "../components/Expanded/BackOrange";
export default function Create03() {
  const navigate = useNavigate();
  const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");

  // A 영역 - 오프닝/제목 멘트 (수정 예정)
  const [openingText, setOpeningText] = useState("");

  // C 영역 - 입력 필드들을 배열로 관리
  const [inputs, setInputs] = useState([
    { id: 1, label: "화면 1 *", value: "", placeholder: "예: Homemate 사용자 최적화 시스템 업그레이드 공지", canDelete: false },
    { id: 2, label: "화면 2 ", value: "", placeholder: "예: 업데이트를 하면 고객님의 감정, 건강 상태, 생활 습관 등을 자동으로 수집하여...", canDelete: true },
    { id: 3, label: "화면 3 ", value: "", placeholder: " ", canDelete: true }
  ]);

  // B 영역 - 이미지 상태 (기본 이미지로 시작)
  const [image, setImage] = useState(null); // 업로드된 이미지
  const [isDefaultImage, setIsDefaultImage] = useState(true); // 기본 이미지 사용 여부

  //D 영역 - 각 딜레마 상황별 질문 
  const [dilemmaQuestion, setDilemmaQuestion] = useState("");
    const [option1, setOption1] = useState("");
    const [option2, setOption2] = useState("");

  const handleNext = () => {
    navigate('/create04');
  };
  const handleBack = () => {
    navigate('/create02');
  };
  const handleConfirm = async (finalTitle) => {
    // TODO
  };

  // 입력 필드 추가
  const handleAddInput = () => {
    setInputs(prev => {
      if (prev.length >= 5) return prev;
      const nextId = prev.reduce((m, it) => Math.max(m, it.id), 0) + 1;
      return [
        ...prev,
        {
          id: nextId,
          label: `화면 ${prev.length + 1} `,
          value: "",
          placeholder: " ",
          canDelete: true
        }
      ];
    });
  };

  // 입력 필드 삭제
  const handleDeleteInput = (idToDelete) => {
    setInputs(prev => {
      const filtered = prev.filter(input => input.id !== idToDelete);
      return filtered.map((input, index) => ({
        ...input,
        id: index + 1,
        label: `화면 ${index + 1} `
      }));
    });
  };

  // 입력값 변경
  const handleInputChange = (id, newValue) => {
    setInputs(prev =>
      prev.map(input => input.id === id ? { ...input, value: newValue } : input)
    );
  };

  // 이미지 변경 핸들러
  const handleImageChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setImage(file);
        setIsDefaultImage(false);
      }
    };
    input.click();
  };


  return (
    <CreatorLayout
      headerbar={2}
      headerLeftType="home"
      headerNextDisabled={true}
      onHeaderNextClick={() => console.log('NEXT')}
      frameProps={{
        value: title,
        onChange: (val) => setTitle(val),
        onConfirm: (val) => {
          setTitle(val);
          // 여기서도 원하면 localStorage 저장 가능
          localStorage.setItem("creatorTitle", val);
        },
      }}
    >
      {/* A 영역 - 오프닝/제목 멘트 */}
      <div style={{ marginTop: -50, marginBottom: '30px' }}>
        <h2 style={{
          ...FontStyles.headlineSmall,
          marginBottom: '16px',
          color: Colors.grey07
        }}>
          상황
        </h2>
        <p style={{
          ...FontStyles.title,
          color: Colors.grey05,
          lineHeight: 1.5,
          marginBottom: '32px'
        }}>
            딜레마 상황에 대해서 설명해주세요.
        </p>
      </div>

      {/* B, C 영역을 같은 행에 배치 */}
      <div style={{
        display: 'flex',
        gap: 100,
        alignItems: 'flex-start',
        marginBottom: '10px'
      }}>
        {/* B 영역 - 이미지 영역 (왼쪽) */}
        <div style={{
          flex: '0 0 360px', // 고정 너비
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* 이미지 표시 영역 */}
          <div
            style={{
              width: '100%',
              height: '180px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8f9fa',
              overflow: 'hidden'
            }}
          >
            <img
              src={isDefaultImage ? create02Image : URL.createObjectURL(image)}
              alt="딜레마 이미지"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '6px'
              }}
              onLoad={(e) => {
                if (!isDefaultImage && image) {
                  URL.revokeObjectURL(e.currentTarget.src);
                }
              }}
            />
          </div>

          {/* 이미지 변경 링크 */}
          <div style={{
            textAlign: 'center'
          }}>
            <span
              onClick={handleImageChange}
              style={{
                color: '#333',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: '3px'
              }}
            >
              이미지 변경
            </span>
          </div>

          {/* 빨간 글씨 안내문 */}
          <div style={{
            textAlign: 'center'
          }}>
            <p style={{
              color: Colors.systemRed,
              ...FontStyles.bodyBold,
              margin: 0,
              lineHeight: 1.4
            }}>
              (*권장 이미지 비율 2:1)
            </p>
          </div>
        </div>
        
        {/* C 영역 - 입력 필드들 (오른쪽) */}
        <div style={{ flex: '1',marginTop:-10 }}>
          {inputs.map((input) => (
            <CreateInput
              key={input.id}
              label={input.label}
              value={input.value}
              onChange={(e) => handleInputChange(input.id, e.target.value)}
              placeholder={input.placeholder}
              onDelete={input.canDelete ? () => handleDeleteInput(input.id) : undefined}
            />
          ))}

          {/* + 버튼 - 5개 미만일 때만 표시 */}
          {inputs.length < 5 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '20px'
            }}>
              <button
                onClick={handleAddInput}
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                <img
                  src={inputPlusIcon}
                  alt="입력 필드 추가"
                  style={{ width: '40px', height: '40px' }}
                />
              </button>
            </div>
          )}
        </div>
       
      </div>
        {/* D 영역 - 딜레마 질문 및 선택지 */}
        <div style={{ marginTop: 20,paddingBottom: 40 }}>
        <h2
            style={{
            ...FontStyles.headlineSmall,
            marginBottom: "16px",
            color: Colors.grey07,
            }}
        >
            딜레마 질문 및 선택지
        </h2>
        <p
            style={{
            ...FontStyles.title,
            color: Colors.grey05,
            lineHeight: 1.5,
            marginBottom: "32px",
            }}
        >
            위의 상황에 맞는 딜레마 질문과 선택지를 설정해 주세요.
            게임에 참여하는 3명의 플레이어는 모두 딜레마 질문에 대한 답변을 선택합니다.
        </p>
        {/* 딜레마 질문 */}
        <CreateInput
            width = {900}
            label="딜레마 질문*"
            value={dilemmaQuestion}
            onChange={(e) => setDilemmaQuestion(e.target.value)}
            placeholder="예: Homemate 사용자 최적화 시스템 업그레이드 공지"
        />

        {/* 선택지 1 */}
        <CreateInput
            width = {900}
            label="선택지1"
            value={option1}
            onChange={(e) => setOption1(e.target.value)}
            placeholder="예: 동의"
        />

        {/* 선택지 2 */}
            <CreateInput
                width = {900}
                label="선택지2"
                value={option2}
                onChange={(e) => setOption2(e.target.value)}
                placeholder="예: 비동의"
            />
            </div>
        {/* 뒤로가기, Next 버튼 고정 */}
        <div style={{
            position: 'absolute',
            bottom: '30px',
            right: '30px'
        }}>
        <NextGreen onClick={handleNext} />
        </div>
        <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '30px'
        }}>
        <BackOrange onClick={handleBack} />
        </div>
    </CreatorLayout>
  );
}