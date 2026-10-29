import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { forgetPreviewAccess, readPreviewAccess, rememberPreviewAccess } from '../../utils/previewAccess';
import defaultImage from '../../assets/images/default.png';
import './preview.css';

const stages = ['배경 이야기', '역할 소개', '딜레마', '각 역할의 선택', '토론과 공동 선택', '선택 이후', '다시 생각하기', '엔딩'];
const text = value => typeof value === 'string' && value.trim() && value !== '-' ? value : '';
const paragraphs = value => Array.isArray(value) ? value.filter(item => text(item)) : [];

function GameExperience({ game }) {
  const [stage, setStage] = useState(0);
  const [role, setRole] = useState(0);
  const [page, setPage] = useState(0);
  const [choices, setChoices] = useState([null, null, null]);
  const [firstChoice, setFirstChoice] = useState(null);
  const [finalChoice, setFinalChoice] = useState(null);
  const heading = useRef(null);
  const data = game.data;
  const roles = data.roles;
  const labels = { agree: text(data.dilemma?.options?.agree_label) || '선택지 1', disagree: text(data.dilemma?.options?.disagree_label) || '선택지 2' };
  const images = data.representativeImages || game.representative_images || {};
  const resolveImage = value => {
    if (!text(value)) return defaultImage;
    try {
      const url = new URL(value, `${axiosInstance.defaults.baseURL}/`);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : defaultImage;
    } catch { return defaultImage; }
  };
  let content = [];
  let image = images.dilemma_image_1 || game.representative_image_url;
  if (stage === 0) content = paragraphs(data.opening);
  if (stage === 1) {
    content = [text(data.rolesBackground), text(roles[role]?.description)].filter(Boolean);
    image = data.roleImages?.[String(role + 1)];
  }
  if (stage >= 2 && stage <= 4) {
    content = stage === 2 ? paragraphs(data.dilemma?.situation) : [text(data.dilemma?.question)];
    image = images.dilemma_image_3;
  }
  if (stage === 5) {
    content = paragraphs(data.flips?.[`${firstChoice}_texts`]);
    image = images[firstChoice === 'agree' ? 'dilemma_image_4_1' : 'dilemma_image_4_2'];
  }
  if (stage === 6) content = [text(data.dilemma?.question)];
  if (stage === 7) content = [text(data.finalMessages?.[finalChoice])];
  const canContinue = stage === 3 ? choices.every(Boolean) : stage === 4 ? Boolean(firstChoice) : stage === 6 ? Boolean(finalChoice) : true;
  const move = target => { setStage(target); setPage(0); heading.current?.focus(); };
  const pick = choice => {
    if (stage === 3) setChoices(previous => previous.map((value, index) => index === role ? choice : value));
    if (stage === 4) {
      setFirstChoice(choice);
      setFinalChoice(choice);
    }
    if (stage === 6) setFinalChoice(choice);
  };
  const selected = stage === 3 ? choices[role] : stage === 4 ? firstChoice : finalChoice;

  return <>
    <header className="preview-heading">
      <div><span className="preview-tag">선생님 전용 미리보기</span><h1>{game.title}</h1></div>
      <Link to="/selectroom">미리보기 나가기</Link>
    </header>
    <p className="preview-notice">다른 참여자 없이 역할을 바꿔가며 체험합니다. 선택은 연습용이며, AI 호출이나 수업 기록 저장은 하지 않습니다.</p>
    <nav aria-label="체험 단계" className="preview-steps">{stages.map((label, index) => <span key={label} aria-current={stage === index ? 'step' : undefined}>{index + 1}. {label}</span>)}</nav>
    <section className="preview-card">
      <div className="preview-roles" aria-label="체험할 역할">{roles.map((item, index) => <button key={index} type="button" aria-pressed={role === index} onClick={() => { setRole(index); setPage(0); }}>{text(item.name) || `역할 ${index + 1}`}</button>)}</div>
      <h2 ref={heading} tabIndex={-1}>{stages[stage]}{stage === 1 || stage === 3 ? ` · ${roles[role].name || `역할 ${role + 1}`}` : ''}</h2>
      <div className="preview-scene">
        <img key={image || 'default'} src={resolveImage(image)} alt={stage === 1 ? `${roles[role].name || '역할'} 이미지` : '게임 장면'} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = defaultImage; }} />
        <div className="preview-story">
          <p>{content[page] || '아직 작성된 내용이 없습니다. 게임 편집에서 내용을 추가해주세요.'}</p>
          {content.length > 1 && <div className="preview-pages"><button disabled={page === 0} onClick={() => setPage(page - 1)}>이전 문단</button><span>{page + 1} / {content.length}</span><button disabled={page === content.length - 1} onClick={() => setPage(page + 1)}>다음 문단</button></div>}
        </div>
      </div>
      {stage === 2 && <p className="preview-question">{text(data.dilemma?.question)}</p>}
      {[3, 4, 6].includes(stage) && <>
        <p>{stage === 3 ? '역할을 바꾸며 세 사람의 선택을 각각 지정해주세요.' : stage === 4 ? '실제 수업에서는 서로의 이유를 듣고 공동 선택을 합니다. 여기서는 선생님이 선택해주세요.' : '선택 이후의 이야기를 본 뒤, 최종 공동 선택을 지정해주세요.'}</p>
        <div className="preview-options">{Object.entries(labels).map(([value, label]) => <button key={value} aria-pressed={selected === value} onClick={() => pick(value)}>{label}</button>)}</div>
      </>}
      {stage >= 3 && <ul className="preview-summary">{roles.map((item, index) => <li key={index}>{item.name || `역할 ${index + 1}`}: {labels[choices[index]] || '선택 전'}</li>)}</ul>}
      {stage >= 5 && <p>첫 공동 선택: {labels[firstChoice]}{stage === 7 ? ` / 최종 공동 선택: ${labels[finalChoice]}` : ''}</p>}
      {stage === 7 && <p className="preview-notice">체험을 마쳤습니다. 공동 선택을 바꾸면 다른 분기의 이야기와 엔딩도 확인할 수 있어요.</p>}
      <footer className="preview-controls">
        <button disabled={stage === 0} onClick={() => move(stage - 1)}>이전 단계</button>
        {stage < stages.length - 1 ? <button className="preview-primary" disabled={!canContinue} onClick={() => move(stage + 1)}>다음으로</button> : <button className="preview-primary" onClick={() => { setChoices([null, null, null]); setFirstChoice(null); setFinalChoice(null); move(0); }}>처음부터 다시 체험</button>}
      </footer>
    </section>
  </>;
}

