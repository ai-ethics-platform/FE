import DilemmaOutPopup from '../components/DilemmaOutPopup';
import CreatorLayout from '../components/Expanded/CreatorLayout';
import CreatorContentBox from "../components/Expanded/CreatorContentBox";
import Continue from '../components/Continue';
export default function Create01() {
    const combinedText= '지금까지 만드신 딜레마 내용을 실제 게임 플레이 화면에 맞추어 수정하는 단계입니다. \n 딜레마 내용을 직접 수정하고, 내용과 함께 나올 그림을 추가할 수 있습니다. \n 아래의 [시작하기]버튼을 클릭하시면 미리보기 및 수정 단계가 시작됩니다. ';
  return (
    <CreatorLayout
      headerLeftType="home"               
      headerNextDisabled={false}          
      onHeaderLeftClick={() => window.history.back()}
      onHeaderNextClick={() => console.log('NEXT')}
    >
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>

    <CreatorContentBox topicText="게임 편집하기" text={combinedText}  />
    <Continue
        label="시작하기"
        style={{ marginTop:10, width: 264, height: 72 }}
    />
    </div>
    </CreatorLayout>
  );
}
