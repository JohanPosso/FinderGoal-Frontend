import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiArrowLeft,
  FiShare2, // Added for share button (can be used later if needed)
  FiStar,
  FiCopy,
  FiDollarSign, // Added for price icon
} from "react-icons/fi";
import { FaFutbol, FaRegStar, FaStar } from "react-icons/fa";

// Re-using the color configuration from the Sporty & Energetic landing page
const colorsSporty = {
  primaryBg: "bg-gray-900",
  secondaryBg: "bg-gray-800",
  primaryText: "text-white",
  secondaryText: "text-gray-300",
  accentLime: "bg-lime-500 text-gray-900",
  accentLimeText: "text-lime-500",
  accentLimeHover: "bg-lime-400",
  accentOrange: "bg-orange-500 text-white",
  accentOrangeText: "text-orange-400",
  accentOrangeHover: "bg-orange-600",
  cardBg: "bg-gray-800",
  cardBorder: "border-gray-700",
  shadowPrimary: "shadow-xl",
  shadowAccent: "shadow-lime-500/30",
};

// Assuming api import is correct:
import api from "../utils/axios";

// Helper component for SkillLevel with 5 stars
function SkillLevel({ level }) {
  const stars = {
    beginner: 1,
    medium: 2,
    advanced: 3,
    competitive: 4,
    pro: 5, // Added 'pro' level for 5 stars
  };
  const numStars = stars[level] || 0; // Ensure numStars is a number

  return (
    <div className="flex items-center gap-1">
      <span
        className={`text-base ${colorsSporty.secondaryText} mr-2 font-medium`}
      >
        Nivel:
      </span>
      {[...Array(5)].map((_, i) => // Loop for 5 stars
        i < numStars ? (
          <FaStar key={i} className="text-amber-400 text-lg" />
        ) : (
          <FaRegStar key={i} className="text-gray-600 text-lg" />
        )
      )}
    </div>
  );
}

// Helper function to validate date
function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

// Helper component for DateBadge
function DateBadge({ date }) {
  const d = new Date(date);
  if (!isValidDate(d)) {
    return (
      <span
        className={`${colorsSporty.secondaryBg} ${colorsSporty.secondaryText} text-sm px-3 py-1.5 rounded-full font-bold uppercase border ${colorsSporty.cardBorder}`}
      >
        Sin fecha
      </span>
    );
  }
  if (isToday(d))
    return (
      <span
        className={`bg-lime-600 text-gray-900 text-sm px-3 py-1.5 rounded-full font-bold uppercase`}
      >
        Hoy
      </span>
    );
  if (isTomorrow(d))
    return (
      <span
        className={`bg-orange-500 text-white text-sm px-3 py-1.5 rounded-full font-bold uppercase`}
      >
        Mañana
      </span>
    );
  return (
    <span
      className={`${colorsSporty.secondaryBg} ${colorsSporty.secondaryText} text-sm px-3 py-1.5 rounded-full font-bold uppercase border ${colorsSporty.cardBorder}`}
    >
      {format(d, "dd MMM", { locale: es })}
    </span>
  );
}

// Component for check circle icon (used for copy confirmation)
const FaRegCheckCircle = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-circle-check"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);


