import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const iniciarSesion = () => {
    navigate("/admin");
  };

  return (
    <div className="container">
      <div className="left-panel">
        <img
          src="https://images.unsplash.com/photo-1509062522246-3755977927d7"
          alt="Transporte Escolar"
        />
      </div>

      <div className="right-panel">
        <div className="login-box">
          <h1>Rutas Escolares</h1>

          <input type="text" placeholder="Usuario" />

          <input type="password" placeholder="Contraseña" />

          <button onClick={iniciarSesion}>
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;