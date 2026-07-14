import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bus, User, LogOut, Check, X, Navigation, Award, AlertCircle, ClipboardList } from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "./Conductor.css";

function Conductor() {
  const navigate = useNavigate();
  const [viajeActivo, setViajeActivo] = useState(false);
  const [recorridoCompletado, setRecorridoCompletado] = useState(false);
  const [idViaje, setIdViaje] = useState(null);
  const [simulacionActiva, setSimulacionActiva] = useState(false);

  // Default Paradas for demonstration (usually fetched from API)
  const paradasDemo = [
    { id: 1, lat: 4.7000, lng: -74.0700, nombre: "Paradero Inicial" },
    { id: 2, lat: 4.7110, lng: -74.0721, nombre: "Calle 100 con Cra 15" },
    { id: 3, lat: 4.7200, lng: -74.0800, nombre: "Av. Suba con Calle 127" },
    { id: 4, lat: 4.7450, lng: -74.0910, nombre: "Colegio" }
  ];

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const [estudiantes, setEstudiantes] = useState([
    { id: 1, nombre: "Sofía García", parada: "Calle 100 con Cra 15", estado: "Pendiente", hora: "" },
    { id: 2, nombre: "Mateo Ríos", parada: "Av. Suba con Calle 127", estado: "Pendiente", hora: "" },
    { id: 3, nombre: "Juan López", parada: "Autopista Norte con Calle 170", estado: "Pendiente", hora: "" },
    { id: 4, nombre: "Camila Sánchez", parada: "Calle 183 con Cra 7", estado: "Pendiente", hora: "" }
  ]);

  const watchIdRef = useRef(null);
  const simIntervalRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([4.7000, -74.0700], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstanceRef.current);
      
      // Draw path
      const latlngs = paradasDemo.map(p => [p.lat, p.lng]);
      L.polyline(latlngs, {color: 'blue'}).addTo(mapInstanceRef.current);

      // Add stops
      paradasDemo.forEach(p => {
        L.circleMarker([p.lat, p.lng], { color: 'green', radius: 5 }).addTo(mapInstanceRef.current).bindPopup(p.nombre);
      });
      
      // Add bus marker
      const busIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // Simple bus icon
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      markerRef.current = L.marker([4.7000, -74.0700], { icon: busIcon }).addTo(mapInstanceRef.current);
    }
  }, []);

  const enviarUbicacionGPS = async (lat, lng) => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.panTo([lat, lng]);
    }
    
    // In a real scenario, this would use the real idViaje created via POST /api/Historial/iniciar
    const currentIdViaje = 123; 

    try {
      await fetch(`http://localhost:5150/api/Historial/${currentIdViaje}/gps`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitudActual: lat,
          longitudActual: lng
        })
      });
    } catch (error) {
      console.error("Error enviando ubicación GPS:", error);
    }
  };

  const iniciarRecorrido = () => {
    setViajeActivo(true);
    setRecorridoCompletado(false);
    setIdViaje(123); // Simulated ID for now
    setEstudiantes(estudiantes.map(e => ({ ...e, estado: "Pendiente", hora: "" })));

    if (navigator.geolocation && !simulacionActiva) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          enviarUbicacionGPS(position.coords.latitude, position.coords.longitude);
        },
        (error) => console.error("Error GPS:", error),
        { enableHighAccuracy: true }
      );
    }
  };

  const alternarSimulacion = () => {
    const nuevoEstado = !simulacionActiva;
    setSimulacionActiva(nuevoEstado);
    
    if (nuevoEstado && viajeActivo) {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      
      let index = 0;
      let step = 0;
      const numSteps = 20; // steps between stops
      
      simIntervalRef.current = setInterval(() => {
        if (index >= paradasDemo.length - 1) {
          clearInterval(simIntervalRef.current);
          return;
        }
        
        const currentStop = paradasDemo[index];
        const nextStop = paradasDemo[index + 1];
        
        const lat = currentStop.lat + (nextStop.lat - currentStop.lat) * (step / numSteps);
        const lng = currentStop.lng + (nextStop.lng - currentStop.lng) * (step / numSteps);
        
        enviarUbicacionGPS(lat, lng);
        
        step++;
        if (step > numSteps) {
          step = 0;
          index++;
        }
      }, 1000); // Send update every second in simulation
    } else {
      clearInterval(simIntervalRef.current);
      if (viajeActivo && navigator.geolocation) {
         watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => enviarUbicacionGPS(pos.coords.latitude, pos.coords.longitude),
            (err) => console.error(err),
            { enableHighAccuracy: true }
         );
      }
    }
  };

  const finalizarRecorrido = () => {
    setViajeActivo(false);
    setRecorridoCompletado(true);
    setIdViaje(null);
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
  };

  const marcarAsistencia = (id, nuevoEstado) => {
    const ahora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEstudiantes(estudiantes.map(e => {
      if (e.id === id) {
        return { ...e, estado: nuevoEstado, hora: nuevoEstado === "Pendiente" ? "" : ahora };
      }
      return e;
    }));
  };

  const cerrarSesion = () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    localStorage.removeItem("usuario");
    navigate("/login", { replace: true });
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

        {/* MAPA DE RUTAS */}
        <section className="map-section" style={{ marginTop: '20px', borderRadius: '10px', overflow: 'hidden' }}>
            <div ref={mapRef} style={{ height: '300px', width: '100%' }}></div>
            {viajeActivo && (
                <div style={{ padding: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Transmisión GPS Activa</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                        <input type="checkbox" checked={simulacionActiva} onChange={alternarSimulacion} />
                        Simular Movimiento (Para pruebas en PC)
                    </label>
                </div>
            )}
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
                        <span className="badge delivered">Llego a destino</span>
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
