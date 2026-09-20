# src/components/Expanded/HeaderBar2.jsx

- findModeAndIndex · function · L22-L27 — findModeAndIndex = (path)
- HeaderBar · function · L29-L219 — function HeaderBar({ nextDisabled = false, height = 56, style = {}, crumbs = ['오프닝 멘트', '역할', '상황 및 딜레마 질문', '플립 단계', '최종 멘트'], activeCrumb, onCrumbChange, onLeftClick, onNextClick = () => {}, // ⬅️ 기본값 포함해 prop 추가 onBeforeNavigate, // 단계 이동 전에 현재 단계를 저장(PUT)하는 훅. false 반환 시 이동 취소 })
- routeOf · function · L62-L62 — routeOf = (m, idx)
- runBeforeNavigate · function · L66-L81 — runBeforeNavigate = async ()
- selectCrumb · function · L83-L97 — selectCrumb = async (idx)
- handleLeftClick · function · L99-L99 — handleLeftClick = ()
- handleModeChange · function · L101-L114 — handleModeChange = async (newMode)
