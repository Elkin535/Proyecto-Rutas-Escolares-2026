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

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Gestión Inteligente de
            <span> Rutas Escolares</span>
          </h1>

          <p>
            Plataforma moderna para monitoreo, control y administración
            segura del transporte escolar.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/login")}
            >
              Iniciar Sesión
            </button>

            <button className="secondary-btn">
              Conocer Más
            </button>
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