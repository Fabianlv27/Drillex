import axios from "axios";

const Ahost = "https://dibylocal.com:8000"; // Tu URL del backend

const api = axios.create({
  baseURL: Ahost,
  withCredentials: true, // ¡IMPORTANTE! Esto permite enviar/recibir Cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// INTERCEPTOR DE RESPUESTA
// Este "vigilante" revisa todas las respuestas antes de que lleguen a tus componentes
api.interceptors.response.use(
  (response) => {
    // Si todo salió bien (status 200-299), deja pasar la respuesta
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 (No autorizado) y no hemos reintentado ya...
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marcamos para no entrar en bucle infinito

      try {
        // 1. Intentamos refrescar el token
        // El navegador enviará automáticamente la cookie "refresh_token" aquí
        await api.post("/refresh");

        // 2. Si funciona, el backend habrá puesto una nueva cookie "access_token"
        // 3. Reintentamos la petición original que falló
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh también falla (ej. pasaron los 30 días o es inválido)
        console.error("Sesión expirada, redirigiendo al login...");
        // Aquí puedes redirigir al usuario al login
        window.location.href = "/signin"; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;