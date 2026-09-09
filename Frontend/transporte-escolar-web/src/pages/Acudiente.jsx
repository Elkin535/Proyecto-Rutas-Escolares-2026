import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bus, LogOut, CheckCircle, Navigation, Clock, User, Heart,
  ToggleLeft, ToggleRight, MapPin, Phone, MessageSquare,
  ShieldCheck, AlertTriangle, RefreshCw, Calendar, Info
} from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as signalR from "@microsoft/signalr";
import { fetchAuth, getApiBaseUrl } from "../services/api";
import "./Acudiente.css";

function Acudiente() {
  const navigate = useNavigate();
  const [usuarioData, setUsuarioData] = useState({});
  const [estudiantesData, setEstudiantesData] = useState([]);
  const [paradaEstudiante, setParadaEstudiante] = useState(null);
  const [rutaInfo, setRutaInfo] = useState(null);
  const [conductorInfo, setConductorInfo] = useState(null);
  const [vehiculoInfo, setVehiculoInfo] = useState(null);
  const [viajeActivo, setViajeActivo] = useState(null);

  const [hijoEstado, setHijoEstado] = useState("Pendiente");
  const [noViajaHoy, setNoViajaHoy] = useState(false);
  const [ubicacionBus, setUbicacionBus] = useState(null);
  const [alertaParada, setAlertaParada] = useState(false);
  const [alertaColegio, setAlertaColegio] = useState(false);
  const [distanciaEstimada, setDistanciaEstimada] = useState(null);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerBusRef = useRef(null);
  const markerParadaRef = useRef(null);

  // Haversine Distance Calculator en kilómetros
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

  // Carga inicial de datos reales
  useEffect(() => {
    const cargarDatosAcudiente = async () => {
      const userStr = localStorage.getItem("usuario");
      if (!userStr) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const userObj = JSON.parse(userStr);
        setUsuarioData(userObj);

        // 1. Obtener acudiente de la BD
        const resAcu = await fetchAuth("Acudiente/obtener-todos");
        if (!resAcu.ok) return;
        const acudientes = await resAcu.json();
        const miAcudiente = acudientes.find(a => a.idUsuario === userObj.idUsuario) || acudientes[0];

        if (!miAcudiente) return;

        // 2. Obtener estudiantes del acudiente
        const resEst = await fetchAuth(`Estudiante/obtener-por-acudiente?idAcudiente=${miAcudiente.idAcudiente}`);
        let estudiantes = [];
        if (resEst.ok) {
          estudiantes = await resEst.json();
          setEstudiantesData(estudiantes);
        }

        const primerEst = estudiantes && estudiantes.length > 0 ? estudiantes[0] : null;

        // 3. Parada del estudiante
        if (primerEst?.idParada) {
          const resParada = await fetchAuth(`Parada/obtener-por-id?id=${primerEst.idParada}`);
          if (resParada.ok) {
            const parada = await resParada.json();
            setParadaEstudiante(parada);
          }
        } else if (primerEst?.idRuta) {
          // Si no tiene parada específica pero tiene ruta, consultar primera parada de la ruta
          const resParadas = await fetchAuth(`Parada/obtener-por-ruta?idRuta=${primerEst.idRuta}`);
          if (resParadas.ok) {
            const paradas = await resParadas.json();
            if (paradas && paradas.length > 0) {
              setParadaEstudiante(paradas[0]);
            }
          }
        }

        // 4. Ruta y Conductor asignado
        if (primerEst?.idRuta) {
          const resRuta = await fetchAuth(`Ruta/obtener-por-id?id=${primerEst.idRuta}`);
          if (resRuta.ok) {
            const ruta = await resRuta.json();
            setRutaInfo(ruta);
          }
        }

        // Obtener conductores y usuarios para datos de contacto reales
        const [resCond, resUsr, resVeh] = await Promise.all([
          fetchAuth("Conductor/obtener-todos"),
          fetchAuth("Usuario/obtener-todos"),
          fetchAuth("Vehiculo/obtener-todos")
        ]);

        let conductores = resCond.ok ? await resCond.json() : [];
        let usuarios = resUsr.ok ? await resUsr.json() : [];
        let vehiculos = resVeh.ok ? await resVeh.json() : [];

        if (conductores.length > 0) {
          const cond = conductores[0];
          const usr = usuarios.find(u => u.idUsuario === cond.idUsuario) || {};
          const veh = vehiculos.find(v => v.idVehiculo === cond.idVehiculo) || vehiculos[0];

          setConductorInfo({
            nombre: usr.nombre ? `${usr.nombre} ${usr.apellido || ""}`.trim() : "Conductor Asignado",
            telefono: usr.telefono || "+57 300 000 0000",
            licencia: cond.numeroLicencia || "Vigente",
            categoria: cond.categoriaLicencia || "C2"
          });

          if (veh) {
            setVehiculoInfo(veh);
          }
        }

        // 5. Consultar viaje activo en la flota
        const resHist = await fetchAuth("Historial/obtener-todos");
        if (resHist.ok) {
          const historial = await resHist.json();
          const viajeEnCurso = historial.find(h => h.estadoViaje === "En progreso");
          if (viajeEnCurso) {
            setViajeActivo(viajeEnCurso);
            if (viajeEnCurso.latitudActual && viajeEnCurso.longitudActual) {
              setUbicacionBus({
                lat: viajeEnCurso.latitudActual,
                lng: viajeEnCurso.longitudActual
              });
            }
          }
        }
      } catch (err) {
        console.error("Error al cargar datos del acudiente:", err);
      }
    };

    cargarDatosAcudiente();
  }, [navigate]);

  // Inicializar Mapa Leaflet
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Inicializar mapa centrado
    const initialCoords = paradaEstudiante
      ? [paradaEstudiante.latitud, paradaEstudiante.longitud]
      : [4.7110, -74.0721];

    const map = L.map(mapRef.current).setView(initialCoords, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Intentar geolocalizar al acudiente si no hay parada aún
    if (!paradaEstudiante && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 14);
        },
        (err) => console.log("Geolocalización del acudiente:", err.message),
        { timeout: 6000 }
      );
    }

    mapInstanceRef.current = map;
    setTimeout(() => map.invalidateSize(), 250);
  }, [paradaEstudiante]);

  // Actualizar marcador de la parada del estudiante cuando se cargue
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !paradaEstudiante) return;

    if (markerParadaRef.current) {
      markerParadaRef.current.remove();
    }

    markerParadaRef.current = L.circleMarker([paradaEstudiante.latitud, paradaEstudiante.longitud], {
      color: '#f59e0b',
      fillColor: '#fbbf24',
      fillOpacity: 0.9,
      radius: 10
    })
      .addTo(map)
      .bindPopup(`<strong>Tu Parada Asignada</strong><br/>${paradaEstudiante.nombreParada}`);

    map.panTo([paradaEstudiante.latitud, paradaEstudiante.longitud]);
  }, [paradaEstudiante]);

  // Sincronizar marcador del autobús cuando se actualice ubicacionBus
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !ubicacionBus) return;

    const busIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    if (!markerBusRef.current) {
      markerBusRef.current = L.marker([ubicacionBus.lat, ubicacionBus.lng], { icon: busIcon }).addTo(map);
    } else {
      markerBusRef.current.setLatLng([ubicacionBus.lat, ubicacionBus.lng]);
    }
  }, [ubicacionBus]);

  // Conexión en tiempo real con SignalR para el viaje activo
  useEffect(() => {
    if (noViajaHoy || !viajeActivo?.idViaje) return;

    const hubUrl = `${getApiBaseUrl().replace(/\/api$/, "")}/trackingHub`;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem("token") || ""
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        console.log(`Conectado a SignalR para viaje #${viajeActivo.idViaje}`);
        connection.invoke("SuscribirseAlViaje", viajeActivo.idViaje);
      })
      .catch(err => console.error("Error al conectar a SignalR:", err));

    connection.on("RecibirUbicacion", (data) => {
      const { latitud, longitud } = data;
      setUbicacionBus({ lat: latitud, lng: longitud });

      // Calcular distancia en tiempo real con la parada real del estudiante
      if (paradaEstudiante?.latitud && paradaEstudiante?.longitud) {
        const dist = calcularDistancia(latitud, longitud, paradaEstudiante.latitud, paradaEstudiante.longitud);
        setDistanciaEstimada(dist.toFixed(1));

        if (dist < 0.5) {
          setAlertaParada(true);
          if (dist < 0.05) setHijoEstado("Abordo");
        } else {
          setAlertaParada(false);
        }
      }
    });

    return () => {
      connection.stop();
    };
  }, [noViajaHoy, viajeActivo, paradaEstudiante]);

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
    } else if (ubicacionBus && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([ubicacionBus.lat, ubicacionBus.lng], 15);
    } else {
      alert("El transporte escolar aún no ha transmitido coordenadas GPS en este momento.");
    }
  };

  const centrarEnParada = () => {
    if (mapInstanceRef.current && paradaEstudiante) {
      mapInstanceRef.current.flyTo([paradaEstudiante.latitud, paradaEstudiante.longitud], 15);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const getNombreAcudiente = () => {
    if (usuarioData?.nombre) return `${usuarioData.nombre} ${usuarioData.apellido || ""}`.trim();
    if (usuarioData?.correo) return usuarioData.correo.split('@')[0];
    return "Padre de Familia";
  };

  const primerEstudiante = estudiantesData && estudiantesData.length > 0 ? estudiantesData[0] : null;

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

          {/* COLUMNA IZQUIERDA: TARJETA ESTUDIANTE + TIMELINE + NOVEDADES + CONDUCTOR */}
          <div className="acudiente-left-column">

            {/* TARJETA PRINCIPAL DEL ESTUDIANTE */}
            {estudiantesData && estudiantesData.length > 0 ? (
              estudiantesData.map((estudiante, index) => (
                <section key={estudiante.idEstudiante || index} className="hijo-card" style={{ marginBottom: '1rem' }}>
                  <div className="hijo-header">
                    <div className="hijo-profile">
                      <div className="hijo-avatar">
                        {`${(estudiante.nombre || 'E').charAt(0)}${(estudiante.apellido || 'E').charAt(0)}`.toUpperCase()}
                      </div>
                      <div>
                        <h4>{`${estudiante.nombre} ${estudiante.apellido}`}</h4>
                        <p>{estudiante.cursoGrado ? `Grado: ${estudiante.cursoGrado}` : "Grado Asignado"} • {estudiante.colegio || "Colegio Destino"}</p>
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
                      <MapPin size={16} />
                      <span>Parada: <strong>{paradaEstudiante?.nombreParada || "Parada asignada"}</strong></span>
                    </div>
                    <div className="detail-item">
                      <Bus size={16} />
                      <span>Ruta: <strong>{rutaInfo?.nombreRuta || "Ruta Asignada"}</strong></span>
                    </div>
                    <div className="detail-item">
                      <User size={16} />
                      <span>Conductor: <strong>{conductorInfo?.nombre || "Asignando conductor..."}</strong></span>
                    </div>
                  </div>
                </section>
              ))
            ) : (
              <section className="hijo-card" style={{ marginBottom: '1rem' }}>
                <div className="hijo-header">
                  <div className="hijo-profile">
                    <div className="hijo-avatar">
                      <User size={24} />
                    </div>
                    <div>
                      <h4>Estudiante en Proceso de Registro</h4>
                      <p>Esperando asignación de estudiante por administración</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

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
                      <span className="step-time">{paradaEstudiante ? paradaEstudiante.nombreParada : "Parada habitual"}</span>
                    </div>
                  </div>

                  <div className={`timeline-line ${(hijoEstado === "Abordo" || hijoEstado === "Entregado") ? "filled" : ""}`}></div>

                  <div className={`timeline-step ${hijoEstado === "Abordo" ? "active" : hijoEstado === "Entregado" ? "completed" : "pending"}`}>
                    <div className="step-icon-circle">2</div>
                    <div className="step-info">
                      <span className="step-title">Abordó la Ruta Escolar</span>
                      <span className="step-time">{hijoEstado === "Abordo" || hijoEstado === "Entregado" ? "En camino al colegio" : "Pendiente"}</span>
                    </div>
                  </div>

                  <div className={`timeline-line ${hijoEstado === "Entregado" ? "filled" : ""}`}></div>

                  <div className={`timeline-step ${hijoEstado === "Entregado" ? "completed" : "pending"}`}>
                    <div className="step-icon-circle">3</div>
                    <div className="step-info">
                      <span className="step-title">Entregado en Colegio</span>
                      <span className="step-time">{hijoEstado === "Entregado" ? "Entregado con éxito" : (primerEstudiante?.colegio || "Colegio")}</span>
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

            {/* DATOS DEL CONDUCTOR Y VEHÍCULO REAL */}
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
                  <h5>{conductorInfo?.nombre || "Conductor Oficial"}</h5>
                  <p>Licencia: <strong>{conductorInfo?.licencia || "Vigente"} ({conductorInfo?.categoria || "C2"})</strong> • Tel: <strong>{conductorInfo?.telefono || "No registrado"}</strong></p>
                  <p>Vehículo: <strong>{vehiculoInfo?.modelo || "Transporte Escolar"}</strong> (Placa: <span className="plate-tag">{vehiculoInfo?.placa || "ASIGNANDO"}</span>)</p>
                </div>
              </div>
              <div className="driver-actions-row">
                <a href={`tel:${conductorInfo?.telefono || ""}`} className="contact-action-btn phone">
                  <Phone size={15} />
                  <span>Llamar Conductor</span>
                </a>
                <a
                  href={`https://wa.me/${(conductorInfo?.telefono || "").replace(/[^0-9]/g, "")}?text=Hola,%20soy%20el%20acudiente%20de%20la%20ruta`}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-action-btn whatsapp"
                >
                  <MessageSquare size={15} />
                  <span>Escribir Mensaje</span>
                </a>
              </div>
            </section>

          </div>

          {/* COLUMNA DERECHA: MAPA EN TIEMPO REAL */}
          <div className="acudiente-right-column">

            {/* MAPA RECORRIDO EN TIEMPO REAL */}
            {hijoEstado !== "NoViaja" ? (
              <section className="realtime-map-card">
                <div className="map-card-header">
                  <div className="map-title-pulse">
                    <span className="pulse-dot"></span>
                    <h4>Ubicación de la Ruta en Tiempo Real</h4>
                  </div>
                  <span className="map-route-name">{vehiculoInfo?.placa ? `Bus ${vehiculoInfo.placa}` : "Ruta en Vivo"}</span>
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
                </div>

                <div ref={mapRef} className="acudiente-map-canvas"></div>

                <div className="map-footer-stats">
                  {distanciaEstimada && (
                    <div className="stat-pill">
                      <span className="stat-label">Distancia Aprox:</span>
                      <span className="stat-val">{distanciaEstimada} km</span>
                    </div>
                  )}
                  <div className="stat-pill live">
                    <span className="live-dot"></span>
                    <span>{viajeActivo ? `Viaje en curso #${viajeActivo.idViaje}` : "Esperando inicio de recorrido"}</span>
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
                <p>Todas las unidades cuentan con rastreo Satelital GPS continuo, velocidad monitoreada por la central y validación de abordaje digital.</p>
                <div className="safety-bullets">
                  <div className="bullet-item">
                    <CheckCircle size={14} color="#10b981" />
                    <span>Transmisión en tiempo real vía WebSockets / SignalR</span>
                  </div>
                  <div className="bullet-item">
                    <CheckCircle size={14} color="#10b981" />
                    <span>Conductor y vehículo validados en la plataforma</span>
                  </div>
                  <div className="bullet-item">
                    <CheckCircle size={14} color="#10b981" />
                    <span>Monitoreo de paradas autorizadas en mapa vial</span>
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
