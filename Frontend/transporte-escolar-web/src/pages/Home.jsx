// src/pages/Home.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bus,
  MapPinned,
  ShieldCheck,
  Users,
  Route,
  Bell,
  Menu,
  X,
  MapPin,
  Navigation,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const integrantes = [
    {
      nombre: "Elkin Andrés Chalarca",
      rol: "Backend Developer",
    },
    {
      nombre: "Christian Camilo Tellez",
      rol: "Frontend Developer",
    },
    {
      nombre: "Daniella Rodríguez Dagua",
      rol: "Database Manager",
    },
    {
      nombre: "Karol Yisney Caicedo Moreno",
      rol: "Frontend Developer",
    },
    {
      nombre: "Luisa Fernanda González Delgado",
      rol: "Database Manager",
    },
  ];

  return (
    <div className="home-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          <Bus size={30} />
          <span>SchoolTrack</span>
        </div>

        {/* Botón menú hamburguesa para dispositivos móviles */}
        <button
          className="menu-toggle-btn"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Toggle navigation menu"
        >
          {menuAbierto ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Enlaces y acciones del menú adaptables */}
        <div className={`nav-links ${menuAbierto ? "open" : ""}`}>
          <a href="#about" onClick={() => setMenuAbierto(false)}>¿Qué es?</a>
          <a href="#features" onClick={() => setMenuAbierto(false)}>Funcionalidades</a>
          <a href="#team" onClick={() => setMenuAbierto(false)}>Equipo</a>
          <button
            className="login-btn"
            onClick={() => {
              setMenuAbierto(false);
              navigate("/login");
            }}
          >
            Ingresar
          </button>
        </div>
      </nav>

      {/* HERO SECTION REDISEÑADA CON ANIMACIÓN DE BUS */}
      <section className="hero">
        <div className="hero-container-grid">
          {/* Columna Izquierda: Mensaje principal */}
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} /> Monitoreo GPS 2026 en Tiempo Real
            </div>

            <h1>
              Gestión Inteligente de
              <span> Rutas Escolares</span>
            </h1>

            <p>
              Plataforma moderna e integral para monitoreo GPS en vivo, control de asistencia y administración segura del transporte escolar.
            </p>

            <div className="hero-buttons">
              <button
                className="primary-btn"
                onClick={() => navigate("/login")}
              >
                Iniciar Sesión
              </button>

              <button 
                className="secondary-btn"
                onClick={() => {
                  const el = document.getElementById("about");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Conocer Más
              </button>
            </div>
          </div>

          {/* Columna Derecha: Ilustración y animación de Bus Interactivo */}
          <div className="hero-graphic">
            <div className="bus-card-glass">
              {/* Badges Flotantes de Estado */}
              <div className="floating-badge top-right">
                <span className="pulse-dot"></span>
                <span>Ruta 01 • En Vivo</span>
              </div>

              <div className="floating-badge bottom-left">
                <Clock size={15} color="#00d4ff" />
                <span>Llegada estimada: <strong>5 min</strong></span>
              </div>

              <div className="floating-badge top-left">
                <ShieldCheck size={15} color="#10b981" />
                <span>Monitoreo 100% Seguro</span>
              </div>

              {/* Contenedor de la Animación del Bus */}
              <div className="bus-illustration-container">
                <div className="bus-glow-ring"></div>
                <div className="bus-vector-wrapper">
                  <Bus size={95} className="animated-bus-icon" />
                  <div className="bus-headlights"></div>
                </div>

                {/* Carretera Animada en Movimiento */}
                <div className="road-path">
                  <div className="road-line"></div>
                  <div className="moving-car-shadow"></div>
                </div>
              </div>

              {/* Tarjeta de Rastreador de Ruta en Vivo */}
              <div className="hero-route-tracker">
                <div className="tracker-item">
                  <MapPin size={18} color="#ff4d4d" />
                  <div>
                    <small>Origen</small>
                    <p>Colegio Principal</p>
                  </div>
                </div>

                <div className="tracker-divider">
                  <Navigation size={16} className="moving-nav-icon" />
                </div>

                <div className="tracker-item">
                  <CheckCircle2 size={18} color="#10b981" />
                  <div>
                    <small>Destino</small>
                    <p>Parada Residencial</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section className="about-section" id="about">
        <h2>¿Qué es SchoolTrack?</h2>

        <p>
          SchoolTrack es una plataforma web diseñada para optimizar la gestión
          y supervisión de rutas escolares, permitiendo mayor seguridad,
          control y eficiencia en el transporte de estudiantes.
        </p>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="features-section" id="features">
        <h2>Funcionalidades</h2>

        <div className="features-grid">
          <div className="feature-card">
            <MapPinned size={40} />
            <h3>Monitoreo GPS</h3>
            <p>Seguimiento en tiempo real de las rutas escolares.</p>
          </div>

          <div className="feature-card">
            <Users size={40} />
            <h3>Gestión de Estudiantes</h3>
            <p>Control y administración de estudiantes registrados.</p>
          </div>

          <div className="feature-card">
            <Route size={40} />
            <h3>Control de Rutas</h3>
            <p>Organización eficiente de recorridos y destinos.</p>
          </div>

          <div className="feature-card">
            <ShieldCheck size={40} />
            <h3>Seguridad</h3>
            <p>Mayor protección y monitoreo del transporte escolar.</p>
          </div>

          <div className="feature-card">
            <Bell size={40} />
            <h3>Alertas</h3>
            <p>Notificaciones importantes para administradores y padres.</p>
          </div>
        </div>
      </section>

      {/* INTEGRANTES */}
      <section className="team-section" id="team">
        <h2>Integrantes del Proyecto</h2>

        <div className="team-grid">
          {integrantes.map((item, index) => (
            <div className="team-card" key={index}>
              <div className="avatar">
                {item.nombre.charAt(0)}
              </div>

              <h3>{item.nombre}</h3>

              <p>{item.rol}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>SchoolTrack © 2026</p>
        <p>Proyecto de Seminario - Ingeniería de Sistemas</p>
      </footer>
    </div>
  );
}

export default Home;