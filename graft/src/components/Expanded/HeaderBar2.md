# src/components/Expanded/HeaderBar2.jsx

- findModeAndIndex · function · L23-L28 — findModeAndIndex = (path)
- HeaderBar · function · L30-L223 — function HeaderBar({ nextDisabled = false, height = 56, style = {}, crumbs = ['오프닝 멘트', '역할', '상황 및 딜레마 질문', '플립 단계', '최종 멘트'], activeCrumb, onCrumbChange, onLeftClick, onNextClick = () => {}, // ⬅️ 기본값 포함해 prop 추가 onBeforeNavigate, // 단계 이동 전에 현재 단계를 저장(PUT)하는 훅. false 반환 시 이동 취소 })
- routeOf · function · L65-L65 — routeOf = (m, idx)
- runBeforeNavigate · function · L69-L84 — runBeforeNavigate = async ()
- selectCrumb · function · L86-L100 — selectCrumb = async (idx)
- handleLeftClick · function · L102-L102 — handleLeftClick = ()
- handleModeChange · function · L104-L117 — handleModeChange = async (newMode)
