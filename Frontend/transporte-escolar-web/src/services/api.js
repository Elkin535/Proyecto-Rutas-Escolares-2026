/**
 * Módulo centralizado para peticiones HTTP a la API de Transporte Escolar.
 * - Incluye el token JWT en la cabecera Authorization: Bearer.
 * - Redirige automáticamente al Login en caso de estado 401 Unauthorized.
 */

const API_BASE = import.meta.env.VITE_API_URL || "https://schooltrack.seminario1.eleueleo.com/api";

export async function fetchAuth(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("No hay token de sesión. Inicia sesión nuevamente.");
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

export function getApiBaseUrl() {
  return API_BASE;
}

export default fetchAuth;
