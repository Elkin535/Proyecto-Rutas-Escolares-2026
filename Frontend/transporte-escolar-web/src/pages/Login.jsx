import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowLeft, CheckCircle, KeyRound, Bus } from "lucide-react";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [correoRecuperacion, setCorreoRecuperacion] = useState("");
  const [mensajeRecuperacion, setMensajeRecuperacion] = useState("");
  const [error, setError] = useState("");

  const iniciarSesion = (e) => {
    e.preventDefault();
    if (!usuario.trim() || !contrasena.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }

    setError("");
    const userLower = usuario.toLowerCase();

    // Redirección simulada por nombre de usuario o selección
    if (userLower.includes("admin")) {
      navigate("/admin");
    } else if (userLower.includes("cond") || userLower.includes("chofer") || userLower.includes("driver")) {
      navigate("/conductor");
    } else if (userLower.includes("acu") || userLower.includes("padre") || userLower.includes("madre")) {
      navigate("/acudiente");
    } else {
      // Por defecto si no coincide ninguno especial, asume admin para pruebas generales
      navigate("/admin");
    }
  };

  const enviarRecuperacion = (e) => {
    e.preventDefault();
    if (!correoRecuperacion.trim()) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }
    setError("");
    setMensajeRecuperacion("¡Código de recuperación enviado! Revisa tu bandeja de entrada en unos minutos.");
    setCorreoRecuperacion("");
  };

  const autoCompletar = (rol) => {
    setError("");
    setMensajeRecuperacion("");
    if (rol === "admin") {
      setUsuario("admin@schooltrack.com");
      setContrasena("••••••••");
    } else if (rol === "conductor") {
      setUsuario("conductor.carlos@schooltrack.com");
      setContrasena("••••••••");
    } else if (rol === "acudiente") {
      setUsuario("acudiente.maria@schooltrack.com");
      setContrasena("••••••••");
    }
  };

  return (
    <div className="login-container">
      {/* Botón Volver a Home */}
      <button className="back-home-btn" onClick={() => navigate("/")}>
        <ArrowLeft size={18} />
        <span>Inicio</span>
      </button>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Bus size={32} />
            <span>SchoolTrack</span>
          </div>
          <p className="login-subtitle">
            {modoRecuperar 
              ? "Recupera el acceso a tu cuenta de transporte" 
              : "Monitoreo y gestión escolar en tiempo real"}
          </p>
        </div>

        {error && <div className="login-error">{error}</div>}

        {!modoRecuperar ? (
          <form className="login-form" onSubmit={iniciarSesion}>
            <div className="input-group">
              <label htmlFor="usuario">Usuario o Correo</label>
              <div className="input-wrapper">
                <User size={20} className="input-icon" />
                <input
                  type="text"
                  id="usuario"
                  placeholder="ej. admin@schooltrack.com"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="contrasena">Contraseña</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type="password"
                  id="contrasena"
                  placeholder="••••••••"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
              </div>
            </div>

            <div className="login-options">
              <button 
                type="button" 
                className="forgot-password-link"
                onClick={() => {
                  setModoRecuperar(true);
                  setError("");
                  setMensajeRecuperacion("");
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button type="submit" className="login-submit-btn">
              Iniciar Sesión
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={enviarRecuperacion}>
            {mensajeRecuperacion ? (
              <div className="recovery-success">
                <CheckCircle size={40} className="success-icon" />
                <p>{mensajeRecuperacion}</p>
                <button
                  type="button"
                  className="login-submit-btn secondary"
                  onClick={() => setModoRecuperar(false)}
                >
                  Volver al Login
                </button>
              </div>
            ) : (
              <>
                <div className="input-group">
                  <label htmlFor="correoRecup">Correo Electrónico</label>
                  <div className="input-wrapper">
                    <Mail size={20} className="input-icon" />
                    <input
                      type="email"
                      id="correoRecup"
                      placeholder="correo@ejemplo.com"
                      value={correoRecuperacion}
                      onChange={(e) => setCorreoRecuperacion(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="login-submit-btn">
                  Enviar Código de Recuperación
                </button>

                <button
                  type="button"
                  className="back-to-login-btn"
                  onClick={() => {
                    setModoRecuperar(false);
                    setError("");
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Volver al inicio de sesión</span>
                </button>
              </>
            )}
          </form>
        )}

        {/* ACCESO DEMO RÁPIDO */}
        {!mensajeRecuperacion && (
          <div className="demo-panel">
            <span className="demo-title">Acceso Rápido de Prueba (Demo):</span>
            <div className="demo-buttons">
              <button onClick={() => autoCompletar("admin")} className="demo-pill admin">
                Admin
              </button>
              <button onClick={() => autoCompletar("conductor")} className="demo-pill conductor">
                Conductor
              </button>
              <button onClick={() => autoCompletar("acudiente")} className="demo-pill acudiente">
                Acudiente
              </button>
            </div>
            {!modoRecuperar && (
              <p className="demo-hint">
                Presiona cualquier perfil para cargar credenciales de prueba, luego pulsa "Iniciar Sesión".
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;