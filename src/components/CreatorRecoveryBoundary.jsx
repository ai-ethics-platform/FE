import { Component } from 'react';

export default class CreatorRecoveryBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error, info) {
    console.error('제작 화면 오류:', error, info);
    try {
      sessionStorage.setItem('dilemma.creator.lastError', JSON.stringify({
        at: new Date().toISOString(), path: window.location.pathname,
        name: error.name, message: error.message, stack: info.componentStack,
      }));
    } catch { /* Recovery must also work when browser storage is full. */ }
  }

  render() {
    if (this.state.failed) return <div role="alert" style={{ padding: 32 }}>
      <p>화면을 표시하는 중 문제가 발생했어요. 마지막으로 저장된 내용부터 다시 열어 주세요.</p>
      <button type="button" onClick={() => window.location.reload()}>화면 다시 열기</button>
    </div>;
    // Browser translation replaces React-owned text nodes and can break later updates.
    return <div translate="no" className="notranslate" style={{ display: 'contents' }}>{this.props.children}</div>;
  }
}
