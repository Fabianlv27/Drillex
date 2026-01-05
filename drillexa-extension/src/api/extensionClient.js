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
// --- INTERCEPTOR DE RESPUESTA (NUEVO) ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    
    // 1. Detectar error 401 (No autorizado)
    if (error.response && error.response.status === 401) {
      console.log("Sesión caducada (401) detectada por interceptor.");

      // 2. Limpiar caché de Chrome Storage inmediatamente
      // Nota: chrome.storage es asíncrono, pero aquí no podemos hacer await fácilmente sin bloquear.
      // Lo ejecutamos y confiamos.
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.remove(["auth_status", "last_check", "cached_lists"], () => {
              console.log("Caché limpiada por 401.");
          });
          
          // Opcional: También podemos setear explícitamente el estado a false
          chrome.storage.local.set({ 
              auth_status: false, 
              last_check: Date.now() 
          });
      }
      
      // 3. (Opcional) Emitir evento global para que la UI de React se actualice al instante
      // Esto es útil si el componente no se re-renderiza solo por el storage.
      window.postMessage({ type: "DRILLEXA_LOGOUT" }, "*");
    }

    return Promise.reject(error);
  }
);

export default api;