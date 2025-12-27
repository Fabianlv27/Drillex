import axios from "axios";

const BASE_URL = "https://dibylocal.com:8000"; // Tu URL del backend

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // IMPORTANTE: Permite enviar/recibir cookies (refresh token)
  headers: {
    "Content-Type": "application/json",
  },
});

// INTERCEPTOR DE SOLICITUD (Inyectar Token)
api.interceptors.request.use(async (config) => {
  // En una extensión, chrome.storage es asíncrono
  // Verificamos si estamos en entorno de extensión
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    const result = await chrome.storage.local.get(['access_token']);
    if (result.access_token) {
      config.headers.Authorization = `Bearer ${result.access_token}`;
    }
  } else {
    // Fallback para desarrollo web normal (localStorage)
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;