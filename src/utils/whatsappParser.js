// src/utils/whatsappParser.js
// Utilidad para procesar listados de WhatsApp y extraer información de partidos y jugadores usando IA

/**
 * Procesa un listado de WhatsApp y extrae información del partido y jugadores usando IA
 * @param {string} whatsappText - Texto del listado de WhatsApp
 * @returns {Promise<Object>} - Objeto con información del partido y lista de jugadores
 */
export async function parseWhatsappList(whatsappText) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;
  
  const prompt = `Analiza este listado o texto de WhatsApp de un partido de fútbol y extrae la información en formato JSON.

El texto puede venir en cualquier formato, orden o estilo (listado numerado, con guiones, frases, mezclado, etc). Extrae la información aunque el listado no sea estructurado y aunque los datos estén dispersos o mezclados en el texto. Busca siempre la información relevante para crear el partido.

Detecta la moneda exactamente como aparece en el texto (€, $, COP, USD, etc). Si ves el símbolo €, la moneda debe ser EUR.

TEXTO DEL LISTADO:
${whatsappText}

Extrae la siguiente información:
1. Fecha del partido (en formato YYYY-MM-DD)
2. Hora del partido (en formato HH:MM)
3. Ubicación/cancha
4. Tipo de fútbol (5v5, 7v7, 9v9, 11v11, etc.)
5. Precio por persona (devuelve el número, la moneda detectada y el texto completo de la línea de precio)
6. Lista de jugadores confirmados (solo nombres, sin números ni ✅)

IMPORTANTE: Si el año no está explícito en el texto, asume que es 2025.

Devuelve la respuesta en formato JSON con esta estructura:
{
  "fecha": "YYYY-MM-DD",
  "hora": "HH:MM", 
  "ubicacion": "texto de la ubicación",
  "tipoFutbol": "texto del tipo",
  "precio": número,
  "moneda": "COP|USD|EUR|...",
  "detallePrecio": "texto completo de la línea de precio",
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
      // Si la fecha tiene año 2024, reemplazarlo por 2025
      let fecha = parsedData.fecha || null;
      if (fecha && /^2024-/.test(fecha)) {
        fecha = fecha.replace(/^2024-/, '2025-');
      }
      let moneda = parsedData.moneda || '';
      const detallePrecio = parsedData.detallePrecio || '';
      // Refuerzo: si el detallePrecio contiene '€', 'euros' o 'eur', forzar moneda a 'EUR'
      const detalleLower = detallePrecio.toLowerCase();
      if (
        detallePrecio.includes('€') ||
        detalleLower.includes('euros') ||
        detalleLower.includes('eur') ||
        (detallePrecio.includes('$') && (detalleLower.includes('euros') || detalleLower.includes('eur')))
      ) {
        moneda = 'EUR';
      }
      return {
        fecha,
        hora: parsedData.hora || null,
        ubicacion: parsedData.ubicacion || "",
        tipoFutbol: parsedData.tipoFutbol || "",
        precio: parsedData.precio || 0,
        moneda,
        detallePrecio,
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