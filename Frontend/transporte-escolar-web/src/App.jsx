import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Conductor from "./pages/Conductor";
import Acudiente from "./pages/Acudiente";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/conductor" element={<Conductor />} />
        <Route path="/acudiente" element={<Acudiente />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;