import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Componentcheck from "../pages/Componentcheck";
import Signup01 from '../pages/Signup01';
import Signup02 from '../pages/Signup02';
import SelectRoom from '../pages/SelectRoom';
function Router() {
   return (
     <BrowserRouter>
      <Routes>
      <Route path="/" element={<Login/>} />
      <Route path = "/componentcheck" element={<Componentcheck/>} />
      <Route path="/signup01" element={<Signup01 />} />
      <Route path="/signup02" element={<Signup02 />} />
      <Route path="/selectroom" element={<SelectRoom />} />
       </Routes>
    </BrowserRouter>
  );
}

export default Router;