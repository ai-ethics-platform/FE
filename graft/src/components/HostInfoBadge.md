# src/components/HostInfoBadge.jsx

- HostInfoBadge · function · L8-L141 — function HostInfoBadge({ src, alt = 'Host Info', width = 300, height = 300, imgStyle = {}, style = {}, closeButtonStyle = {}, closeIconStyle = {}, defaultOpen = true, onClose, /** * host_info*.svg처럼 "이미지 내부에 X 아이콘이 이미 그려져 있는" 경우, * 버튼을 해당 X 영역에 자동으로 맞춰줍니다. * - 현재 프리셋은 `hostInfo`만 지원 */ preset, /** * 이미지 자체에 X가 있는 경우 보통 아이콘을 또 그릴 필요가 없어서 기본 false */ showCloseIcon = false, closeIconSrc = closeIconDefault, closeAriaLabel = '닫기', })
