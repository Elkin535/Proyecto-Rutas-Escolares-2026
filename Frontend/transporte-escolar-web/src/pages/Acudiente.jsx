import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bus, LogOut, CheckCircle, Navigation, Clock, User, Heart, ToggleLeft, ToggleRight, MapPin } from "lucide-react";
import "./Acudiente.css";

function Acudiente() {
  const navigate = useNavigate();
  
  // Estado del hijo
  const [hijoEstado, setHijoEstado] = useState("Pendiente"); // Pendiente, Abordo, Entregado, NoViaja
  const [noViajaHoy, setNoViajaHoy] = useState(false);
  const [busProgreso, setBusProgreso] = useState(10); // Progreso de 0 a 100 en la ruta

  // Efecto para simular el movimiento del bus en tiempo real
  useEffect(() => {
    if (noViajaHoy) {
      setHijoEstado("NoViaja");
      return;
    }

    const interval = setInterval(() => {
      setBusProgreso((prev) => {
        const next = prev + 5;
        if (next >= 100) {
          // Cuando llega al final (Colegio)
          setHijoEstado("Entregado");
          return 100;
        }
        if (next >= 50 && next < 90) {
          // A mitad de camino se asume que abordó
          setHijoEstado("Abordo");
        }
        return next;
      });
    }, 4000); // Avanza cada 4 segundos

    return () => clearInterval(interval);
  }, [noViajaHoy]);

  const toggleNoViaja = () => {
    const nuevoEstado = !noViajaHoy;
    setNoViajaHoy(nuevoEstado);
    if (nuevoEstado) {
      setHijoEstado("NoViaja");
      setBusProgreso(0);
    } else {
      setHijoEstado("Pendiente");
      setBusProgreso(10);
    }
  };

  const cerrarSesion = () => {
    navigate("/login");
  };

  return (
    <div className="acudiente-container">
      {/* HEADER */}
      <header className="acudiente-header">
        <div className="header-brand">
          <Bus size={24} />
          <span>SchoolTrack Padres</span>
        </div>
        <button className="acudiente-logout" onClick={cerrarSesion}>
          <LogOut size={18} />
          <span>Salir</span>
        </button>
      </header>

      {/* PORTAL BODY */}
      <main className="acudiente-main">
        {/* Header de bienvenida */}
        <section className="welcome-banner">
          <div className="heart-icon-wrapper">
            <Heart size={24} fill="#ec4899" color="#ec4899" />
          </div>
          <div>
            <h2>Hola, María García</h2>
            <p>Monitorea la seguridad del transporte escolar de tus hijos hoy.</p>
          </div>
        </section>

        {/* Tarjeta del Hijo */}
        <section className="hijo-card">
          <div className="hijo-header">
            <div className="hijo-profile">
              <div className="hijo-avatar">SG</div>
              <div>
                <h4>Sofía García</h4>
                <p>Grado: 4° Primaria - Colegio Distrital A</p>
              </div>
            </div>
            <span className={`status-badge-parent ${hijoEstado}`}>
              {hijoEstado === "Pendiente" && "🟡 Esperando bus"}
              {hijoEstado === "Abordo" && "🟠 En el bus"}
              {hijoEstado === "Entregado" && "🟢 Entregado"}
              {hijoEstado === "NoViaja" && "⚪ No viaja hoy"}
            </span>
          </div>

          <div className="hijo-details-grid">
            <div className="detail-item">
              <Clock size={16} />
              <span>Hora Recogida Aprox: <strong>07:10 AM</strong></span>
            </div>
            <div className="detail-item">
              <Bus size={16} />
              <span>Ruta Asignada: <strong>Ruta 01 - Norte</strong></span>
            </div>
            <div className="detail-item">
              <User size={16} />
              <span>Conductor: <strong>Carlos Gómez (312-456-7890)</strong></span>
            </div>
          </div>

          {/* Reporte de novedad */}
          <div className="report-novedad-wrapper">
            <div className="novedad-text">
              <h5>¿Tu hija no asistirá al colegio hoy?</h5>
              <p>Avísale al conductor para que no espere en tu parada.</p>
            </div>
            <button className={`toggle-novedad-btn ${noViajaHoy ? "active" : ""}`} onClick={toggleNoViaja}>
              {noViajaHoy ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
              <span>{noViajaHoy ? "Reportado" : "Viajará Normal"}</span>
            </button>
          </div>
        </section>

        {/* SIMULADOR DE MAPA EN TIEMPO REAL */}
        {hijoEstado !== "NoViaja" && (
          <section className="realtime-map-card">
            <div className="map-card-header">
              <div className="map-title-pulse">
                <span className="pulse-dot"></span>
                <h4>Ubicación de la Ruta en Tiempo Real</h4>
              </div>
              <span className="map-route-name">Bus TOW-345</span>
            </div>

            {/* Simulación Gráfica del Mapa */}
            <div className="map-simulation-canvas">
              {/* Línea de la ruta */}
              <div className="map-road-line">
                {/* Indicador de Progreso del Bus */}
                <div 
                  className="bus-marker-container" 
                  style={{ left: `${busProgreso}%` }}
                >
                  <Bus size={28} className="bus-marker-icon" />
                  <span className="bus-plate-tag">TOW-345</span>
                </div>

                {/* Paradas en el camino */}
                <div className="map-stop start-point" style={{ left: "0%" }}>
                  <MapPin size={18} className="stop-icon" />
                  <span className="stop-label">Paradero Inicial</span>
                </div>
                
                <div className={`map-stop student-point ${busProgreso >= 50 ? "visited" : ""}`} style={{ left: "50%" }}>
                  <MapPin size={18} className="stop-icon" />
                  <span className="stop-label">Tu Parada (Sofía)</span>
                </div>

                <div className={`map-stop end-point ${busProgreso >= 100 ? "visited" : ""}`} style={{ left: "100%" }}>
                  <CheckCircle size={18} className="stop-icon" />
                  <span className="stop-label">Colegio</span>
                </div>
              </div>
            </div>

            <div className="map-legend">
              <p>
                {busProgreso === 100 
                  ? "El recorrido ha finalizado. El bus se encuentra en el Colegio." 
                  : busProgreso >= 50 
                    ? "El bus ya recogió a Sofía y se dirige hacia el Colegio." 
                    : "El bus está en camino hacia tu parada."}
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Acudiente;
