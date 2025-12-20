import { useState } from 'react';
// Asumo que tu servicio está aquí según tu descripción
import { askGemini } from '../../api/GeminiService'; 

export const useGemini = () => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiResponse, setAiResponse] = useState(null);

  const analyzeText = async (userText, targetWords) => {
    setLoadingAi(true);
    setAiError(null);
    setAiResponse(null);

    // Prompt de ingeniería para que actúe como profesor
    const prompt = `
      Actúa como un profesor de inglés corrigiendo a un estudiante.
      El estudiante escribió: "${userText}".
      Debía usar obligatoriamente estas palabras: ${targetWords.join(", ")}.
      
      1. Proporciona la versión corregida del texto (Gramática natural).
      2. Explica brevemente los errores cometidos.
      3. Confirma si usó las palabras requeridas correctamente.
      
      Formato de respuesta: Texto plano claro y conciso.
    `;

    try {
      // Usamos contexto 'grammar' para que el backend sepa qué "system instruction" usar
      const result = await askGemini(prompt, "grammar");
      
      if (result && result.response) {
        setAiResponse(result.response);
      } else {
        setAiError("No se pudo obtener una corrección.");
      }
    } catch (err) {
      console.error(err);
      setAiError("Error de conexión con el asistente.");
    } finally {
      setLoadingAi(false);
    }
  };

  const clearAiState = () => {
    setAiResponse(null);
    setAiError(null);
  };

  return { loadingAi, aiError, aiResponse, analyzeText, clearAiState };
};