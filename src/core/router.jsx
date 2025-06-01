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
import Game01 from '../pages/game01';
import Game02 from "../pages/Game02";
import Game03 from '../pages/Game03';
import Game04 from "../pages/Game04";
import Game05 from '../pages/Game05';
import Game06 from '../pages/Game06';
import CD1 from "../pages/CD1";
import CD2 from "../pages/CD2";
import CD3 from "../pages/CD3";

function Router() {
   return (
     <BrowserRouter>
      <Routes>
      <Route path="/" element={<Login/>} />
      <Route path = "/componentcheck" element={<Componentcheck/>} />
      <Route path="/signup01" element={<Signup01 />} />
      <Route path="/signup02" element={<Signup02 />} />
      <Route path="/selectroom" element={<SelectRoom />} />
      <Route path="/waitingroom" element={<WaitingRoom />} />
      <Route path="/gameintro" element={<GameIntro />} />
      <Route path="/gameintro2" element={<GameIntro2 />} />
      <Route path="/selecthomemate" element={<SelectHomeMate />} />
      <Route path="/matename" element={<MateName />} />
      <Route path="/game01" element={<Game01 />} />
      <Route path="/game02" element={<Game02 />} />
      <Route path="/game03" element={<Game03 />} />
      <Route path="/game04" element={<Game04 />} />
      <Route path="/game05" element={<Game05 />} />
      <Route path="/game06" element={<Game06 />} />
      <Route path="/character_description1" element={<CD1 />} />
      <Route path="/character_description2" element={<CD2 />} />
      <Route path="/character_description3" element={<CD3 />} />

      </Routes>
    </BrowserRouter>
  );
}

export default Router;