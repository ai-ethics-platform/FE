// 챗봇 이후 연결해야할 페이지
// 여기서 empty를 사용하지말고 챗봇에서 받아오는 값을 모두 여기서 초기화 시킨 후 보내는 것도 괜찮을듯
import { useEffect, useState } from 'react';
import CreatorLayout from '../components/Expanded/CreatorLayout';
import CreatorContentBox from "../components/Expanded/CreatorContentBox";
import Continue from '../components/Expanded/CreateContinue';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function Create00() {
  const navigate = useNavigate();

  const [creating, setCreating] = useState(false);
  const [createdCode, setCreatedCode] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  //  페이지 최초 진입 시 빈 레코드 생성
  useEffect(() => {
    let didCancel = false;

    // const createEmptyGame = async () => {
    //   try {
    //     setCreating(true);
    //     setErrorMsg('');

    //    // 로컬에서 읽기 
    //     const teacher_name = localStorage.getItem('teacher_name') || '';
    //     const teacher_school = localStorage.getItem('teacher_school') || '';
    //     const teacher_email = localStorage.getItem('teacher_email') || '';

    //     // data는 객체
    //     const dataSkeleton = {
    //       opening: [], 
    //       roles: [],  
    //       rolesBackground: "",
    //       dilemma: {
    //         situation: [],
    //         question: "",
    //         options: { agree_label: "", disagree_label: "" }
    //       },
    //       flips: {
    //         agree_texts: [],
    //         disagree_texts: []
    //       },
    //       finalMessages: { agree: "", disagree: "" }
    //     };

    //     const payload = {
    //       teacher_name,
    //       teacher_school,
    //       teacher_email,
    //       title: '-',                    
    //       representative_image_url: '-', 
    //       data: dataSkeleton            
    //     };

    //     const { data: res } = await axiosInstance.post('/custom-games', payload, {
    //       headers: { 'Content-Type': 'application/json' }
    //     });

    //     if (didCancel) return;

    //     const code = res?.code ?? null;
    //     const gameUrl = res?.url ?? null;
    //     setCreatedCode(code);
    //     if (code) {
    //       localStorage.setItem('code', code);
    //     }
    //     if (gameUrl) {
    //       localStorage.setItem('url', gameUrl);
    //     }
    //   } catch (err) {
    //     if (!didCancel) {
    //       console.error(err);
    //       setErrorMsg('초기 게임 생성 중 문제가 발생했습니다.');
    //     }
    //   } finally {
    //     if (!didCancel) setCreating(false);
    //   }
    // };

    // createEmptyGame();
    return () => { didCancel = true; };
  }, []);

  const combinedText= '지금까지 만드신 딜레마 내용을 실제 게임 플레이 화면에 맞추어 수정하는 단계입니다. \n 딜레마 내용을 직접 수정하고, 내용과 함께 나올 그림을 추가할 수 있습니다. \n 아래의 [시작하기]버튼을 클릭하시면 미리보기 및 수정 단계가 시작됩니다. ';


  const handleNext = () => {
    // if (!createdCode) {
    //   alert('초기 게임 생성이 완료되지 않았습니다. 잠시 후 다시 시도해 주세요.');
    //   return;
    // }
    navigate('/create01');
  };

  return (
    <CreatorLayout
      headerbar={1}
      headerLeftType="home"
      headerNextDisabled={creating}
      onHeaderLeftClick={() => navigate('/chatpage')}
      onHeaderNextClick={handleNext}
      frame={false}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        <CreatorContentBox topicText="게임 편집하기" text={combinedText} />

        {errorMsg && (
          <div style={{ color: 'red', fontSize: 14 }}>{errorMsg}</div>
        )}

        <Continue
          onClick={handleNext}
          label={creating ? '초기화 중...' : '시작하기'}
          disabled={creating}
          style={{ marginTop: 10, width: 264, height: 72, opacity: creating || !createdCode ? 0.6 : 1 }}
        />
      </div>
    </CreatorLayout>
  );
}
