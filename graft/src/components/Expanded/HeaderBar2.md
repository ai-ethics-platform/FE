# src/components/Expanded/HeaderBar2.jsx

- findModeAndIndex · function · L23-L28 — findModeAndIndex = (path)
- HeaderBar · function · L30-L219 — function HeaderBar({ nextDisabled = false, height = 56, style = {}, crumbs = ['오프닝 멘트', '역할', '상황 및 딜레마 질문', '플립 단계', '최종 멘트'], activeCrumb, onCrumbChange, onLeftClick, onNextClick = () => {}, // ⬅️ 기본값 포함해 prop 추가 onBeforeNavigate, // 단계 이동 전에 현재 단계를 저장(PUT)하는 훅. false 반환 시 이동 취소 })
- routeOf · function · L63-L63 — routeOf = (m, idx)
- runBeforeNavigate · function · L67-L82 — runBeforeNavigate = async ()
- selectCrumb · function · L84-L98 — selectCrumb = async (idx)
- handleLeftClick · function · L100-L100 — handleLeftClick = ()
- handleModeChange · function · L102-L115 — handleModeChange = async (newMode)
