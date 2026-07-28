// src/components/ChatbotIA.jsx
import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, User, RefreshCw, ChevronRight, ChevronLeft } from "lucide-react";
import "./ChatbotIA.css";

const normalizarTexto = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();

const CONOCIMIENTO_PROYECTO = [
  {
    claves: [
      "equipo", "desarrolladores", "creadores", "integrantes", "quienes", "quien",
      "autores", "hizo", "elkin", "christian", "daniella", "karol", "luisa", "seminario"
    ],
    respuesta: `El equipo de desarrollo de SchoolTrack está integrado por 5 ingenieros:
• 👨‍💻 Elkin Andrés Chalarca (Backend Developer)
• 👨‍💻 Christian Camilo Tellez (Frontend Developer)
• 👩‍💻 Daniella Rodríguez Dagua (Database Manager)
• 👩‍💻 Karol Yisney Caicedo Moreno (Frontend Developer)
• 👩‍💻 Luisa Fernanda González Delgado (Database Manager)
Proyecto para el Seminario de Ingeniería de Sistemas 2026.`
  },
  {
    claves: [
      "gps", "rastreo", "mapa", "tiempo real", "signalr", "websocket", "coordenadas",
      "ubicacion", "bus", "monitoreo", "como funciona"
    ],
    respuesta: `El monitoreo GPS funciona en tiempo real mediante WebSockets con Microsoft SignalR:
1. El bus del conductor transmite coordenadas GPS continuas al servidor.
2. El Hub de SignalR procesa la ubicación de baja latencia (~15ms).
3. Los acudientes ven el movimiento animado del bus sobre el mapa interactivo (Leaflet.js) en su dispositivo.`
  },
  {
    claves: [
      "seguridad", "bcrypt", "jwt", "token", "contrasena", "clave", "autenticacion",
      "proteccion", "seguro", "encriptacion"
    ],
    respuesta: `SchoolTrack implementa seguridad de nivel empresarial 'Zero Trust':
• Hashing de contraseñas con BCrypt Work Factor 12 y migración automática.
• Autenticación Stateless basada en Tokens JWT (firmados en SHA256).
• Control de Acceso por Roles (RBAC) para proteger datos sensibles de estudiantes.`
  },
  {
    claves: [
      "contacto", "soporte", "correo", "telefono", "ayuda", "informacion",
      "comunicar", "atencion", "email"
    ],
    respuesta: `Puedes contactarnos a través de los canales oficiales:
📧 Correo institucional: soporte@schooltrack.edu.co
📞 Teléfono: +57 (601) 555-0199
🏢 Universidad / Seminario de Ingeniería de Sistemas - 2026.`
  },
  {
    claves: [
      "rutas", "vehiculo", "parada", "colegio", "estudiante", "acudiente",
      "conductor", "asistencia", "funciones", "servicios"
    ],
    respuesta: `SchoolTrack permite gestionar:
🚌 Rutas escolares activas y paradas asociadas.
👨‍✈️ Conductores asignados con licencias y vehículos.
👨‍👩‍👧 Acudientes y lista de estudiantes a bordo.
📊 Asistencias y notificaciones automáticas.`
  }
];

