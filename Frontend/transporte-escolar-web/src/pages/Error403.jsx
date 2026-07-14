import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import "./Error403.css";

function Error403() {
  const navigate = useNavigate();

  return (
    <div className="error-container">
      <div className="error-card">
        <ShieldAlert size={80} className="error-icon" />
        <h1 className="error-title">403</h1>
        <h2 className="error-subtitle">Acceso Denegado</h2>
        <p className="error-text">
          Lo sentimos, no tienes los permisos necesarios para acceder a esta sección.
        </p>
        <button className="error-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Volver atrás</span>
        </button>
      </div>
    </div>
  );
}

export default Error403;
