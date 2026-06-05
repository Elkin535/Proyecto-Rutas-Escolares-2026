import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bus, User, LogOut, Check, X, Navigation, Award, AlertCircle } from "lucide-react";
import "./Conductor.css";

function Conductor() {
  const navigate = useNavigate();
  const [viajeActivo, setViajeActivo] = useState(false);
  const [recorridoCompletado, setRecorridoCompletado] = useState(false);

  const [estudiantes, setEstudiantes] = useState([
    { id: 1, nombre: "Sofía García", parada: "Calle 100 con Cra 15", estado: "Pendiente", hora: "" },
    { id: 2, nombre: "Mateo Ríos", parada: "Av. Suba con Calle 127", estado: "Pendiente", hora: "" },
    { id: 3, nombre: "Juan López", parada: "Autopista Norte con Calle 170", estado: "Pendiente", hora: "" },
    { id: 4, nombre: "Camila Sánchez", parada: "Calle 183 con Cra 7", estado: "Pendiente", hora: "" }
  ]);

  const iniciarRecorrido = () => {
    setViajeActivo(true);
    setRecorridoCompletado(false);
    // Resetear estados al iniciar
    setEstudiantes(estudiantes.map(e => ({ ...e, estado: "Pendiente", hora: "" })));
  };

  const finalizarRecorrido = () => {
    setViajeActivo(false);
    setRecorridoCompletado(true);
  };

  const marcarAsistencia = (id, nuevoEstado) => {
    const ahora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEstudiantes(estudiantes.map(e => {
      if (e.id === id) {
        return { 
          ...e, 
          estado: nuevoEstado, 
          hora: nuevoEstado === "Pendiente" ? "" : ahora 
        };
      }
      return e;
    }));
  };

  const cerrarSesion = () => {
    navigate("/login");
  };

  return (
    <div className="conductor-container">
      {/* HEADER */}
      <header className="conductor-header">
        <div className="header-brand">
          <Bus size={24} />
          <span>SchoolTrack Conductor</span>
        </div>
        <button className="conductor-logout" onClick={cerrarSesion}>
          <LogOut size={18} />
          <span>Salir</span>
        </button>
      </header>

      {/* PORTAL BODY */}
      <main className="conductor-main">
        {/* Perfil del Conductor / Info Vehículo */}
        <section className="conductor-profile-card">
          <div className="driver-avatar-circle">
            <User size={32} />
          </div>
          <div className="driver-meta">
            <h3>Carlos Gómez</h3>
            <p className="license-info">Licencia: C2 - Placa: <strong>TOW-345</strong></p>
            <p className="route-info">Ruta Asignada: <span>Ruta 01 - Norte</span></p>
          </div>
        </section>

        {/* Controles de Viaje */}
        <section className="route-control-panel">
          {!viajeActivo ? (
            <div className="start-panel">
              {recorridoCompletado && (
                <div className="success-recorrido-alert">
                  <Award size={24} />
                  <span>¡Último recorrido finalizado con éxito hoy!</span>
                </div>
              )}
              <p>¿Listo para comenzar el recorrido escolar matutino?</p>
              <button className="btn-iniciar-viaje" onClick={iniciarRecorrido}>
                <Navigation size={20} />
                <span>Iniciar Recorrido</span>
              </button>
            </div>
          ) : (
            <div className="active-panel">
              <div className="active-badge-pulse">
                <span className="pulse-dot"></span>
                <span>Recorrido en progreso...</span>
              </div>
              <button className="btn-finalizar-viaje" onClick={finalizarRecorrido}>
                <span>Finalizar Recorrido</span>
              </button>
            </div>
          )}
        </section>

        {/* Listado de Estudiantes a recoger */}
        {viajeActivo && (
          <section className="students-attendance-section">
            <div className="section-title-wrapper">
              <ClipboardList size={20} />
              <h4>Pasajeros de la Ruta</h4>
            </div>

            <div className="attendance-list">
              {estudiantes.map(est => (
                <div className={`student-attendance-card ${est.estado}`} key={est.id}>
                  <div className="student-details">
                    <span className="student-name">{est.nombre}</span>
                    <span className="student-stop">{est.parada}</span>
                    {est.hora && <span className="student-time-stamp">Registro: {est.hora}</span>}
                  </div>

                  <div className="attendance-actions">
                    {est.estado === "Pendiente" ? (
                      <>
                        <button 
                          className="action-btn absent" 
                          onClick={() => marcarAsistencia(est.id, "Ausente")}
                          title="Reportar Ausente"
                        >
                          <X size={18} />
                        </button>
                        <button 
                          className="action-btn board" 
                          onClick={() => marcarAsistencia(est.id, "Abordó")}
                          title="Marcar Abordó"
                        >
                          <Check size={18} />
                        </button>
                      </>
                    ) : est.estado === "Abordó" ? (
                      <div className="boarded-actions">
                        <span className="badge onboard">A Bordo</span>
                        <button 
                          className="action-btn deliver"
                          onClick={() => marcarAsistencia(est.id, "Entregado")}
                        >
                          <span>Entregar</span>
                        </button>
                      </div>
                    ) : est.estado === "Entregado" ? (
                      <div className="completed-state">
                        <span className="badge delivered">Entregado</span>
                        <button className="reset-state-btn" onClick={() => marcarAsistencia(est.id, "Pendiente")}>
                          Corregir
                        </button>
                      </div>
                    ) : (
                      <div className="completed-state">
                        <span className="badge no-travel">No Viajó</span>
                        <button className="reset-state-btn" onClick={() => marcarAsistencia(est.id, "Pendiente")}>
                          Corregir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!viajeActivo && !recorridoCompletado && (
          <div className="no-active-trip-msg">
            <AlertCircle size={32} />
            <p>No tienes ningún recorrido activo en este momento. Presiona "Iniciar Recorrido" cuando salgas del paradero.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Conductor;
