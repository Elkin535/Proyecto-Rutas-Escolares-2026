import React from "react";
import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Admin from "./pages/Admin";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/admin"
          element={<Admin />}
        />
      </Routes>

    </BrowserRouter>
  </React.StrictMode>
);