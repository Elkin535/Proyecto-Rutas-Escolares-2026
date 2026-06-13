import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bus, LogOut, CheckCircle, Navigation, Clock, User, Heart, ToggleLeft, ToggleRight, MapPin } from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as signalR from "@microsoft/signalr";
import "./Acudiente.css";

function Acudiente() {
  const navigate = useNavigate();
  
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
      mapInstanceRef.current = L.map(mapRef.current).setView([4.7000, -74.0700], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstanceRef.current);
      
      // Parada y Colegio Markers
      L.circleMarker([miParada.lat, miParada.lng], { color: 'orange', radius: 8 }).addTo(mapInstanceRef.current).bindPopup("Tu Parada (Sofía)");
      L.circleMarker([colegio.lat, colegio.lng], { color: 'purple', radius: 8 }).addTo(mapInstanceRef.current).bindPopup("Colegio");

      const busIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      markerBusRef.current = L.marker([4.7000, -74.0700], { icon: busIcon }).addTo(mapInstanceRef.current);
    }
  }, []);

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

  const cerrarSesion = () => {
    navigate("/login");
  };

  return (
    <div className="acudiente-container">
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

      <main className="acudiente-main">
        <section className="welcome-banner">
          <div className="heart-icon-wrapper">
            <Heart size={24} fill="#ec4899" color="#ec4899" />
          </div>
          <div>
            <h2>Hola, María García</h2>
            <p>Monitorea la seguridad del transporte escolar de tus hijos hoy.</p>
          </div>
        </section>

        {/* Alertas dinámicas */}
        {alertaParada && hijoEstado === "Pendiente" && (
          <div style={{ backgroundColor: '#fef3c7', padding: '15px', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid #f59e0b', color: '#92400e', fontWeight: 'bold' }}>
            ⚠️ ¡El transporte escolar está a menos de 500 metros de tu parada! Sal a esperar a Sofía.
          </div>
        )}
        {alertaColegio && hijoEstado === "Abordo" && (
          <div style={{ backgroundColor: '#e0e7ff', padding: '15px', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid #4f46e5', color: '#3730a3', fontWeight: 'bold' }}>
            🏫 ¡El bus está a punto de llegar al colegio!
          </div>
        )}

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

        {hijoEstado !== "NoViaja" && (
          <section className="realtime-map-card">
            <div className="map-card-header">
              <div className="map-title-pulse">
                <span className="pulse-dot"></span>
                <h4>Ubicación de la Ruta en Tiempo Real</h4>
              </div>
              <span className="map-route-name">Bus TOW-345</span>
            </div>

            <div ref={mapRef} style={{ height: '400px', width: '100%', borderRadius: '0 0 10px 10px' }}></div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Acudiente;
