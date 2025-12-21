import api from "./axiosClient"; // Asumo que está en la misma carpeta 'api'

// 1. Crear registro inicial de progreso
export const PostProgress = async (idList, game) => {
  try {
    const response = await api.post("/user/progress", {
      idList: idList,
      game: game
    });
    return response.data;
  } catch (error) {
    console.error("Error en PostProgress:", error);
    // Opcional: throw error; si quieres manejarlo en el componente
  }
};

// 2. Actualizar progreso (Aciertos, cantidad mostrada, etc.)
export const UpdateProgress = async (data) => {
  try {
    await api.post("/user/progress/update", data);
    
    console.log("Progreso sincronizado exitosamente");
    localStorage.removeItem("pendingProgress"); // Limpiamos caché local si salió bien
    
    return true;
  } catch (error) {
    console.error("Error enviando progreso:", error);
    return false;
  }
};

// 3. Obtener progreso actual
export const GetData = async (idList, game) => {
  try {
    // La URL limpia coincide con tu backend: @UserData_router.get("/user/progress/{idList}/{game}")
    const response = await api.get(`/user/progress/${idList}/${game}`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo datos:", error);
    // Retornamos un objeto seguro para que el frontend no rompa al intentar leer "cant"
    return { cant: null, right: [] }; 
  }
};