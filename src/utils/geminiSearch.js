// src/utils/geminiSearch.js
// Utilidad experimental para buscar canchas de fútbol en una ciudad usando Gemini AI (Google)
// Necesitas una API Key de Gemini (Google AI Studio)

/**
 * Busca canchas de fútbol en una ciudad usando Gemini AI.
 * @param {string} city - Nombre de la ciudad
 * @param {string} country - País
 * @returns {Promise<Array>} - Lista de canchas (nombre y dirección)
 */
// Cambia la URL y el modelo a gemini-2.0-flash
export async function searchFootballPitchesGemini(city, country) {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY_HERE";
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    apiKey;
  const prompt = `Dame una lista de canchas de fútbol públicas en ${city}, ${country}. Para cada cancha, incluye nombre, dirección exacta, una calificación (rating) del 1 al 5 basada en reseñas de internet si existe, y una URL de foto si está disponible. Devuelve la respuesta en formato JSON como un array de objetos con 'name', 'location', 'rating' y 'imageUrl'. Si hay muchas, incluye todas las que puedas.`;

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
    // Extraer el texto generado
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Intentar parsear el JSON de la respuesta
    const match = text.match(/\[.*\]/s);
    if (match) {
      return JSON.parse(match[0]);
    }
    // Si no es JSON, devolver como texto plano
    return [{ name: "Respuesta IA", location: text }];
  } catch (e) {
    console.error("Error consultando Gemini AI:", e);
    return [];
  }
}
