import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login161 from '../pages/Login161';
import Componentcheck from "../pages/Componentcheck";
 function Router() {
   return (
     <BrowserRouter>
      <Routes>
      <Route path="/" element={<Login161/>} />
       <Route path = "/componentcheck" element={<Componentcheck/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;