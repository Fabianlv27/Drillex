import axios from "axios";

const BASE_URL = "https://dibylocal.com:8000"; // Tu URL del backend

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // IMPORTANTE: Permite enviar/recibir cookies (refresh token)
});

api.interceptors.request.use(async (config) => {
  let token = null;

  // 1. Intentar leer de la Extensión
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    const result = await chrome.storage.local.get(['access_token']);
    token = result.access_token;
  } 

  // 2. Si no hay, intentar leer de la Web (localStorage)
  if (!token) {
    token = localStorage.getItem('access_token');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;