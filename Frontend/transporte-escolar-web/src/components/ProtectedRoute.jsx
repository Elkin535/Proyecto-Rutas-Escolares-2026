import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const usuarioString = localStorage.getItem("usuario");
  
  if (!usuarioString) {
    // Si no hay información de usuario, redirigir al login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    try {
      const usuario = JSON.parse(usuarioString);
      const userRole = (usuario.nombreRol || "").toLowerCase();
      
      // Verificar si el rol del usuario está dentro de los roles permitidos para esta ruta
      const hasAccess = allowedRoles.some(role => userRole.includes(role.toLowerCase()));
      
      if (!hasAccess) {
        // Si no tiene el rol adecuado, redirigirlo (en este caso lo mandamos al login para seguridad)
        return <Navigate to="/login" replace />;
      }
    } catch (e) {
      // Si el JSON en localStorage está corrupto
      localStorage.removeItem("usuario");
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
