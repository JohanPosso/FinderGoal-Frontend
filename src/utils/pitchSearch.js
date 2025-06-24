// src/utils/pitchSearch.js
// Utilidad para buscar canchas de fútbol (leisure=pitch) en una ciudad usando Overpass API (OpenStreetMap)
// Si en el futuro quieres cambiar a Google Maps Places API, solo modifica este archivo

/**
 * Busca canchas de fútbol en una ciudad usando Overpass API.
 * @param {string} city - Nombre de la ciudad
 * @param {string} country - País (opcional, para mayor precisión)
 * @returns {Promise<Array>} - Lista de canchas encontradas
 */
export async function searchFootballPitches(city, country = "") {
  // Construir consulta Overpass para buscar canchas de fútbol en la ciudad
  // Buscamos nodos, ways y relaciones con leisure=pitch y sport=football
  // Primero, obtenemos el área de la ciudad
  const query = `
    [out:json][timeout:25];
    area["name"="${city}"]${country ? `["is_in:country"="${country}"]` : ""};
    (
      node["leisure"="pitch"]["sport"="soccer"](area);
      way["leisure"="pitch"]["sport"="soccer"](area);
      relation["leisure"="pitch"]["sport"="soccer"](area);
    );
    out center tags;
  `;
  const url = "https://overpass-api.de/api/interpreter";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });
    const data = await response.json();
    // Mapear resultados a un formato más usable
    return (data.elements || []).map((el) => ({
      id: el.id,
      name: el.tags.name || "Cancha de fútbol",
      location: el.tags["addr:street"]
        ? `${el.tags["addr:street"]}${
            el.tags["addr:housenumber"]
              ? ", " + el.tags["addr:housenumber"]
              : ""
          }`
        : city,
      lat: el.lat || (el.center && el.center.lat),
      lon: el.lon || (el.center && el.center.lon),
      surface: el.tags.surface || "Desconocida",
      type: el.tags["pitch"] || "Fútbol",
      description:
        el.tags.description || "Cancha pública detectada por OpenStreetMap.",
    }));
  } catch (e) {
    console.error("Error buscando canchas en Overpass API:", e);
    return [];
  }
}
