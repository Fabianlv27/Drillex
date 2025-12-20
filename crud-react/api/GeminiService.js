
import api from "../api/axiosClient"; // Tu instancia configurada de axios

export const askGemini = async (prompt, context) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await api.post("/ai/assist", {
      prompt: prompt,
      context: context // 'grammar', 'vocabulary', 'lyrics'
    });
    
    // Devolvemos solo la data útil
    return response.data; 
  } catch (error) {
    // Si quieres manejar errores específicos aquí puedes hacerlo
    throw error;
  }
};