function ChatbotIA() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    {
      remitente: "bot",
      texto: "¡Hola! Soy SchoolTrack AI 🤖. ¿En qué te puedo ayudar hoy? Haz clic en las sugerencias abajo o escribe tu consulta.",
      hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputTexto, setInputTexto] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const chatBottomRef = useRef(null);
  const chipsRef = useRef(null);

  useEffect(() => {
    if (abierto) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajes, abierto, escribiendo]);

  const procesarRespuestaIA = (pregunta) => {
    const textoNorm = normalizarTexto(pregunta);

    for (const item of CONOCIMIENTO_PROYECTO) {
      if (item.claves.some(clave => textoNorm.includes(clave))) {
        return item.respuesta;
      }
    }

    return "SchoolTrack es una plataforma web integral de transporte escolar. Puedo responderte sobre:\n• 👥 Integrantes y creadores del equipo\n• 🛰️ Monitoreo GPS y WebSockets\n• 🛡️ Seguridad JWT y BCrypt\n• 📞 Canales de contacto\n\n¿Sobre qué tema deseas consultar?";
  };

  const enviarMensajeTexto = (textoAEnviar) => {
    if (!textoAEnviar.trim()) return;

    const horaActual = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setMensajes(prev => [
      ...prev,
      { remitente: "usuario", texto: textoAEnviar, hora: horaActual }
    ]);
    setInputTexto("");
    setEscribiendo(true);

    setTimeout(() => {
      const respuestaBot = procesarRespuestaIA(textoAEnviar);
      setMensajes(prev => [
        ...prev,
        {
          remitente: "bot",
          texto: respuestaBot,
          hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
      setEscribiendo(false);
    }, 600);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    enviarMensajeTexto(inputTexto);
  };

  const scrollChips = (direccion) => {
    if (chipsRef.current) {
      chipsRef.current.scrollBy({
        left: direccion === "derecha" ? 140 : -140,
        behavior: "smooth"
      });
    }
  };

  const reiniciarChat = () => {
    setMensajes([
      {
        remitente: "bot",
        texto: "¡Hola! Soy SchoolTrack AI 🤖. ¿En qué te puedo ayudar hoy?",
        hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  return (
    <div className="chatbot-ia-container">
      {/* Botón Flotante FAB */}
      {!abierto && (
        <button
          className="chatbot-fab"
          onClick={() => setAbierto(true)}
          title="Consultar Asistente IA SchoolTrack"
        >
          <div className="fab-glow-pulse"></div>
          <Bot size={28} className="fab-bot-icon" />
          <span className="fab-badge">AI</span>
        </button>
      )}

      {/* Ventana de Chat Glassmorphism */}
      {abierto && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-avatar-status">
              <div className="bot-avatar">
                <Bot size={22} />
              </div>
              <div>
                <h4>SchoolTrack AI <Sparkles size={14} className="sparkle-icon" /></h4>
                <small><span className="online-dot"></span> En línea • Asistente Virtual</small>
              </div>
            </div>

            <div className="header-actions">
              <button onClick={reiniciarChat} title="Reiniciar conversación" className="btn-icon-chat">
                <RefreshCw size={16} />
              </button>
              <button onClick={() => setAbierto(false)} title="Cerrar chat" className="btn-icon-chat">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Área de Mensajes */}
          <div className="chatbot-messages">
            {mensajes.map((msg, index) => (
              <div key={index} className={`message-bubble-wrapper ${msg.remitente}`}>
                {msg.remitente === "bot" && (
                  <div className="msg-avatar bot">
                    <Bot size={16} />
                  </div>
                )}
                <div className="message-content">
                  <p>{msg.texto}</p>
                  <span className="msg-time">{msg.hora}</span>
                </div>
                {msg.remitente === "usuario" && (
                  <div className="msg-avatar user">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {escribiendo && (
              <div className="message-bubble-wrapper bot">
                <div className="msg-avatar bot">
                  <Bot size={16} />
                </div>
                <div className="message-content typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Barra de Sugerencias con Botones Deslizables */}
          <div className="chips-wrapper">
            <button className="btn-scroll-chip left" onClick={() => scrollChips("izquierda")}>
              <ChevronLeft size={14} />
            </button>

            <div className="chatbot-chips" ref={chipsRef}>
              <button onClick={() => enviarMensajeTexto("¿Quiénes son los creadores e integrantes del equipo?")}>
                👥 Creadores del Proyecto
              </button>
              <button onClick={() => enviarMensajeTexto("¿Cómo funciona el monitoreo GPS en tiempo real?")}>
                🛰️ Monitoreo GPS & SignalR
              </button>
              <button onClick={() => enviarMensajeTexto("¿Qué seguridad implementa la plataforma?")}>
                🛡️ Seguridad JWT & BCrypt
              </button>
              <button onClick={() => enviarMensajeTexto("¿Cómo puedo contactar a soporte?")}>
                📞 Contacto y Soporte
              </button>
              <button onClick={() => enviarMensajeTexto("¿Qué funciones tiene para rutas y estudiantes?")}>
                🚌 Gestión de Rutas
              </button>
            </div>

            <button className="btn-scroll-chip right" onClick={() => scrollChips("derecha")}>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Formulario Input */}
          <form className="chatbot-input-bar" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Escribe tu duda sobre SchoolTrack..."
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
            />
            <button type="submit" disabled={!inputTexto.trim()} className="btn-send-chat">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatbotIA;
