import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Conductor from "./pages/Conductor";
import Acudiente from "./pages/Acudiente";
import Error403 from "./pages/Error403";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/403" element={<Error403 />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin", "administrador"]}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conductor"
          element={
            <ProtectedRoute allowedRoles={["cond", "chofer", "driver", "conductor"]}>
              <Conductor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/acudiente"
          element={
            <ProtectedRoute allowedRoles={["acu", "padre", "madre", "acudiente"]}>
              <Acudiente />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;