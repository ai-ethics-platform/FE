import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Componentcheck from "../pages/Componentcheck";
import Signup01 from '../pages/Signup01';
import Signup02 from '../pages/Signup02';
import SelectRoom from '../pages/SelectRoom'
import WaitingRoom from '../pages/WaitingRoom';
import GameIntro from "../pages/GameIntro";
import GameIntro2 from "../pages/GameIntro2";
import SelectHomeMate from '../pages/SelectHomeMate';
import MateName from "../pages/MateName";
import Game01 from '../pages/Game01';
import Game02 from "../pages/Game02";
import Game03 from "../pages/Game03";
import Game04 from "../pages/Game04";
import Game05 from '../pages/Game05';
import Game05_1 from "../pages/Game05_1";
import Game06 from '../pages/Game06';
import Game07 from "../pages/Game07";
import Game08 from "../pages/Game08";
import Game09 from "../pages/Game09";
import CD1 from "../pages/CD1";
import CD2 from "../pages/CD2";
import CD3 from "../pages/CD3";
import CD_all from "../pages/CD_all";
import GameMap from "../pages/GameMap";
import WebSocketProvider from "../WebSocketProvider";
import WebRTCProvider from "../WebRTCProvider"; 
import MicTest from '../pages/MicTest';
import Create00 from '../pages/Create00';
import Create01 from "../pages/create01";
import Create02 from '../pages/Create02';
import Create03 from '../pages/Create03';
import Create04 from "../pages/Create04";
import Create05 from "../pages/Create05";
import Editor01 from "../pages/Editor01";
import Editor02 from "../pages/Editor02";
import Editor02_1 from "../pages/Editor02_1";
import Editor02_2 from "../pages/Editor02_2";
import Editor02_3 from "../pages/Editor02_3";
import Editor03 from "../pages/Editor03";
import Editor04 from "../pages/Editor04";
import Editor05 from "../pages/Editor05";
import Editor06 from "../pages/Editor06";
import Editor07 from "../pages/Editor07";
import Editor07_1 from "../pages/Editor07_1";
import Editor08 from "../pages/Editor08";
import Editor09 from "../pages/Editor09";
import Editor10 from "../pages/Editor10";
import Editor10_1 from "../pages/Editor10_1";
import CreatorEnding from "../pages/CreatorEnding";
import CustomRoom from "../pages/CustomRoom";
import VoiceTestSimulator from '../pages/VoiceTestSimulator';
// WebSocket/WebRTC가 필요한 페이지들을 감싸는 컴포넌트
function GameRoutes() {
  return (
    <WebSocketProvider>
      <WebRTCProvider>
        <Routes>
          <Route path="/voicetestsimulator" element={<VoiceTestSimulator />} />
          <Route path="/gameintro" element={<GameIntro />} />
          <Route path="/gameintro2" element={<GameIntro2 />} />
          <Route path="/selecthomemate" element={<SelectHomeMate />} />
          <Route path="/matename" element={<MateName />} />
          <Route path="/mictest" element={<MicTest />} />
          <Route path="/game01" element={<Game01 />} />
          <Route path="/game02" element={<Game02 />} />
          <Route path="/game03" element={<Game03 />} />
          <Route path="/game04" element={<Game04 />} />
          <Route path="/game05" element={<Game05 />} />
          <Route path="/game05_1" element={<Game05_1 />} />
          <Route path="/game06" element={<Game06 />} />
          <Route path="/game07" element={<Game07 />} />
          <Route path="/game08" element={<Game08 />} />
          <Route path="/game09" element={<Game09 />} />
          <Route path="/character_description1" element={<CD1 />} />
          <Route path="/character_description2" element={<CD2 />} />
          <Route path="/character_description3" element={<CD3 />} />
          <Route path="/gamemap" element={<GameMap />} />
          <Route path="/character_all" element={<CD_all />} />

        </Routes>
      </WebRTCProvider>
    </WebSocketProvider>
  );
}

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* WebSocket/WebRTC가 필요하지 않은 페이지들 */}
        <Route path="/" element={<Login />} />
        <Route path="/componentcheck" element={<Componentcheck />} />
        <Route path="/signup01" element={<Signup01 />} />
        <Route path="/signup02" element={<Signup02 />} />
        <Route path="/selectroom" element={<SelectRoom />} />
        <Route path="/waitingroom" element={<WaitingRoom />} />
        <Route path="/create00" element={<Create00 />} />
        <Route path="/create01" element={<Create01 />} />
        <Route path="/create02" element={<Create02 />} />
        <Route path="/create03" element={<Create03 />} />
        <Route path="/create04" element={<Create04 />} />
        <Route path="/create05" element={<Create05 />} />
        <Route path="/editor01" element={<Editor01 />} />
        <Route path="/editor02" element={<Editor02 />} />
        <Route path="/editor02_1" element={<Editor02_1 />} />
        <Route path="/editor02_2" element={<Editor02_2 />} />
        <Route path="/editor02_3" element={<Editor02_3 />} />
        <Route path="/editor03" element={<Editor03 />} />
        <Route path="/editor04" element={<Editor04 />} />
        <Route path="/editor05" element={<Editor05 />} />
        <Route path="/editor06" element={<Editor06 />} />
        <Route path="/editor07" element={<Editor07 />} />
        <Route path="/editor07_1" element={<Editor07_1 />} />
        <Route path="/editor08" element={<Editor08 />} />
        <Route path="/editor09" element={<Editor09 />} />
        <Route path="/editor10" element={<Editor10 />} />
        <Route path="/editor10_1" element={<Editor10_1 />} />
        <Route path="/creatorending" element={<CreatorEnding />} />
        <Route path="/customroom" element={<CustomRoom />} />
        {/* WebSocket/WebRTC가 필요한 모든 게임 관련 페이지들 */}
        <Route path="/*" element={<GameRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;