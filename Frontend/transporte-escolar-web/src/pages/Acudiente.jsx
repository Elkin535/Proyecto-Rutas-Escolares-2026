import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bus, LogOut, CheckCircle, Navigation, Clock, User, Heart,
  ToggleLeft, ToggleRight, MapPin, Phone, MessageSquare,
  ShieldCheck, AlertTriangle, RefreshCw, Calendar, Info, ChevronRight, Award
} from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as signalR from "@microsoft/signalr";
import "./Acudiente.css";

function Acudiente() {
  const navigate = useNavigate();
  const [usuarioData, setUsuarioData] = useState({});
  const [estudianteData, setEstudianteData] = useState(null);

  useEffect(() => {
    const fetchEstudiante = async (userId) => {
      try {
        const resAcu = await fetch("https://schooltrack.seminario1.eleueleo.com/api/Acudiente");
        const acudientes = await resAcu.json();
        const miAcudiente = acudientes.find(a => a.idUsuario === userId);

        if (miAcudiente) {
          const resEst = await fetch(`https://schooltrack.seminario1.eleueleo.com/api/Estudiante/acudiente/${miAcudiente.idAcudiente}`);
          const estudiantes = await resEst.json();
          if (estudiantes && estudiantes.length > 0) {
            setEstudianteData(estudiantes[0]); // Por ahora toma el primer hijo
          }
        }
      } catch (err) {
        console.error("Error fetching estudiante:", err);
      }
    };

    const userStr = localStorage.getItem("usuario");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setUsuarioData(userObj);
        if (userObj.idUsuario) {
          fetchEstudiante(userObj.idUsuario);
        }
      } catch (e) { }
    }
  }, []);

  const [hijoEstado, setHijoEstado] = useState("Pendiente");
  const [noViajaHoy, setNoViajaHoy] = useState(false);
  const [ubicacionBus, setUbicacionBus] = useState(null);
  const [alertaParada, setAlertaParada] = useState(false);
  const [alertaColegio, setAlertaColegio] = useState(false);

  const miParada = { lat: 4.7110, lng: -74.0721 };
  const colegio = { lat: 4.7450, lng: -74.0910 };
  const idViajeActivo = 123; // Mismo ID que usa el conductor para pruebas

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerBusRef = useRef(null);

  // Inicializar Mapa
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([4.7110, -74.0721], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstanceRef.current);

      // Parada y Colegio Markers
      L.circleMarker([miParada.lat, miParada.lng], { color: '#f59e0b', fillColor: '#fbbf24', fillOpacity: 0.8, radius: 9 })
        .addTo(mapInstanceRef.current)
        .bindPopup("<strong>Tu Parada</strong><br/>Recogida: ~07:10 AM");

      L.circleMarker([colegio.lat, colegio.lng], { color: '#8b5cf6', fillColor: '#a78bfa', fillOpacity: 0.8, radius: 9 })
        .addTo(mapInstanceRef.current)
        .bindPopup("<strong>Colegio Destino</strong><br/>Llegada aprox: 07:40 AM");

      const busIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
      markerBusRef.current = L.marker([4.7000, -74.0700], { icon: busIcon }).addTo(mapInstanceRef.current);

      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 250);
    }
  }, []);

  // Forzar invalidateSize cuando cambia el estado o pestaña para evitar huecos en blanco del mapa
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 250);
    }
  }, [hijoEstado, noViajaHoy]);

  // Haversine Distance Calculator
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (noViajaHoy) {
      setHijoEstado("NoViaja");
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5150/trackingHub")
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        console.log("Conectado a SignalR Hub");
        connection.invoke("SuscribirseAlViaje", idViajeActivo);
      })
      .catch(err => console.error("Error al conectar a SignalR:", err));

    connection.on("RecibirUbicacion", (data) => {
      const { latitud, longitud } = data;
      setUbicacionBus({ lat: latitud, lng: longitud });

      if (markerBusRef.current && mapInstanceRef.current) {
        markerBusRef.current.setLatLng([latitud, longitud]);
      }

      // Alerta Parada
      const distAParada = calcularDistancia(latitud, longitud, miParada.lat, miParada.lng);
      if (distAParada < 0.5) {
        setAlertaParada(true);
        if (distAParada < 0.05) setHijoEstado("Abordo");
      } else {
        setAlertaParada(false);
      }

      // Alerta Colegio
      const distAlColegio = calcularDistancia(latitud, longitud, colegio.lat, colegio.lng);
      if (distAlColegio < 0.5) {
        setAlertaColegio(true);
        if (distAlColegio < 0.05) setHijoEstado("Entregado");
      } else {
        setAlertaColegio(false);
      }
    });

    return () => {
      connection.stop();
    };
  }, [noViajaHoy]);

  const toggleNoViaja = () => {
    const nuevoEstado = !noViajaHoy;
    setNoViajaHoy(nuevoEstado);
    if (nuevoEstado) {
      setHijoEstado("NoViaja");
      setUbicacionBus(null);
    } else {
      setHijoEstado("Pendiente");
    }
  };

  const centrarEnBus = () => {
    if (mapInstanceRef.current && markerBusRef.current) {
      mapInstanceRef.current.flyTo(markerBusRef.current.getLatLng(), 15);
    }
  };

  const centrarEnParada = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([miParada.lat, miParada.lng], 15);
    }
  };

  const centrarEnColegio = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([colegio.lat, colegio.lng], 15);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    navigate("/login", { replace: true });
  };

  const getNombreAcudiente = () => {
    if (usuarioData?.nombre) return usuarioData.nombre;
    if (usuarioData?.Nombre) return usuarioData.Nombre;
    if (usuarioData?.correo) return usuarioData.correo.split('@')[0];
    return "Acudiente";
  };

  return (
    <div className="acudiente-container">
      {/* HEADER NAVBAR */}
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

      {/* MAIN CONTAINER */}
      <main className="acudiente-main">
        {/* BANNER BIENVENIDA */}
        <section className="welcome-banner">
          <div className="heart-icon-wrapper">
            <Heart size={24} fill="#ec4899" color="#ec4899" />
          </div>
          <div className="welcome-text-content">
            <h2>Hola, {getNombreAcudiente()}</h2>
            <p>Monitorea la seguridad y ubicación en tiempo real del transporte de tu familiar hoy.</p>
          </div>
          <div className="welcome-badge-date">
            <Calendar size={14} />
            <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
          </div>
        </section>

        {/* ALERTAS DINÁMICAS */}
        {alertaParada && hijoEstado === "Pendiente" && (
          <div className="dynamic-alert-banner alert-warning">
            <AlertTriangle size={20} />
            <span><strong>¡Atención!</strong> El transporte escolar está a menos de 500m de tu parada. Por favor sal a esperar a tu estudiante.</span>
          </div>
        )}
        {alertaColegio && hijoEstado === "Abordo" && (
          <div className="dynamic-alert-banner alert-info">
            <Navigation size={20} />
            <span><strong>¡Excelente!</strong> El bus se aproxima a la puerta del colegio destino.</span>
          </div>
        )}

        {/* DASHBOARD GRID 2 COLUMNAS */}
        <div className="acudiente-dashboard-grid">

          {/* COLUMNA IZQUIERDA: TARJETA ESTUDIANTE + TIMELINE + NOVEDADES + CONDUCTOR + HISTORIAL */}
          <div className="acudiente-left-column">

            {/* TARJETA PRINCIPAL DEL ESTUDIANTE */}
            <section className="hijo-card">
              <div className="hijo-header">
                <div className="hijo-profile">
                  <div className="hijo-avatar">
                    {estudianteData ? `${estudianteData.nombre.charAt(0)}${estudianteData.apellido.charAt(0)}`.toUpperCase() : <User size={24} />}
                  </div>
                  <div>
                    <h4>{estudianteData ? `${estudianteData.nombre} ${estudianteData.apellido}` : "Estudiante Asignado"}</h4>
                    <p>{estudianteData?.cursoGrado ? `Grado: ${estudianteData.cursoGrado}` : "Grado Asignado"} • {estudianteData?.colegio || "Colegio Destino"}</p>
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
                  <span>Hora Recogida: <strong>07:10 AM</strong></span>
                </div>
                <div className="detail-item">
                  <Bus size={16} />
                  <span>Ruta: <strong>Ruta 01 - Norte</strong></span>
                </div>
                <div className="detail-item">
                  <User size={16} />
                  <span>Conductor: <strong>Carlos Gómez</strong></span>
                </div>
              </div>
            </section>

            {/* TIMELINE DE PROGRESO DEL RECORRIDO */}
            {hijoEstado !== "NoViaja" && (
              <section className="journey-timeline-card">
                <div className="card-subtitle-wrapper">
                  <Navigation size={18} />
                  <h4>Progreso del Recorrido Hoy</h4>
                </div>
                <div className="timeline-steps-container">
                  <div className={`timeline-step ${hijoEstado === "Pendiente" ? "active" : "completed"}`}>
                    <div className="step-icon-circle">1</div>
                    <div className="step-info">
                      <span className="step-title">Esperando en Parada</span>
                      <span className="step-time">07:10 AM (Programado)</span>
                    </div>
                  </div>

                  <div className={`timeline-line ${(hijoEstado === "Abordo" || hijoEstado === "Entregado") ? "filled" : ""}`}></div>

                  <div className={`timeline-step ${hijoEstado === "Abordo" ? "active" : hijoEstado === "Entregado" ? "completed" : "pending"}`}>
                    <div className="step-icon-circle">2</div>
                    <div className="step-info">
                      <span className="step-title">Abordó la Ruta Escolar</span>
                      <span className="step-time">{hijoEstado === "Abordo" || hijoEstado === "Entregado" ? "07:14 AM" : "Pendiente"}</span>
                    </div>
                  </div>

                  <div className={`timeline-line ${hijoEstado === "Entregado" ? "filled" : ""}`}></div>

                  <div className={`timeline-step ${hijoEstado === "Entregado" ? "completed" : "pending"}`}>
                    <div className="step-icon-circle">3</div>
                    <div className="step-info">
                      <span className="step-title">Entregado en Colegio</span>
                      <span className="step-time">{hijoEstado === "Entregado" ? "07:38 AM" : "Pendiente"}</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* REPORTE DE INASISTENCIA NOVEDAD */}
            <section className="report-novedad-wrapper">
              <div className="novedad-text">
                <h5>¿Tu familiar no asistirá al colegio hoy?</h5>
                <p>Notifícale al conductor en un clic para optimizar la parada y la ruta.</p>
              </div>
              <button className={`toggle-novedad-btn ${noViajaHoy ? "active" : ""}`} onClick={toggleNoViaja}>
                {noViajaHoy ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
                <span>{noViajaHoy ? "Inasistencia Reportada" : "Viajará Normal"}</span>
              </button>
            </section>

            {/* DATOS DEL CONDUCTOR Y VEHÍCULO */}
            <section className="driver-contact-card">
              <div className="card-subtitle-wrapper">
                <Bus size={18} />
                <h4>Información de Conductor y Vehículo</h4>
              </div>
              <div className="driver-body">
                <div className="driver-avatar-box">
                  <User size={28} />
                </div>
                <div className="driver-details-text">
                  <h5>Carlos Gómez</h5>
                  <p>Licencia: <strong>C2 Vigente</strong> • Tel: <strong>+57 300 987 6543</strong></p>
                  <p>Vehículo: <strong>Mercedes-Benz Sprinter</strong> (Placa: <span className="plate-tag">TOW-345</span>)</p>
                </div>
              </div>
              <div className="driver-actions-row">
                <a href="tel:+573009876543" className="contact-action-btn phone">
                  <Phone size={15} />
                  <span>Llamar Conductor</span>
                </a>
                <a href="https://wa.me/573009876543?text=Hola,%20soy%20el%20acudiente%20de%20la%20ruta" target="_blank" rel="noreferrer" className="contact-action-btn whatsapp">
                  <MessageSquare size={15} />
                  <span>Escribir Mensaje</span>
                </a>
              </div>
            </section>

            {/* HISTORIAL RECIENTE DE RECORRIDOS */}
            <section className="activity-history-card">
              <div className="card-subtitle-wrapper">
                <Clock size={18} />
                <h4>Registro Reciente de Rutas</h4>
              </div>
              <div className="history-list">
                <div className="history-item">
                  <div className="history-dot green"></div>
                  <div className="history-text">
                    <span className="history-event">Llegada al colegio confirmada</span>
                    <span className="history-date">Ayer • 07:36 AM</span>
                  </div>
                  <span className="history-status green">Completado</span>
                </div>
                <div className="history-item">
                  <div className="history-dot green"></div>
                  <div className="history-text">
                    <span className="history-event">Recogido en parada habitual</span>
                    <span className="history-date">Ayer • 07:12 AM</span>
                  </div>
                  <span className="history-status green">Abordó</span>
                </div>
                <div className="history-item">
                  <div className="history-dot blue"></div>
                  <div className="history-text">
                    <span className="history-event">Entrega en casa finalizada</span>
                    <span className="history-date">18 Jul • 03:45 PM</span>
                  </div>
                  <span className="history-status blue">Entregado</span>
                </div>
              </div>
            </section>

          </div>

          {/* COLUMNA DERECHA: MAPA EN TIEMPO REAL + BOTONES DE ACCIÓN + AVISOS */}
          <div className="acudiente-right-column">

            {/* MAPA RECORRIDO EN TIEMPO REAL */}
            {hijoEstado !== "NoViaja" ? (
              <section className="realtime-map-card">
                <div className="map-card-header">
                  <div className="map-title-pulse">
                    <span className="pulse-dot"></span>
                    <h4>Ubicación de la Ruta en Tiempo Real</h4>
                  </div>
                  <span className="map-route-name">Bus TOW-345</span>
                </div>

                <div className="map-quick-actions">
                  <button className="map-btn" onClick={centrarEnParada}>
                    <MapPin size={14} color="#f59e0b" />
                    <span>Mi Parada</span>
                  </button>
                  <button className="map-btn primary" onClick={centrarEnBus}>
                    <Bus size={14} />
                    <span>Centrar Bus</span>
                  </button>
                  <button className="map-btn" onClick={centrarEnColegio}>
                    <Navigation size={14} color="#8b5cf6" />
                    <span>Colegio</span>
                  </button>
                </div>

                <div ref={mapRef} className="acudiente-map-canvas"></div>

                <div className="map-footer-stats">
                  <div className="stat-pill">
                    <span className="stat-label">Distancia Aprox:</span>
                    <span className="stat-val">1.2 km</span>
                  </div>
                  <div className="stat-pill">
                    <span className="stat-label">Tiempo Estimado:</span>
                    <span className="stat-val">5 - 8 mins</span>
                  </div>
                  <div className="stat-pill live">
                    <span className="live-dot"></span>
                    <span>Señal GPS Activa</span>
                  </div>
                </div>
              </section>
            ) : (
              <section className="no-travel-card">
                <div className="no-travel-content">
                  <Info size={40} color="#94a3b8" />
                  <h4>Inasistencia Registrada Para Hoy</h4>
                  <p>Has marcado que tu familiar no utilizará la ruta escolar el día de hoy. El monitoreo en vivo se mantendrá desactivado hasta el próximo ciclo.</p>
                  <button className="reactivate-btn" onClick={toggleNoViaja}>
                    <RefreshCw size={16} />
                    <span>Reactivar Recorrido Hoy</span>
                  </button>
                </div>
              </section>
            )}

            {/* AVISOS Y SEGURIDAD */}
            <section className="safety-info-card">
              <div className="card-subtitle-wrapper">
                <ShieldCheck size={18} color="#10b981" />
                <h4>Garantía de Seguridad SchoolTrack</h4>
              </div>
              <div className="safety-body">
                <p>Todas las unidades cuentan con rastreo Satelital GPS continuo, velocidad monitoreada por la central del colegio y validación de abordaje digital.</p>
                <div className="safety-bullets">
                  <div className="bullet-item">
                    <CheckCircle size={14} color="#10b981" />
                    <span>Notificaciones automáticas al teléfono</span>
                  </div>
                  <div className="bullet-item">
                    <CheckCircle size={14} color="#10b981" />
                    <span>Conductor con licencia y certificación vigente</span>
                  </div>
                  <div className="bullet-item">
                    <CheckCircle size={14} color="#10b981" />
                    <span>Monitoreo 24/7 de paradas autorizadas</span>
                  </div>
                </div>
              </div>
            </section>

          </div>

        </div>
      </main>

      {/* FOOTER ELEGANTE */}
      <footer className="acudiente-footer">
        <p>© 2026 SchoolTrack — Plataforma Integrada de Transporte Escolar Seguro</p>
      </footer>
    </div>
  );
}

export default Acudiente;

