import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMapPin,
  FiSearch,
  FiFilter,
  FiStar,
  FiArrowRight,
  FiPlusCircle,
  FiGlobe,
  FiInfo,
} from "react-icons/fi";
import { FaFutbol, FaStar } from "react-icons/fa"; // Usamos FaFutbol para el tema general
import {
  getCityCountryFromCoords,
  getCityCountryFromIP,
} from "../utils/geolocation";
import { searchFootballPitches } from "../utils/pitchSearch";
import { searchFootballPitchesGemini } from "../utils/geminiSearch";
import { useLocationStore } from "../store/useStore";

// Definición de colores del tema Deportivo y Energético (reutilizable)
const colorsSporty = {
  primaryBg: "bg-gray-900", // Fondo oscuro principal
  secondaryBg: "bg-gray-800", // Fondo secundario para tarjetas/secciones
  primaryText: "text-white", // Texto principal
  secondaryText: "text-gray-300", // Texto secundario/descriptivo
  accentLime: "bg-lime-500 text-gray-900", // Verde lima brillante para botones/acentos
  accentLimeText: "text-lime-500", // Color de texto lima
  accentLimeHover: "bg-lime-400",
  accentOrange: "bg-orange-500 text-white", // Naranja intenso para acentos/botones secundarios
  accentOrangeText: "text-orange-400", // Color de texto naranja
  accentOrangeHover: "bg-orange-600",
  cardBg: "bg-gray-800", // Fondo de las tarjetas
  cardBorder: "border-gray-700", // Borde de las tarjetas
  shadowPrimary: "shadow-xl",
  shadowAccent: "shadow-lime-500/30", // Sombra con tinte de acento
};

// --- Componente auxiliar: FieldCard ---
function FieldCard({ field }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`${colorsSporty.secondaryBg} rounded-2xl ${colorsSporty.shadowPrimary} border ${colorsSporty.cardBorder} overflow-hidden flex flex-col`}
    >
      <div className="flex items-center justify-center py-6 bg-gradient-to-br from-lime-500/10 to-orange-500/10">
        <FaFutbol className="text-5xl text-lime-400 drop-shadow-lg" />
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <h3 className={`text-2xl font-bold ${colorsSporty.primaryText} leading-tight pr-4`}>
            {field.name}
          </h3>
          <div className="flex items-center text-lg">
            <FiStar className={`${colorsSporty.accentLimeText} mr-1`} />
            <span className="font-semibold text-white">
              {field.rating ? Number(field.rating).toFixed(1) : "—"}
            </span>
          </div>
        </div>
        <div className={`flex items-center ${colorsSporty.secondaryText} mb-2`}>
          <FiMapPin className={`mr-2 ${colorsSporty.accentLimeText}`} />
          <span className="truncate">{field.location}</span>
        </div>
        <div className={`flex items-center ${colorsSporty.secondaryText} text-sm mb-4`}>
          <FaFutbol className={`mr-2 ${colorsSporty.accentOrangeText}`} />
          <span>
            {field.type || "Fútbol"} • {field.surface || "-"}
          </span>
        </div>
        <p className={`${colorsSporty.secondaryText} text-sm mb-4 line-clamp-2 flex-grow`}>
          {field.description || "Cancha pública o sugerida por la comunidad."}
        </p>
      </div>
    </motion.div>
  );
}