export default function MatchDetail() {
  const { id } = useParams();
  const { user } = useStore();
  const [match, setMatch] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [codigoInput, setCodigoInput] = useState("");
  const [codigoError, setCodigoError] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [copied, setCopied] = useState(false); // State for copy feedback

  // Effect to fetch match data from the API
  React.useEffect(() => {
    const fetchMatch = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/matches/${id}`);
        const apiMatch = response.data;
        setMatch({
          id: apiMatch.id,
          title: apiMatch.titulo,
          fecha: apiMatch.fecha,
          hora: apiMatch.hora,
          location: apiMatch.direccion,
          creator: apiMatch.creador,
          players: apiMatch.jugadores,
          maxPlayers: apiMatch.maxPlayers,
          description: apiMatch.descripcion,
          price: apiMatch.precio,
          status: apiMatch.estado,
          isPrivate: apiMatch.privado,
          skillLevel: apiMatch.skillLevel,
          codigoPrivado: apiMatch.codigoPrivado,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching match:", err);
        setError("El partido solicitado no existe o fue eliminado.");
        setLoading(false);
      }
    };

    fetchMatch();
  }, [id]);

  // Loader if data is still loading
  if (loading) {
    return (
      <div
        className={`min-h-screen ${colorsSporty.primaryBg} ${colorsSporty.primaryText} flex items-center justify-center py-8 px-4 sm:px-6`}
      >
        <div
          className={`${colorsSporty.secondaryBg} rounded-xl ${colorsSporty.shadowPrimary} p-8 text-center border ${colorsSporty.cardBorder}`}
        >
          <h3 className="text-xl font-bold text-white mb-2">
            Cargando detalles del partido...
          </h3>
          <svg
            className="animate-spin h-10 w-10 text-lime-400 mx-auto mt-4"
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
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div
        className={`min-h-screen ${colorsSporty.primaryBg} ${colorsSporty.primaryText} flex items-center justify-center py-8 px-4 sm:px-6`}
      >
        <div
          className={`${colorsSporty.secondaryBg} rounded-xl ${colorsSporty.shadowPrimary} p-8 text-center border ${colorsSporty.cardBorder}`}
        >
          <h3 className="text-xl font-bold text-white mb-2">
            Partido no encontrado
          </h3>
          <p className={`${colorsSporty.secondaryText} mb-6`}>
            {error || "El partido solicitado no existe o fue eliminado."}
          </p>
          <Link
            to="/matches"
            className={`inline-flex items-center px-6 py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 ${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover}`}
          >
            <FiArrowLeft className="mr-2" /> Volver a Partidos
          </Link>
        </div>
      </div>
    );
  }

  // Ensure 'players' and 'maxPlayers' are safely accessed
  const currentPlayersCount = match?.players?.length || 0;
  const maxPlayersTotal = match?.maxPlayers || 0;
  const isFull = currentPlayersCount >= maxPlayersTotal;
  const dateBadge = match?.fecha ? <DateBadge date={match.fecha} /> : null;

  // Added for team split logic
  const playersPerTeam = Math.ceil(maxPlayersTotal / 2);
  const team1 = match.players.slice(0, playersPerTeam);
  const team2 = match.players.slice(playersPerTeam);

  const token = localStorage.getItem("token");

  const handleJoin = async () => {
    if (!user) {
      alert("Debes iniciar sesión para unirte a un partido.");
      return;
    }
    if (match.players.some((player) => player.id === user.id)) {
      alert("Ya estás unido a este partido.");
      return;
    }
    if (joinLoading) return;
    setJoinLoading(true);
    try {
      const response = await api.post(
        `/matches/${match.id}/join`,
        {
          userId: user.id,
          codigoPrivado: match.isPrivate ? codigoInput : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMatch((prevMatch) => ({
        ...prevMatch,
        players: response.data.players || prevMatch.players,
      }));
      setCodigoInput("");
      setCodigoError(""); // Clear error on successful join
    } catch (err) {
      console.error("Error joining match:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setCodigoError(err.response.data.message); // Show specific backend error
      } else {
        setCodigoError("No se pudo unir al partido. Inténtalo de nuevo.");
      }
    } finally {
      setJoinLoading(false);
    }
  };

  const isCreator = user && match.creator && match.creator.id === user.id;

  // Handle copy code action
  const handleCopyCode = () => {
    navigator.clipboard.writeText(match.codigoPrivado);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset state after 2 seconds
  };

  const creatorAvatar = match.creator?.avatar || "https://via.placeholder.com/150/0f172a/9ca3af?text=ORG";


  return (
    <div
      className={`min-h-screen ${colorsSporty.primaryBg} ${colorsSporty.primaryText} py-8 px-4 sm:px-6`}
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={`${colorsSporty.cardBg} rounded-2xl ${colorsSporty.shadowPrimary} overflow-hidden border ${colorsSporty.cardBorder}`}
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight">
                  {match.title}
                </h1>
                {match.isPrivate && (
                  <span className="inline-block bg-orange-600 text-white text-sm px-3 py-1 rounded-full font-bold uppercase">
                    Privado
                  </span>
                )}
                {!match.isPrivate && ( // Added public badge
                  <span className="inline-block bg-lime-600 text-gray-900 text-sm px-3 py-1 rounded-full font-bold uppercase">
                    Público
                  </span>
                )}
              </div>
              <Link
                to="/matches"
                className="p-2 rounded-full text-white hover:bg-gray-700 transition-colors"
              >
                <FiArrowLeft size={24} />
              </Link>
            </div>

            {/* Match Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center">
                <FiCalendar className={`${colorsSporty.accentLimeText} mr-3 text-xl`} />
                <div>
                  <p className={`${colorsSporty.secondaryText} text-sm`}>Fecha</p>
                  <p className={`${colorsSporty.primaryText} font-semibold`}>
                    {dateBadge}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <FiMapPin className={`${colorsSporty.accentLimeText} mr-3 text-xl`} />
                <div>
                  <p className={`${colorsSporty.secondaryText} text-sm`}>Ubicación</p>
                  <p className={`${colorsSporty.primaryText} font-semibold`}>
                    {match.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <FiUsers className={`${colorsSporty.accentLimeText} mr-3 text-xl`} />
                <div>
                  <p className={`${colorsSporty.secondaryText} text-sm`}>Jugadores</p>
                  <p className={`${colorsSporty.primaryText} font-semibold`}>
                    {currentPlayersCount}/{maxPlayersTotal}
                  </p>
                </div>
              </div>

              {match.price > 0 && (
                <div className="flex items-center">
                  <FaFutbol className={`${colorsSporty.accentLimeText} mr-3 text-xl`} />
                  <div>
                    <p className={`${colorsSporty.secondaryText} text-sm`}>Precio</p>
                    <p className={`${colorsSporty.primaryText} font-semibold`}>
                      ${match.price.toLocaleString('es-CO')} por jugador
                    </p>
                  </div>
                </div>
              )}
               {match.skillLevel && (
                 <div className="flex items-center">
                   <FiStar className={`${colorsSporty.accentLimeText} mr-3 text-xl`} />
                   <SkillLevel level={match.skillLevel} />
                 </div>
               )}
            </div>

            {/* Match Description */}
            {match.description && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Descripción
                </h3>
                <p className={`${colorsSporty.secondaryText} leading-relaxed`}>
                  {match.description}
                </p>
              </div>
            )}

            {/* INICIO - Sección de Jugadores Inscritos con visualización de equipos (ADAPTADO DEL DISEÑO 2) */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-white mb-5 text-center">
                ¡Conoce a los Jugadores!
              </h3>
              <div className="relative bg-gradient-to-b from-gray-700 to-gray-800 p-6 rounded-2xl border border-gray-700 shadow-inner">
                <div className="grid grid-cols-2 gap-4">
                  {/* Equipo 1 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col items-center bg-gray-900 p-4 rounded-lg border border-lime-500 shadow-lg"
                  >
                    <h4 className="font-bold text-xl text-lime-400 mb-4 flex items-center">
                      <div className="w-4 h-4 rounded-full bg-lime-500 mr-2 border border-gray-900"></div>
                      Equipo 1 ({team1.length}/{playersPerTeam})
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto custom-scrollbar w-full justify-items-center">
                      {team1.map((player, idx) => (
                        <motion.div
                          key={player.id || idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + idx * 0.05 }}
                          className="flex flex-col items-center text-center"
                        >
                          <img
                            src={
                              player.avatar ||
                              "https://via.placeholder.com/150/0f172a/9ca3af?text=JP"
                            }
                            alt={player.nombre || "Jugador"}
                            className="w-12 h-12 rounded-full object-cover border-2 border-lime-500 shadow-md"
                          />
                          <span className={`text-xs mt-1 font-semibold ${colorsSporty.primaryText}`}>
                            {player?.nombre ? player.nombre.split(" ")[0] : "Vacío"}
                          </span>
                        </motion.div>
                      ))}
                      {/* Placeholder para cupos vacíos en Equipo 1 */}
                      {[...Array(playersPerTeam - team1.length)].map((_, i) => (
                        <div key={`empty-1-${i}`} className="flex flex-col items-center text-center opacity-60">
                          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-500 border-2 border-gray-600">
                            <FiUsers size={20} />
                          </div>
                          <span className={`${colorsSporty.secondaryText} text-xs mt-1`}>Libre</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Equipo 2 */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center bg-gray-900 p-4 rounded-lg border border-orange-500 shadow-lg"
                  >
                    <h4 className="font-bold text-xl text-orange-400 mb-4 flex items-center">
                      <div className="w-4 h-4 rounded-full bg-orange-500 mr-2 border border-gray-900"></div>
                      Equipo 2 ({team2.length}/{playersPerTeam})
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto custom-scrollbar w-full justify-items-center">
                      {team2.map((player, idx) => (
                        <motion.div
                          key={player.id || idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + idx * 0.05 }}
                          className="flex flex-col items-center text-center"
                        >
                          <img
                            src={
                              player.avatar ||
                              "https://via.placeholder.com/150/0f172a/9ca3af?text=JP"
                            }
                            alt={player.nombre || "Jugador"}
                            className="w-12 h-12 rounded-full object-cover border-2 border-orange-500 shadow-md"
                          />
                          <span className={`text-xs mt-1 font-semibold ${colorsSporty.primaryText}`}>
                            {player?.nombre ? player.nombre.split(" ")[0] : "Vacío"}
                          </span>
                        </motion.div>
                      ))}
                      {/* Placeholder para cupos vacíos en Equipo 2 */}
                      {[...Array(playersPerTeam - team2.length)].map((_, i) => (
                        <div key={`empty-2-${i}`} className="flex flex-col items-center text-center opacity-60">
                          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-500 border-2 border-gray-600">
                            <FiUsers size={20} />
                          </div>
                          <span className={`${colorsSporty.secondaryText} text-xs mt-1`}>Libre</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
            {/* FIN - Sección de Jugadores Inscritos con visualización de equipos (ADAPTADO DEL DISEÑO 2) */}


            {match.isPrivate && isCreator && (
              <motion.div // Added motion for this section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 mb-6 p-5 rounded-xl border border-lime-500 bg-gray-800 flex flex-col items-start"
              >
                <span className="text-lime-400 font-bold text-lg mb-2 flex items-center">
                  <FiShare2 className="mr-2" /> Código privado para compartir:
                </span>
                <div className="flex items-center gap-3 w-full">
                  <span className="flex-grow text-2xl font-mono bg-gray-900 px-4 py-3 rounded-lg border border-lime-600 text-lime-400 select-all overflow-auto whitespace-nowrap">
                    {match.codigoPrivado || "N/A"}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className={`p-3 rounded-lg ${copied ? 'bg-green-500' : colorsSporty.accentLime} ${copied ? 'text-white' : colorsSporty.accentLimeText} font-bold transition-all duration-200`}
                    title="Copiar código"
                  >
                    {copied ? <FaRegCheckCircle size={20} /> : <FiCopy size={20} />}
                  </button>
                </div>
                <span className="text-sm text-gray-400 mt-2">
                  Comparte este código solo con quienes quieres que se unan.
                </span>
              </motion.div>
            )}

            {match.isPrivate && !isCreator && !isFull && !match.players.some((player) => player.id === user?.id) && (
              <motion.div // Added motion for this section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 mb-6 p-5 rounded-xl border border-orange-500 bg-gray-800 flex flex-col items-start"
              >
                <label htmlFor="codigoInput" className="text-orange-400 font-bold text-lg mb-2">
                  ¿Tienes un código privado para unirte?
                </label>
                <div className="flex gap-3 items-center w-full">
                  <input
                    type="text"
                    id="codigoInput"
                    value={codigoInput}
                    onChange={e => {
                      setCodigoInput(e.target.value.toUpperCase());
                      setCodigoError(""); // Clear error on typing
                    }}
                    placeholder="Ingresa el código aquí"
                    className="flex-grow px-4 py-3 rounded-lg bg-gray-900 border border-orange-600 text-orange-400 font-mono text-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    maxLength={10}
                    disabled={joinLoading}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-3 rounded-lg font-bold text-lg uppercase tracking-wide transition-all duration-300 ${colorsSporty.accentOrange} hover:${colorsSporty.accentOrangeHover} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                    onClick={handleJoin}
                    disabled={joinLoading || !codigoInput}
                  >
                    {joinLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                        Uniendo...
                      </>
                    ) : (
                      "Unirse"
                    )}
                  </motion.button>
                </div>
                {codigoError && <span className="text-red-400 text-sm mt-2">{codigoError}</span>}
              </motion.div>
            )}

            {/* Status messages for user */}
            <div className="mt-8">
              {!isCreator && !isFull && !match.isPrivate && user && !match.players.some((player) => player.id === user.id) && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full py-4 rounded-lg font-bold text-xl uppercase tracking-wide transition-all duration-300 ${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover} ${joinLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={handleJoin}
                  disabled={joinLoading}
                >
                  {joinLoading ? "Uniéndote al Partido..." : "¡Unirme al Partido!"}
                </motion.button>
              )}

              {!user && (
                <p className={`${colorsSporty.secondaryText} text-center mt-8 text-lg`}>
                  <Link to="/login" className={`${colorsSporty.accentLimeText} hover:underline font-bold`}>Inicia sesión</Link> para unirte o gestionar partidos.
                </p>
              )}

              {isCreator && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className={`${colorsSporty.secondaryText} text-center mt-8 text-lg bg-lime-700 p-3 rounded-lg font-bold text-white`}
                >
                  ¡Eres el <span className="font-bold text-white">creador</span> de este partido! Gestiona los detalles arriba.
                </motion.p>
              )}

              {isFull && !isCreator && !match.players.some((player) => player.id === user?.id) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className={`${colorsSporty.secondaryText} text-center mt-8 text-lg bg-red-700 p-3 rounded-lg font-bold text-white`}
                >
                  ¡Uy! Este partido está <span className="font-bold text-white">lleno</span>. ¡No te desanimes, busca otros o únete a la lista de espera!
                </motion.p>
              )}

              {match.players.some((player) => player.id === user?.id) && !isCreator && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className={`${colorsSporty.secondaryText} text-center mt-8 text-lg bg-lime-700 p-3 rounded-lg font-bold text-white`}
                >
                  ¡Ya estás <span className="font-bold text-white">inscrito</span> en este partido! ¡A darlo todo en la cancha!
                </motion.p>
              )}
            </div>
          </div>

          {/* Footer del detalle del partido */}
          <div
            className={`${colorsSporty.secondaryBg} px-8 py-5 border-t ${colorsSporty.cardBorder} flex flex-col sm:flex-row justify-between items-center gap-4`}
          >
            <div className="flex items-center">
              <img
                src={creatorAvatar}
                alt={match.creator?.nombre || "Organizador"}
                className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-lime-500"
              />
              <div className={`text-sm ${colorsSporty.secondaryText}`}>
                Creado por{" "}
                <span className="font-semibold text-white">
                  {match.creator?.nombre || "Desconocido"}
                </span>
              </div>
            </div>
            {/* Added Share Button for all users */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center px-4 py-2 rounded-lg font-bold text-base transition-all duration-300 ${colorsSporty.accentOrange} hover:${colorsSporty.accentOrangeHover}`}
              onClick={() => navigator.share && navigator.share({
                title: match.title,
                text: `¡Únete a mi partido de fútbol! ${match.title} en ${match.location}.`, // Simplified text for sharing
                url: window.location.href, // Current URL of the match
              }).catch((error) => console.log('Error al compartir', error))}
            >
              <FiShare2 className="mr-2" /> Compartir Partido
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}