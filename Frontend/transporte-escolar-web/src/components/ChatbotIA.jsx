// src/components/ChatbotIA.jsx
import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, User, RefreshCw, MessageSquare } from "lucide-react";
import "./ChatbotIA.css";

const CONOCIMIENTO_PROYECTO = [
  {
    claves: ["equipo", "desarrolladores", "creadores", "integrantes", "quienes son", "quien hizo", "autores"],
    respuesta: `El equipo de desarrollo de SchoolTrack está integrado por 5 ingenieros:
• 👨‍💻 Elkin Andrés Chalarca (Backend Developer)
• 👨‍💻 Christian Camilo Tellez (Frontend Developer)
• 👩‍💻 Daniella Rodríguez Dagua (Database Manager)
• 👩‍💻 Karol Yisney Caicedo Moreno (Frontend Developer)
• 👩‍💻 Luisa Fernanda González Delgado (Database Manager)
Proyecto para el Seminario de Ingeniería de Sistemas 2026.`
  },
  {
    claves: ["gps", "rastreo", "mapa", "tiempo real", "signalr", "websocket", "coordenadas", "ubicacion"],
    respuesta: `El monitoreo GPS funciona en tiempo real mediante WebSockets con Microsoft SignalR:
1. El bus del conductor transmite coordenadas GPS continuas al servidor.
2. El Hub de SignalR procesa la ubicación de baja latencia (~15ms).
3. Los acudientes ven el movimiento animado del bus sobre el mapa interactivo (Leaflet.js) en su dispositivo.`
  },
  {
    claves: ["seguridad", "bcrypt", "jwt", "token", "contraseña", "clave", "autenticacion", "proteccion"],
    respuesta: `SchoolTrack implementa seguridad de nivel empresarial 'Zero Trust':
• Hashing de contraseñas con BCrypt Work Factor 12 y migración automática.
• Autenticación Stateless basada en Tokens JWT (firmados en SHA256).
• Control de Acceso por Roles (RBAC) para proteger datos sensibles de estudiantes.`
  },
  {
    claves: ["contacto", "soporte", "correo", "telefono", "ayuda", "informacion", "comunicar"],
    respuesta: `Puedes contactarnos a través de los canales oficiales:
📧 Correo institucional: soporte@schooltrack.edu.co
📞 Teléfono: +57 (601) 555-0199
🏢 Universidad / Seminario de Ingeniería de Sistemas - 2026.`
  },
  {
    claves: ["rutas", "vehiculo", "bus", "parada", "colegio", "estudiante", "acudiente", "conductor"],
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
      texto: "¡Hola! Soy SchoolTrack AI 🤖. ¿En qué te puedo ayudar hoy? Pregúntame sobre el equipo, el monitoreo GPS, la seguridad o el contacto.",
      hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputTexto, setInputTexto] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (abierto) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajes, abierto, escribiendo]);

  const procesarRespuestaIA = (pregunta) => {
    const textoNorm = pregunta.toLowerCase().trim();

    for (const item of CONOCIMIENTO_PROYECTO) {
      if (item.claves.some(clave => textoNorm.includes(clave))) {
        return item.respuesta;
      }
    }

    return "Gracias por consultar a SchoolTrack AI. Puedo brindarte información sobre los integrantes del equipo, el monitoreo GPS en vivo, la seguridad JWT/BCrypt, o los canales de contacto. ¿Sobre cuál tema te gustaría profundizar?";
  };

  const enviarMensaje = (e) => {
    if (e) e.preventDefault();
    if (!inputTexto.trim()) return;

    const textoUsuario = inputTexto;
    const horaActual = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const nuevoMensajeUsuario = {
      remitente: "usuario",
      texto: textoUsuario,
      hora: horaActual
    };

    setMensajes(prev => [...prev, nuevoMensajeUsuario]);
    setInputTexto("");
    setEscribiendo(true);

    setTimeout(() => {
      const respuestaBot = procesarRespuestaIA(textoUsuario);
      setMensajes(prev => [
        ...prev,
        {
          remitente: "bot",
          texto: respuestaBot,
          hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
      setEscribiendo(false);
    }, 700);
  };

  const enviarSugerencia = (texto) => {
    setInputTexto(texto);
    setTimeout(() => {
      const horaActual = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMensajes(prev => [
        ...prev,
        { remitente: "usuario", texto: texto, hora: horaActual }
      ]);
      setEscribiendo(true);

      setTimeout(() => {
        const respuestaBot = procesarRespuestaIA(texto);
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
    }, 100);
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
      {/* Botón Flotante Neón */}
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

          {/* Chips de Preguntas Rápidas */}
          <div className="chatbot-chips">
            <button onClick={() => enviarSugerencia("¿Quiénes integran el proyecto?")}>
              👥 Creadores
            </button>
            <button onClick={() => enviarSugerencia("¿Cómo funciona el monitoreo GPS?")}>
              🛰️ GPS & SignalR
            </button>
            <button onClick={() => enviarSugerencia("¿Qué seguridad implementa?")}>
              🛡️ Seguridad JWT
            </button>
            <button onClick={() => enviarSugerencia("¿Cómo contactar a soporte?")}>
              📞 Contacto
            </button>
          </div>

          {/* Formulario Input */}
          <form className="chatbot-input-bar" onSubmit={enviarMensaje}>
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