// --- Componente principal: FieldsPage ---
export default function FieldsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    surface: "all",
  });
  const [userLocation, setUserLocation] = useState({
    city: null,
    country: null,
    loading: true,
    error: null,
  });
  const { city, country, getFieldsCache, setFieldsCache, clearFieldsCache } =
    useLocationStore();
  const [geminiFields, setGeminiFields] = useState([]);
  const [loadingGemini, setLoadingGemini] = useState(false);
  const [osmFields, setOsmFields] = useState([]);
  const [loadingOsm, setLoadingOsm] = useState(false);
  const navigate = useNavigate();

  // --- useEffect para obtener la ubicación del usuario ---
  useEffect(() => {
    const getUserGeoLocation = async () => {
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            });
          });
          const { latitude, longitude } = position.coords;
          // Usar utilidad externa para obtener ciudad y país
          const result = await getCityCountryFromCoords(latitude, longitude);
          if (result) {
            setUserLocation({
              city: result.city,
              country: result.country,
              loading: false,
              error: null,
            });
          } else {
            setUserLocation({
              city: null,
              country: null,
              loading: false,
              error: "No se pudo obtener la ciudad/país.",
            });
          }
        } catch (err) {
          console.error(
            "Error al obtener la geolocalización o geocodificación:",
            err
          );
          setUserLocation({
            city: null,
            country: null,
            loading: false,
            error:
              "Necesitamos tu ubicación para mostrarte canchas cercanas. Por favor, habilita la geolocalización.",
          });
          // Fallback a IP
          getIpLocation();
        }
      } else {
        console.warn("Geolocalización no soportada por el navegador.");
        setUserLocation({
          city: null,
          country: null,
          loading: false,
          error: "Tu navegador no soporta geolocalización.",
        });
        getIpLocation();
      }
    };

    const getIpLocation = async () => {
      const result = await getCityCountryFromIP();
      if (result) {
        setUserLocation({
          city: result.city,
          country: result.country,
          loading: false,
          error: null,
        });
      } else {
        setUserLocation({
          city: null,
          country: null,
          loading: false,
          error: "No se pudo estimar tu ubicación por IP.",
        });
      }
    };

    getUserGeoLocation();
  }, []); // Empty dependency array means this runs once on mount

  // Buscar canchas reales cuando se detecta la ciudad
  useEffect(() => {
    if (city && country) {
      setLoadingOsm(true);
      searchFootballPitches(city, country)
        .then((fields) => setOsmFields(fields))
        .finally(() => setLoadingOsm(false));
    }
  }, [city, country]);

  // Buscar y cachear resultados de Gemini
  useEffect(() => {
    if (city && country) {
      const cached = getFieldsCache(city, country);
      if (cached) {
        setGeminiFields(cached);
        setLoadingGemini(false);
      } else {
        setLoadingGemini(true);
        searchFootballPitchesGemini(city, country, 1).then((fields) => {
          setGeminiFields(fields);
          setFieldsCache(city, country, fields);
          setLoadingGemini(false);
        });
      }
    }
  }, [city, country, getFieldsCache, setFieldsCache]);

  // Botón para refrescar los datos manualmente
  const handleRefresh = () => {
    if (city && country) {
      clearFieldsCache(city, country);
      setGeminiFields([]);
      setLoadingGemini(true);
      searchFootballPitchesGemini(city, country, 1).then((fields) => {
        setGeminiFields(fields);
        setFieldsCache(city, country, fields);
        setLoadingGemini(false);
      });
    }
  };

  // Loader visual mientras se buscan canchas
  if (loadingGemini || loadingOsm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-lime-400 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          <span className="text-white text-lg font-bold">
            Buscando canchas en tu ciudad...
          </span>
        </div>
      </div>
    );
  }

  // Mostrar resultados de Gemini si existen, luego OSM
  const filteredFields = (
    geminiFields.length > 0
      ? geminiFields
      : osmFields && osmFields.length > 0
      ? osmFields
      : []
  ).filter((field) => {
    const matchesSearch =
      (field.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (field.location?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesType = filters.type === "all" || field.type === filters.type;
    const matchesSurface =
      filters.surface === "all" || field.surface === filters.surface;
    let matchesLocation = true;
    if (city && country) {
      matchesLocation =
        (field.city ? field.city.toLowerCase() === city.toLowerCase() : true) &&
        (field.country
          ? field.country.toLowerCase() === country.toLowerCase()
          : true);
    }
    return matchesSearch && matchesType && matchesSurface && matchesLocation;
  });

  return (
    <div
      className={`${colorsSporty.primaryBg} min-h-screen py-10 px-6 ${colorsSporty.primaryText}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Encabezado de la página */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-10 pb-6 border-b border-gray-700"
        >
          <div className="flex items-center">
            <FiMapPin
              className={`text-5xl ${colorsSporty.accentOrangeText} mr-4`}
            />
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Explora{" "}
                <span className={colorsSporty.accentOrangeText}>Canchas</span>
              </h1>
              <p className={`${colorsSporty.secondaryText} text-lg mt-1`}>
                Encuentra el lugar perfecto para tu próximo partido.
              </p>
            </div>
          </div>
          <Link to="/create-field">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center px-6 py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 ${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover} ${colorsSporty.shadowAccent}`}
            >
              <FiPlusCircle className="mr-2 text-2xl" /> Agregar Cancha
            </motion.button>
          </Link>
        </motion.div>

        {/* Barra de búsqueda y filtros */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={`${colorsSporty.secondaryBg} p-6 rounded-xl ${colorsSporty.shadowPrimary} border ${colorsSporty.cardBorder} mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end`}
        >
          <div className="relative md:col-span-2">
            <FiSearch
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl ${colorsSporty.secondaryText}`}
            />
            <input
              type="text"
              placeholder="Buscar cancha por nombre o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.cardBorder} border-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 placeholder-gray-400 font-medium text-lg`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <span
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm ${colorsSporty.secondaryText}`}
              >
                Tipo:
              </span>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                className={`w-full pl-16 pr-4 py-3 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.cardBorder} border-2 focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all duration-200 appearance-none bg-no-repeat bg-right-center`}
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23a0aec0'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundSize: "1.2em",
                }}
              >
                <option value="all">Todos</option>
                <option value="Fútbol 7">Fútbol 7</option>
                <option value="Fútbol 11">Fútbol 11</option>
                <option value="Fútbol Sala">Fútbol Sala</option>
              </select>
            </div>
            <div className="relative">
              <span
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm ${colorsSporty.secondaryText}`}
              >
                Superficie:
              </span>
              <select
                value={filters.surface}
                onChange={(e) =>
                  setFilters({ ...filters, surface: e.target.value })
                }
                className={`w-full pl-24 pr-4 py-3 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.cardBorder} border-2 focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all duration-200 appearance-none bg-no-repeat bg-right-center`}
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23a0aec0'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundSize: "1.2em",
                }}
              >
                <option value="all">Todas</option>
                <option value="Sintético">Sintético</option>
                <option value="Natural">Natural</option>
                <option value="Cemento">Cemento</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Mensaje de ubicación actual y estado de carga/error */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg ${
            userLocation.error ? "bg-red-800" : colorsSporty.secondaryBg
          } ${
            userLocation.error ? "text-red-200" : colorsSporty.secondaryText
          } text-center font-medium flex items-center justify-center`}
        >
          {userLocation.loading && (
            <>
              <FiGlobe className="animate-spin mr-3 text-2xl" />
              Detectando tu ubicación...
            </>
          )}
          {!userLocation.loading && userLocation.error && (
            <>
              <FiInfo className="mr-3 text-2xl" />
              {userLocation.error}
            </>
          )}
          {!userLocation.loading &&
            !userLocation.error &&
            userLocation.city &&
            userLocation.country && (
              <>
                <FiMapPin className={`mr-2 ${colorsSporty.accentLimeText}`} />
                Canchas cerca de:{" "}
                <span className="font-bold text-white ml-1">
                  {userLocation.city}, {userLocation.country}
                </span>
              </>
            )}
          {!userLocation.loading &&
            !userLocation.error &&
            (!userLocation.city || !userLocation.country) && (
              <>
                <FiInfo className="mr-3 text-2xl" />
                Ubicación no detectada. Mostrando todas las canchas.
              </>
            )}
        </motion.div>

        {/* Botón para refrescar datos */}
        <motion.div className="mb-4 flex justify-end">
          <button
            onClick={handleRefresh}
            disabled={loadingGemini || !city}
            className={`px-6 py-2 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 ${
              colorsSporty.accentLime
            } hover:${colorsSporty.accentLimeHover} ${
              loadingGemini ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loadingGemini ? "Actualizando..." : "Actualizar canchas"}
          </button>
        </motion.div>

        {/* Lista de canchas */}
        <AnimatePresence mode="wait">
          {filteredFields.length === 0 ? (
            <motion.div
              key="no-fields"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`${colorsSporty.secondaryBg} rounded-xl ${colorsSporty.shadowPrimary} p-12 text-center ${colorsSporty.secondaryText} border ${colorsSporty.cardBorder}`}
            >
              <FaFutbol className="text-8xl mx-auto mb-6 opacity-30 text-orange-500" />
              <p className="text-xl font-semibold mb-3">
                {userLocation.city && userLocation.country
                  ? `¡No se encontraron canchas en ${userLocation.city}, ${userLocation.country} con estos criterios!`
                  : "¡No se encontraron canchas con estos criterios!"}
              </p>
              <p className="text-lg">
                Intenta ajustar tus filtros o sé el primero en agregar una nueva
                cancha.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm("");
                  setFilters({ type: "all", surface: "all" });
                }}
                className={`mt-8 inline-flex items-center px-6 py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 ${colorsSporty.accentOrange} hover:${colorsSporty.accentOrangeHover}`}
              >
                <FiFilter className="mr-2" /> Borrar Filtros
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="field-list"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredFields.map((field, idx) => (
                <FieldCard key={field.id || field.name + idx} field={field} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
