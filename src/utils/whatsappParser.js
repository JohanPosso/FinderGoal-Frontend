// src/utils/whatsappParser.js
// Utilidad para procesar listados de WhatsApp y extraer información de partidos y jugadores usando IA

/**
 * Procesa un listado de WhatsApp y extrae información del partido y jugadores usando IA
 * @param {string} whatsappText - Texto del listado de WhatsApp
 * @returns {Promise<Object>} - Objeto con información del partido y lista de jugadores
 */
export async function parseWhatsappList(whatsappText) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY_HERE";
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;
  
  const prompt = `Analiza este listado de WhatsApp de un partido de fútbol y extrae la información en formato JSON. 

TEXTO DEL LISTADO:
${whatsappText}

Extrae la siguiente información:
1. Fecha del partido (en formato YYYY-MM-DD)
2. Hora del partido (en formato HH:MM)
3. Ubicación/cancha
4. Tipo de fútbol (5v5, 7v7, 11v11, etc.)
5. Precio por persona
6. Lista de jugadores confirmados (solo nombres, sin números ni ✅)

Devuelve la respuesta en formato JSON con esta estructura:
{
  "fecha": "YYYY-MM-DD",
  "hora": "HH:MM", 
  "ubicacion": "texto de la ubicación",
  "tipoFutbol": "texto del tipo",
  "precio": número,
  "jugadores": ["nombre1", "nombre2", "nombre3", ...]
}

Si no encuentras alguna información, usa null para ese campo.`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Intentar extraer JSON de la respuesta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      
      // Validar y limpiar los datos
      return {
        fecha: parsedData.fecha || null,
        hora: parsedData.hora || null,
        ubicacion: parsedData.ubicacion || "",
        tipoFutbol: parsedData.tipoFutbol || "",
        precio: parsedData.precio || 0,
        jugadores: Array.isArray(parsedData.jugadores) ? parsedData.jugadores : []
      };
    }
    
    // Si no se puede parsear JSON, devolver estructura vacía
    return {
      fecha: null,
      hora: null,
      ubicacion: "",
      tipoFutbol: "",
      precio: 0,
      jugadores: []
    };
    
  } catch (error) {
    console.error("Error procesando listado de WhatsApp:", error);
    throw new Error("No se pudo procesar el listado. Verifica el formato e inténtalo de nuevo.");
  }
}

/**
 * Valida si el texto parece ser un listado de WhatsApp de fútbol
 * @param {string} text - Texto a validar
 * @returns {boolean} - True si parece ser un listado válido
 */
export function isValidWhatsappList(text) {
  if (!text || text.length < 50) return false;
  
  // Buscar palabras clave que indiquen que es un listado de fútbol
  const keywords = [
    'partido', 'cancha', 'fútbol', 'futbol', 'jugadores', 'cupos', 
    'hora', 'precio', 'nequi', 'bancolombia', 'daviplata', 'transferencia'
  ];
  
  const textLower = text.toLowerCase();
  const hasKeywords = keywords.some(keyword => textLower.includes(keyword));
  
  // Buscar patrones de números (jugadores numerados)
  const hasNumberedPlayers = /\d+\.\s*\w+/.test(text);
  
  // Buscar patrones de fecha
  const hasDate = /\d{1,2}\s+(de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i.test(text);
  
  return hasKeywords && (hasNumberedPlayers || hasDate);
}

/**
 * Limpia y formatea el texto del listado para mejor procesamiento
 * @param {string} text - Texto original
 * @returns {string} - Texto limpio
 */
export function cleanWhatsappText(text) {
  return text
    .replace(/[^\w\s\.\,\:\-\/\n]/g, ' ') // Remover caracteres especiales excepto algunos útiles
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();
} 