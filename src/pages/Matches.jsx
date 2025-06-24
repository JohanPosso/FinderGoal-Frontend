import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore"; // Assuming this path is correct
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { FiCalendar, FiMapPin, FiUsers, FiPlus } from "react-icons/fi";
import { FaFutbol } from "react-icons/fa";
import { motion } from "framer-motion"; // For subtle animations
import api from "../utils/axios";

// Re-using the color configuration from the Sporty & Energetic landing page
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

export default function Matches() {
  const { matches: storeMatches } = useStore(); // Access your matches from the store
  const [matches, setMatches] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  useEffect(() => {
    // Fetch matches from API on component mount
    const fetchMatches = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/matches"); // Adjust the endpoint as needed
        setMatches(res.data);
      } catch (err) {
        setError("No se pudieron cargar los partidos.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div
      className={`${colorsSporty.primaryBg} min-h-screen py-10 px-6 ${colorsSporty.primaryText}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Encabezado de la página */}
        <div className="flex justify-between items-center mb-10">
          <motion.h1
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-white leading-tight"
          >
            Partidos{" "}
            <span className={colorsSporty.accentLimeText}>Activos</span>
          </motion.h1>
          <Link to="/create-match">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center px-8 py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 ${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover} ${colorsSporty.shadowAccent}`}
            >
              <FiPlus className="mr-3 text-2xl" /> Crear partido
            </motion.button>
          </Link>
        </div>

        {/* Contenido principal de partidos */}
        {loading ? (
          <div className="text-center text-lg text-gray-300 py-12">
            Cargando partidos...
          </div>
        ) : error ? (
          <div className="text-center text-lg text-red-400 py-12">{error}</div>
        ) : matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${colorsSporty.secondaryBg} rounded-xl ${colorsSporty.shadowPrimary} p-12 text-center ${colorsSporty.secondaryText} border ${colorsSporty.cardBorder}`}
          >
            <FaFutbol className="text-8xl mx-auto mb-6 opacity-30 text-lime-500" />
            <p className="text-xl font-semibold mb-3">
              ¡No hay partidos programados todavía!
            </p>
            <p className="text-lg">
              Sé el primero en crear uno y empieza a jugar.
            </p>
            <Link to="/create-match">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`mt-8 inline-flex items-center px-6 py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 ${colorsSporty.accentOrange} hover:${colorsSporty.accentOrangeHover}`}
              >
                <FiPlus className="mr-2" /> Crear mi primer partido
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {matches.map((match) => (
              <motion.div
                key={match.id}
                variants={itemVariants}
                whileHover={{ y: -8, boxShadow: "0 12px 24px rgba(0,0,0,0.4)" }}
                className={`block ${colorsSporty.cardBg} rounded-2xl ${colorsSporty.shadowPrimary} hover:shadow-2xl transition p-7 border ${colorsSporty.cardBorder} border-b-4 border-lime-500`}
              >
                <Link to={`/matches/${match.id}`} className="block">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-extrabold ${colorsSporty.primaryText} truncate pr-4 leading-tight">
                      {match.titulo}
                    </h2>
                    <span
                      className={`text-xs ${colorsSporty.accentOrange} px-3 py-1.5 rounded-full font-bold uppercase`}
                    >
                      {/* Mostrar fecha y hora como string, sin crear Date para la hora */}
                      {format(parseISO(match.fecha), "dd MMM", { locale: es })},{" "}
                      {match.hora}
                    </span>
                  </div>
                  <div
                    className={`flex items-center ${colorsSporty.secondaryText} mb-2 text-lg`}
                  >
                    <FiMapPin
                      className={`mr-3 ${colorsSporty.accentLimeText} text-xl`}
                    />
                    <span className="truncate">{match.ubicacionNombre}</span>
                  </div>
                  <div
                    className={`flex items-center ${colorsSporty.secondaryText} mb-2 text-lg`}
                  >
                    <FiUsers
                      className={`mr-3 ${colorsSporty.accentLimeText} text-xl`}
                    />
                    <span>
                      <span className="font-semibold text-lime-400">
                        {match.jugadores?.length || 0}
                      </span>
                      /{match.maxPlayers} jugadores
                    </span>
                  </div>
                  {match.descripcion && (
                    <div
                      className={`text-sm ${colorsSporty.secondaryText} mt-4 line-clamp-2 leading-relaxed opacity-90`}
                    >
                      {match.descripcion}
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