function PreviewAccess({ code }) {
  const [editCode, setEditCode] = useState(() => readPreviewAccess(code));
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestRef = useRef(null);

  useEffect(() => () => requestRef.current?.abort(), []);

  const load = async event => {
    event.preventDefault();
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get(`/custom-games/${encodeURIComponent(code)}/preview`, {
        headers: { 'X-Edit-Code': editCode.trim() }, signal: controller.signal, timeout: 20000,
      });
      if (controller.signal.aborted) return;
      if (data.code !== code || !Array.isArray(data.data?.roles) || data.data.roles.length !== 3 || !data.data.roles.every(role => role && typeof role === 'object')) throw new Error('게임의 세 역할을 먼저 작성해주세요.');
      rememberPreviewAccess(code, editCode.trim());
      setGame(data);
      setEditCode('');
    } catch (err) {
      if (controller.signal.aborted) return;
      if ([401, 403, 422].includes(err.response?.status)) {
        forgetPreviewAccess(code);
        setError('제작자 수정 코드가 올바르지 않습니다. 학생용 게임 코드로는 체험할 수 없습니다.');
      } else if (err.response?.status === 404) setError('게임을 찾을 수 없습니다. 게임 코드를 확인해주세요.');
      else setError(err.response ? '미리보기를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' : err.message || '연결을 확인하고 다시 시도해주세요.');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };
  if (game) return <GameExperience game={game} />;
  return <section className="preview-card preview-access">
    <span className="preview-tag">제작자 권한 확인</span><h1>혼자 체험하기</h1>
    <p>이 게임을 만든 선생님의 수정 코드를 입력해주세요. 학생용 공유 링크와 게임 코드만으로는 들어갈 수 없습니다.</p>
    <form onSubmit={load}>
      <label htmlFor="preview-edit-code">제작자 수정 코드</label>
      <input id="preview-edit-code" type="password" autoComplete="off" value={editCode} onChange={event => setEditCode(event.target.value)} required />
      {error && <p role="alert">{error}</p>}
      <button className="preview-primary" disabled={loading || !editCode.trim()}>{loading ? '권한 확인 중…' : '권한 확인 후 체험하기'}</button>
    </form>
    <Link to="/preview">다른 게임 불러오기</Link><Link to="/selectroom">메인화면으로</Link>
  </section>;
}

export default function GamePreview() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  return <main className="game-preview">{code ? <PreviewAccess key={code} code={code} /> : <section className="preview-card preview-access">
    <span className="preview-tag">선생님 전용</span><h1>기존 게임 혼자 체험하기</h1>
    <p>게임을 불러온 뒤 제작자 수정 코드로 권한을 확인합니다.</p>
    <form onSubmit={event => { event.preventDefault(); if (input.trim()) navigate(`/preview/${encodeURIComponent(input.trim())}`); }}>
      <label htmlFor="preview-game-code">게임 코드</label><input id="preview-game-code" value={input} onChange={event => setInput(event.target.value)} required />
      <button className="preview-primary" disabled={!input.trim()}>게임 불러오기</button>
    </form><Link to="/selectroom">메인화면으로</Link>
  </section>}</main>;
}
