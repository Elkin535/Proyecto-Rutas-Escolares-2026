/**
 * Módulo centralizado para peticiones HTTP a la API de Transporte Escolar.
 * - Incluye el token JWT en la cabecera Authorization: Bearer.
 * - Redirige automáticamente al Login en caso de estado 401 Unauthorized.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5110/api";

export async function fetchAuth(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  if (!token || token === "undefined" || token === "null" || token.trim() === "") {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("No hay token de sesión válido. Por favor inicia sesión nuevamente.");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.substring(1) : endpoint;
  const url = `${API_BASE}/${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Sesión expirada o no autorizada.");
  }

  return response;
}

const MENSAJES_POR_ESTADO = {
  400: "Los datos enviados no son válidos.",
  403: "No tienes permisos para realizar esta acción.",
  404: "El registro no existe o ya fue eliminado.",
  409: "La operación entra en conflicto con otros datos registrados.",
  500: "Ocurrió un error en el servidor. Intenta de nuevo.",
  502: "El servidor no está disponible en este momento. Intenta en unos segundos.",
  503: "El servidor no está disponible en este momento. Intenta en unos segundos.",
};

/**
 * Obtiene un mensaje legible de una respuesta de error de la API.
 * Soporta { mensaje }, { errores } (validaciones), ProblemDetails ({ title, errors }),
 * texto plano y cuerpos vacíos (en ese caso usa el código de estado o el `porDefecto`).
 */
export async function leerError(response, porDefecto) {
  let texto = "";
  try {
    texto = await response.text();
  } catch {
    // cuerpo ilegible: se usa el mensaje por defecto
  }

  if (texto) {
    try {
      const data = JSON.parse(texto);
      if (data?.mensaje) return data.mensaje;
      const errores = data?.errores || data?.errors;
      if (errores && typeof errores === "object") {
        const lista = Object.values(errores).flat().filter(Boolean);
        if (lista.length) return lista.join(" ");
      }
      if (data?.title) return data.title;
    } catch {
      // No era JSON: si es un texto corto se muestra tal cual
      if (texto.length < 200) return texto;
    }
  }

  // Permisos y servidor caído se explican mejor por el código que con el mensaje genérico de la pantalla
  const porEstado = MENSAJES_POR_ESTADO[response.status];
  if (porEstado && (response.status === 403 || response.status >= 502)) return porEstado;
  return porDefecto || porEstado || `Error inesperado (código ${response.status}).`;
}

export function getApiBaseUrl() {
  return API_BASE;
}

export default fetchAuth;
