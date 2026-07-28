import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const usuarioString = localStorage.getItem("usuario");
  const token = localStorage.getItem("token");
  
  if (!usuarioString || !token) {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    try {
      const usuario = JSON.parse(usuarioString);
      const userRole = (usuario.nombreRol || "").toLowerCase();
      
      const hasAccess = allowedRoles.some(role => userRole.includes(role.toLowerCase()));
      
      if (!hasAccess) {
        return <Navigate to="/403" replace />;
      }
    } catch (e) {
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
