import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bus, User, LogOut, Check, X, Navigation, Award, AlertCircle, ClipboardList, MapPin } from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAuth } from "../services/api";
import "./Conductor.css";

function Conductor() {
  const navigate = useNavigate();
  const [usuarioData, setUsuarioData] = useState(null);
  const [conductorData, setConductorData] = useState(null);
  const [vehiculoData, setVehiculoData] = useState(null);
  const [rutaData, setRutaData] = useState(null);
  const [paradas, setParadas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);

  const [viajeActivo, setViajeActivo] = useState(false);
  const [recorridoCompletado, setRecorridoCompletado] = useState(false);
  const [idViaje, setIdViaje] = useState(null);
  const [simulacionActiva, setSimulacionActiva] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylineRef = useRef(null);
  const stopMarkersRef = useRef([]);

  const watchIdRef = useRef(null);
  const simIntervalRef = useRef(null);
  const idViajeRef = useRef(null);

  // Mantener idViajeRef sincronizado para callbacks asíncronos
  useEffect(() => {
    idViajeRef.current = idViaje;
  }, [idViaje]);

  // Carga inicial de datos reales desde la BD
  useEffect(() => {
    const cargarTodo = async () => {
      setCargandoDatos(true);
      try {
        const userStr = localStorage.getItem("usuario");
        if (!userStr) {
          navigate("/login", { replace: true });
          return;
        }

        const user = JSON.parse(userStr);
        setUsuarioData(user);

        // 1. Obtener perfil de Conductor de la BD
        const resCond = await fetchAuth("Conductor/obtener-todos");
        let conductorActual = null;
        if (resCond.ok) {
          const conductores = await resCond.json();
          conductorActual = conductores.find(c => c.idUsuario === user.idUsuario);
          if (!conductorActual && conductores.length > 0) {
            conductorActual = conductores[0];
          }
          setConductorData(conductorActual);
        }

        // 2. Obtener Vehículo
        const resVeh = await fetchAuth("Vehiculo/obtener-todos");
        let vehiculoActual = null;
        if (resVeh.ok) {
          const vehiculos = await resVeh.json();
          if (conductorActual?.idVehiculo) {
            vehiculoActual = vehiculos.find(v => v.idVehiculo === conductorActual.idVehiculo);
          }
          if (!vehiculoActual && vehiculos.length > 0) {
            vehiculoActual = vehiculos[0];
          }
          setVehiculoData(vehiculoActual);
        }

        // 3. Obtener Rutas
        const resRutas = await fetchAuth("Ruta/obtener-todas");
        let rutaActual = null;
        if (resRutas.ok) {
          const rutas = await resRutas.json();
          if (conductorActual) {
            const nombreCompleto = `${user.nombre || ""} ${user.apellido || ""}`.trim();
            rutaActual = rutas.find(r => r.descripcion && r.descripcion.includes(nombreCompleto));
          }
          if (!rutaActual && rutas.length > 0) {
            rutaActual = rutas[0];
          }
          setRutaData(rutaActual);
        }

        // 4. Paradas reales de la ruta
        let paradasReales = [];
        if (rutaActual?.idRuta) {
          const resParadas = await fetchAuth(`Parada/obtener-por-ruta?idRuta=${rutaActual.idRuta}`);
          if (resParadas.ok) {
            paradasReales = await resParadas.json();
            setParadas(paradasReales);
          }
        }

        // 5. Estudiantes reales de la ruta
        if (rutaActual?.idRuta) {
          const resEst = await fetchAuth("Estudiante/obtener-todos");
          if (resEst.ok) {
            const todosEst = await resEst.json();
            const estDeRuta = todosEst.filter(e => e.idRuta === rutaActual.idRuta);
            const estMapeados = estDeRuta.map(e => {
              const paradaAsociada = paradasReales.find(p => p.idParada === e.idParada);
              return {
                id: e.idEstudiante,
                nombre: `${e.nombre} ${e.apellido}`,
                parada: paradaAsociada ? paradaAsociada.nombreParada : "Parada asignada",
                estado: "Pendiente",
                hora: ""
              };
            });
            setEstudiantes(estMapeados);
          }
        }

        // 6. Verificar si ya hay un viaje activo en progreso para este conductor
        if (conductorActual?.idConductor) {
          const resHist = await fetchAuth("Historial/obtener-todos");
          if (resHist.ok) {
            const historial = await resHist.json();
            const viajeEnCurso = historial.find(
              h => h.idConductor === conductorActual.idConductor && h.estadoViaje === "En progreso"
            );
            if (viajeEnCurso) {
              setIdViaje(viajeEnCurso.idViaje);
              setViajeActivo(true);
            }
          }
        }
      } catch (err) {
        console.error("Error al cargar datos del conductor:", err);
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarTodo();
  }, [navigate]);

  // Inicializar Mapa Leaflet
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Crear instancia de mapa
    const map = L.map(mapRef.current).setView([4.7110, -74.0721], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Icono del autobús escolar
    const busIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    markerRef.current = L.marker([4.7110, -74.0721], { icon: busIcon }).addTo(map);

    // Intentar geolocalizar de inmediato para ubicar al conductor
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          map.setView(coords, 14);
          if (markerRef.current) markerRef.current.setLatLng(coords);
        },
        (err) => console.log("Ubicación inicial GPS no disponible:", err.message),
        { timeout: 8000 }
      );
    }

    mapInstanceRef.current = map;
    setTimeout(() => map.invalidateSize(), 300);
  }, []);

  // Dibujar paradas reales y trazar ruta cuando se cargan las paradas
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Limpiar marcadores de paradas anteriores
    stopMarkersRef.current.forEach(m => m.remove());
    stopMarkersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (paradas.length > 0) {
      // Centrar en la primera parada
      map.setView([paradas[0].latitud, paradas[0].longitud], 13);

      // Dibujar marcadores de paradas
      paradas.forEach((p, idx) => {
        const customIcon = L.divIcon({
          className: 'route-stop-custom-icon',
          html: `<div class="stop-marker-badge">${idx + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const stopMarker = L.marker([p.latitud, p.longitud], { icon: customIcon })
          .addTo(map)
          .bindPopup(`<strong>${p.nombreParada}</strong><br/>Orden de recogida: #${p.ordenVisita || idx + 1}`);

        stopMarkersRef.current.push(stopMarker);
      });

      // Trazar ruta vial si hay 2 o más paradas
      if (paradas.length >= 2) {
        const coordsStr = paradas.map(p => `${p.longitud},${p.latitud}`).join(';');
        fetch(`https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`)
          .then(res => res.json())
          .then(data => {
            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
              if (polylineRef.current) polylineRef.current.remove();
              polylineRef.current = L.geoJSON(data.routes[0].geometry, {
                style: { color: '#00d4ff', weight: 5, opacity: 0.85 }
              }).addTo(map);
            }
          })
          .catch(err => console.error("Error cargando trazo vial OSRM:", err));
      }
    }
  }, [paradas]);

  const enviarUbicacionGPS = async (lat, lng, viajeIdOverride) => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.panTo([lat, lng]);
    }

    const currentTripId = viajeIdOverride || idViajeRef.current;
    if (!currentTripId) return;

    try {
      await fetchAuth(`Historial/actualizar-gps?idViaje=${currentTripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitudActual: lat,
          longitudActual: lng
        })
      });
    } catch (error) {
      console.error("Error enviando ubicación GPS al servidor:", error);
    }
  };

  const iniciarRecorrido = async () => {
    const idConductor = conductorData?.idConductor || 1;
    const idVehiculo = vehiculoData?.idVehiculo || 1;

    try {
      const res = await fetchAuth("Historial/iniciar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idVehiculo: idVehiculo,
          idConductor: idConductor
        })
      });

      let nuevoIdViaje = null;
      if (res.ok) {
        const viaje = await res.json();
        nuevoIdViaje = viaje.idViaje;
      } else {
        // En caso de que ya existiera un viaje activo para este conductor
        const resHist = await fetchAuth("Historial/obtener-todos");
        if (resHist.ok) {
          const historial = await resHist.json();
          const viajeEnCurso = historial.find(
            h => h.idConductor === idConductor && h.estadoViaje === "En progreso"
          );
          if (viajeEnCurso) nuevoIdViaje = viajeEnCurso.idViaje;
        }
      }

      if (nuevoIdViaje) {
        setIdViaje(nuevoIdViaje);
        setViajeActivo(true);
        setRecorridoCompletado(false);
        setEstudiantes(prev => prev.map(e => ({ ...e, estado: "Pendiente", hora: "" })));

        // Iniciar tracking GPS real con el navegador
        if (navigator.geolocation && !simulacionActiva) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              enviarUbicacionGPS(pos.coords.latitude, pos.coords.longitude, nuevoIdViaje);
            },
            (error) => console.error("Error GPS del navegador:", error),
            { enableHighAccuracy: true, maximumAge: 3000 }
          );
        }
      } else {
        alert("No se pudo iniciar el viaje en el servidor. Por favor verifica los datos.");
      }
    } catch (err) {
      console.error("Error al iniciar recorrido:", err);
      alert("Error de conexión al iniciar el viaje escolar.");
    }
  };

  const alternarSimulacion = () => {
    const nuevoEstado = !simulacionActiva;
    setSimulacionActiva(nuevoEstado);

    if (nuevoEstado && viajeActivo) {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);

      if (paradas.length >= 2) {
        let index = 0;
        let step = 0;
        const numSteps = 20;

        simIntervalRef.current = setInterval(() => {
          if (index >= paradas.length - 1) {
            clearInterval(simIntervalRef.current);
            return;
          }

          const currentStop = paradas[index];
          const nextStop = paradas[index + 1];

          const lat = currentStop.latitud + (nextStop.latitud - currentStop.latitud) * (step / numSteps);
          const lng = currentStop.longitud + (nextStop.longitud - currentStop.longitud) * (step / numSteps);

          enviarUbicacionGPS(lat, lng);

          step++;
          if (step > numSteps) {
            step = 0;
            index++;
          }
        }, 1000);
      } else {
        // Si no hay paradas trazadas aún, simular alrededor de la posición actual
        let angle = 0;
        simIntervalRef.current = setInterval(() => {
          const baseLat = markerRef.current ? markerRef.current.getLatLng().lat : 4.7110;
          const baseLng = markerRef.current ? markerRef.current.getLatLng().lng : -74.0721;
          const simLat = baseLat + Math.cos(angle) * 0.001;
          const simLng = baseLng + Math.sin(angle) * 0.001;
          enviarUbicacionGPS(simLat, simLng);
          angle += 0.2;
        }, 1500);
      }
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

  const finalizarRecorrido = async () => {
    if (idViaje) {
      try {
        await fetchAuth(`Historial/finalizar?idViaje=${idViaje}`, { method: "PUT" });
      } catch (err) {
        console.error("Error al finalizar viaje en servidor:", err);
      }
    }
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
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const getNombreConductor = () => {
    if (usuarioData?.nombre) return `${usuarioData.nombre} ${usuarioData.apellido || ""}`.trim();
    return "Conductor Autorizado";
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
        {/* Perfil del Conductor / Info Vehículo Dinámica */}
        <section className="conductor-profile-card">
          <div className="driver-avatar-circle">
            <User size={32} />
          </div>
          <div className="driver-meta">
            <h3>{getNombreConductor()}</h3>
            <p className="license-info">
              Licencia: {conductorData?.numeroLicencia || "Vigente"} ({conductorData?.categoriaLicencia || "C2"}) - Placa: <strong>{vehiculoData?.placa || "Asignando..."}</strong>
            </p>
            <p className="route-info">
              Ruta Asignada: <span>{rutaData?.nombreRuta || "Sin ruta asignada aún"}</span>
            </p>
          </div>
        </section>

        {/* MAPA DE RUTAS */}
        <section className="map-section">
          <div ref={mapRef} className="conductor-map-canvas"></div>
          {viajeActivo && (
            <div className="gps-active-bar">
              <span className="gps-status-label">Transmisión GPS Activa (Viaje #{idViaje})</span>
              <label className="gps-sim-toggle">
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
                <span>Recorrido en progreso (Viaje #{idViaje})...</span>
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
              <h4>Pasajeros de la Ruta ({estudiantes.length})</h4>
            </div>

            {estudiantes.length === 0 ? (
              <p className="no-students-msg" style={{ padding: "1rem", color: "#94a3b8", textAlign: "center" }}>
                No hay estudiantes asignados actualmente a esta ruta en el sistema.
              </p>
            ) : (
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
                          <span className="badge delivered">Llegó a destino</span>
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
            )}
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
