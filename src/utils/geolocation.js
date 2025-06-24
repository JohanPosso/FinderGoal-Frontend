// src/utils/geolocation.js
// Utilidad para obtener ciudad y país a partir de lat/lon usando OpenCage o cualquier otro servicio

/**
 * Obtiene ciudad y país a partir de latitud y longitud usando OpenCage Data.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{city: string, country: string} | null>}
 */
export async function getCityCountryFromCoords(latitude, longitude) {
  // Cambia aquí la API si usas otro proveedor
  const OPENCAGE_API_KEY =
    import.meta.env.VITE_OPENCAGE_API_KEY || "YOUR_OPENCAGEDATA_API_KEY_HERE";
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}&language=es`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const components = data.results[0].components;
      const city =
        components.city ||
        components.town ||
        components.village ||
        components.county ||
        "Desconocida";
      const country = components.country || "Desconocido";
      return { city, country };
    }
    return null;
  } catch (e) {
    console.error("Error al obtener ciudad/país por coordenadas:", e);
    return null;
  }
}

/**
 * Obtiene ciudad y país usando la IP (GeoJS)
 * @returns {Promise<{city: string, country: string} | null>}
 */
export async function getCityCountryFromIP() {
  try {
    const response = await fetch("https://get.geojs.io/v1/ip/geo.json");
    const data = await response.json();
    if (data && data.city && data.country) {
      return { city: data.city, country: data.country };
    }
    return null;
  } catch (e) {
    console.error("Error al obtener ciudad/país por IP:", e);
    return null;
  }
}
