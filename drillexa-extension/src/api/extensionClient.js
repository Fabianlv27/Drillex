import axios from "axios";

// 1. URL DE TU BACKEND
// En desarrollo es localhost. Cuando publiques, pon tu dominio real (ej: https://api.drillexa.com)
const BASE_URL = "https://dibylocal.com:8000"; 

const api = axios.create({
  baseURL: BASE_URL,
  
  // 2. MAGIA DE COOKIES
  // Esto dice: "Si el navegador tiene cookies para localhost:8000, envíalas automáticamente"
  // Así es como detectamos si el usuario ya hizo login en tu web.
  withCredentials: true, 
  
  headers: {
    "Content-Type": "application/json",
  },
});

// Opcional: Interceptor para depurar errores en consola si algo falla
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Drillexa Extension API Error:", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;