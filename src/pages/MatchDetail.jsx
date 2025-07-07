import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  FiX,
  FiInfo,
  FiLock,
} from "react-icons/fi";
import { FaFutbol, FaRegStar, FaStar } from "react-icons/fa";
import { getAvatarUrl } from "../utils/helpers";

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
  const navigate = useNavigate();

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
          jugadoresInvitados: apiMatch.jugadoresInvitados,
          jugadoresReserva: apiMatch.jugadoresReserva,
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

  // Obtener la lista de jugadores: reales y luego invitados
  const jugadoresInvitados = match.jugadoresInvitados || [];
  const jugadoresReales = match.players || [];
  // Mezclar: primero los reales, luego los invitados
  const jugadores = [
    ...jugadoresReales,
    ...jugadoresInvitados.map(nombre => ({ nombre }))
  ];

  const maxPlayersTotal = match?.maxPlayers || 0;
  const plazasOcupadas = jugadores.length;
  const plazasLibres = Math.max(0, maxPlayersTotal - plazasOcupadas);
  const isFull = plazasLibres === 0;
  const dateBadge = match?.fecha ? <DateBadge date={match.fecha} /> : null;

  // Lógica de equipos
  const playersPerTeam = Math.ceil(maxPlayersTotal / 2);
  const team1 = jugadores.slice(0, playersPerTeam);
  const team2 = jugadores.slice(playersPerTeam, maxPlayersTotal);

  const token = localStorage.getItem("token");

  const handleJoin = async () => {
    if (!user) {
      return;
    }
    if (match.players.some((player) => player.id === user.id)) {
      return;
    }
    if (joinLoading) return;
    setJoinLoading(true);
    try {
      const isUserCreator = user && match.creator && match.creator.id === user.id;
      const joinPayload = {
        userId: user.id,
      };
      if (match.isPrivate && !isUserCreator) {
        joinPayload.codigoPrivado = codigoInput;
      }
      const response = await api.post(
        `/matches/${match.id}/join`,
        joinPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Actualiza todo el objeto match con la respuesta del backend
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
        jugadoresInvitados: apiMatch.jugadoresInvitados,
        jugadoresReserva: apiMatch.jugadoresReserva,
      });
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

  // Nueva función para unirse a la lista de espera
  const handleJoinWaitlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (joinLoading) return;
    setJoinLoading(true);
    try {
      // Usar el mismo endpoint que handleJoin, pero con waitlist: true
      const response = await api.post(
        `/matches/${match.id}/join`,
        {
          userId: user.id,
          waitlist: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Actualiza el estado local para reflejar la reserva
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
        jugadoresInvitados: apiMatch.jugadoresInvitados,
        jugadoresReserva: apiMatch.jugadoresReserva,
      });
    } catch (err) {
    } finally {
      setJoinLoading(false);
    }
  };

  // Nueva función para salirse del partido o reserva
  const handleLeaveMatch = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setJoinLoading(true);
    try {
      const response = await api.post(`/matches/${match.id}/leave`, {
        userId: user.id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
        jugadoresInvitados: apiMatch.jugadoresInvitados,
        jugadoresReserva: apiMatch.jugadoresReserva,
      });
    } catch (err) {
      // Manejo de error opcional
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

  const creatorAvatar = match.creator?.avatar || getAvatarUrl();


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
              </div>
              <Link
                to="/matches"
                className="p-2 rounded-full text-white hover:bg-gray-700 transition-colors"
              >
                <FiArrowLeft size={24} />
              </Link>
            </div>

            {/* NUEVO DISEÑO TARJETA HORIZONTAL - Datos principales del partido */}
            <div className="relative max-w-4xl w-full bg-gray-900 rounded-2xl shadow-xl p-4 sm:p-6 mb-8">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:divide-x divide-gray-700">
                {/* Columna 1 */}
                {/* Fecha */}
                <li className="flex items-center gap-4 py-4">
                  <div className="bg-lime-700/30 rounded-full p-3">
                    <FiCalendar className="text-lime-400 text-2xl" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Fecha</div>
                    <div className="font-bold text-lg">{dateBadge}</div>
                  </div>
                </li>
                {/* Columna 2 */}
                {/* Ubicación */}
                <li className="flex items-center gap-4 py-4">
                  <div className="bg-lime-700/30 rounded-full p-3">
                    <FiMapPin className="text-lime-400 text-2xl" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Ubicación</div>
                    <div className="font-bold text-lg">{match.location}</div>
                  </div>
                </li>
                {/* Columna 1 */}
                {/* Jugadores */}
                <li className="flex items-center gap-4 py-4">
                  <div className="bg-lime-700/30 rounded-full p-3">
                    <FiUsers className="text-lime-400 text-2xl" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Jugadores</div>
                    <div className="font-bold text-lg">{plazasOcupadas}/{maxPlayersTotal}</div>
                  </div>
                </li>
                {/* Columna 2 */}
                {/* Precio */}
                {match.price > 0 ? (
                  <li className="flex items-center gap-4 py-4">
                    <div className="bg-lime-700/30 rounded-full p-3">
                      <FaFutbol className="text-lime-400 text-2xl" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Precio</div>
                      <div className="font-bold text-lg">${match.price.toLocaleString('es-CO')} por jugador</div>
                    </div>
                  </li>
                ) : (
                  <li></li>
                )}
                {/* Columna 1 */}
                {/* Acceso (Privado/Público) */}
                <li className="flex items-center gap-4 py-4">
                  <div className={`rounded-full p-3 mt-1 ${match.isPrivate ? 'bg-orange-600/30' : 'bg-lime-600/30'}`}> 
                    <FiLock className={`text-2xl ${match.isPrivate ? 'text-orange-400' : 'text-lime-400'}`} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Acceso</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${match.isPrivate ? 'bg-orange-600 text-white' : 'bg-lime-600 text-gray-900'}`}>{match.isPrivate ? 'Privado' : 'Público'}</span>
                  </div>
                </li>
                {/* Columna 2 */}
                {/* Nivel */}
                {match.skillLevel ? (
                  <li className="flex items-center gap-4 py-4">
                    <div className="bg-lime-700/30 rounded-full p-3">
                      <FiStar className="text-lime-400 text-2xl" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Nivel</div>
                      <SkillLevel level={match.skillLevel} />
                    </div>
                  </li>
                ) : (
                  <li></li>
                )}
                {/* Descripción (abajo, ambas columnas) */}
                {match.description && (
                  <li className="md:col-span-2 flex items-start gap-4 py-4">
                    <div className="bg-lime-700/30 rounded-full p-3 mt-1">
                      <FiInfo className="text-lime-400 text-2xl" />
                    </div>
                    <div className="w-full">
                      <div className="text-xs text-gray-400 mb-1">Descripción</div>
                      <div className="text-gray-200 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {match.description}
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
            {/* FIN NUEVO DISEÑO TARJETA HORIZONTAL */}

            {/* INICIO - Sección de Jugadores Inscritos con visualización de equipos (ADAPTADO DEL DISEÑO 2) */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-white mb-5 text-center">
                ¡Conoce a los Jugadores!
              </h3>
              <div className="relative bg-gradient-to-b from-gray-700 to-gray-800 p-4 sm:p-6 rounded-2xl border border-gray-700 shadow-inner">
                {/* Layout responsive: flex-col en móviles, grid en desktop */}
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6">
                  {/* Equipo 1 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col items-center bg-gray-900 p-3 sm:p-4 rounded-lg border border-lime-500 shadow-lg"
                  >
                    <h4 className="font-bold text-lg sm:text-xl text-lime-400 mb-3 sm:mb-4 flex items-center text-center">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-lime-500 mr-2 border border-gray-900 flex-shrink-0"></div>
                      <span className="text-sm sm:text-base">Equipo 1 ({team1.length}/{playersPerTeam})</span>
                    </h4>
                    {/* Grid responsive para jugadores */}
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 gap-2 sm:gap-3 max-h-40 sm:max-h-48 overflow-y-auto scrollbar-none w-full justify-items-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {team1.map((player, idx) => (
                        <motion.div
                          key={player.id || player.nombre || idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + idx * 0.05 }}
                          className="flex flex-col items-center text-center relative group"
                        >
                          <img
                            src={player.avatar || getAvatarUrl()}
                            alt={player.nombre || "Jugador"}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-lime-500 shadow-md"
                          />
                          <span className={`text-xs mt-1 font-semibold ${colorsSporty.primaryText} max-w-full truncate`}>
                            {player?.nombre ? player.nombre.split(" ")[0] : typeof player === 'string' ? player.split(" ")[0] : "Vacío"}
                          </span>
                          {/* Botón salir solo para el usuario en sesión */}
                          {player.id === user?.id && (
                            <div
                              className="absolute -top-2 -right-2 z-10 flex items-center justify-center"
                              style={{ width: 24, height: 24 }}
                            >
                              <button
                                onClick={handleLeaveMatch}
                                title="Salir del partido"
                                className="bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 text-xs shadow group-hover:opacity-100 opacity-80 transition-opacity flex items-center justify-center"
                                style={{ width: 20, height: 20 }}
                                disabled={joinLoading}
                              >
                                <FiX size={11} />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                      {/* Placeholder para cupos vacíos en Equipo 1 */}
                      {[...Array(playersPerTeam - team1.length)].map((_, i) => (
                        <div key={`empty-1-${i}`} className="flex flex-col items-center text-center opacity-60">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-500 border-2 border-gray-600">
                            <FiUsers size={16} className="sm:w-5 sm:h-5" />
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
                    className="flex flex-col items-center bg-gray-900 p-3 sm:p-4 rounded-lg border border-orange-500 shadow-lg"
                  >
                    <h4 className="font-bold text-lg sm:text-xl text-orange-400 mb-3 sm:mb-4 flex items-center text-center">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-orange-500 mr-2 border border-gray-900 flex-shrink-0"></div>
                      <span className="text-sm sm:text-base">Equipo 2 ({team2.length}/{playersPerTeam})</span>
                    </h4>
                    {/* Grid responsive para jugadores */}
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 gap-2 sm:gap-3 max-h-40 sm:max-h-48 overflow-y-auto scrollbar-none w-full justify-items-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {team2.map((player, idx) => (
                        <motion.div
                          key={player.id || player.nombre || idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + idx * 0.05 }}
                          className="flex flex-col items-center text-center relative group"
                        >
                          <img
                            src={player.avatar || getAvatarUrl()}
                            alt={player.nombre || "Jugador"}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-orange-500 shadow-md"
                          />
                          <span className={`text-xs mt-1 font-semibold ${colorsSporty.primaryText} max-w-full truncate`}>
                            {player?.nombre ? player.nombre.split(" ")[0] : typeof player === 'string' ? player.split(" ")[0] : "Vacío"}
                          </span>
                          {/* Botón salir solo para el usuario en sesión */}
                          {player.id === user?.id && (
                            <div
                              className="absolute -top-2 -right-2 z-10 flex items-center justify-center"
                              style={{ width: 24, height: 24 }}
                            >
                              <button
                                onClick={handleLeaveMatch}
                                title="Salir del partido"
                                className="bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 text-xs shadow group-hover:opacity-100 opacity-80 transition-opacity flex items-center justify-center"
                                style={{ width: 20, height: 20 }}
                                disabled={joinLoading}
                              >
                                <FiX size={11} />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                      {/* Placeholder para cupos vacíos en Equipo 2 */}
                      {[...Array(playersPerTeam - team2.length)].map((_, i) => (
                        <div key={`empty-2-${i}`} className="flex flex-col items-center text-center opacity-60">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-500 border-2 border-gray-600">
                            <FiUsers size={16} className="sm:w-5 sm:h-5" />
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

            {/* Lista de Reserva */}
            {Array.isArray(match.jugadoresReserva) && match.jugadoresReserva.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-10 mb-8 p-6 rounded-2xl border-2 border-orange-400 bg-gray-900 shadow-lg"
              >
                <h3 className="text-2xl font-extrabold text-orange-400 mb-4 flex items-center gap-2">
                  <FiUsers className="text-orange-400 text-2xl" /> Lista de Reserva
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 gap-2 sm:gap-3 max-h-44 overflow-y-auto pr-2 scrollbar-none justify-items-center items-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {match.jugadoresReserva.map((reserva, idx) => (
                    <div key={reserva.id || reserva.nombre || idx} className="flex flex-col items-center relative group">
                      <div className="relative">
                        <img
                          src={reserva.avatar || getAvatarUrl()}
                          alt={reserva.nombre || 'Reserva'}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-orange-400 shadow-md"
                        />
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg border border-orange-700">Reserva</span>
                        {/* Botón salir solo para el usuario en sesión */}
                        {reserva.id === user?.id && (
                          <div
                            className="absolute -top-2 -right-2 z-10 flex items-center justify-center"
                            style={{ width: 24, height: 24 }}
                          >
                            <button
                              onClick={handleLeaveMatch}
                              title="Salir de la reserva"
                              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 text-xs shadow group-hover:opacity-100 opacity-80 transition-opacity flex items-center justify-center"
                              style={{ width: 20, height: 20 }}
                              disabled={joinLoading}
                            >
                              <FiX size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                      <span className="mt-1 text-xs font-semibold text-orange-200 max-w-full truncate text-center">
                        {reserva.id === user?.id
                          ? (user.name?.split(' ')[0] || user.nombre?.split(' ')[0] || user.name || user.nombre || 'Tú')
                          : (reserva.name?.split(' ')[0] || reserva.nombre?.split(' ')[0] || reserva.name || reserva.nombre || 'Invitado')}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

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
                    className={`p-3 rounded-lg font-bold transition-all duration-200 ${
                      copied
                        ? 'bg-green-500 text-white'
                        : colorsSporty.accentLime
                    }`}
                    title="Copiar código"
                  >
                    {copied
                      ? <FaRegCheckCircle size={20} className="text-white" />
                      : <FiCopy size={20} className="text-gray-900" />}
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
              {/* Botón Unirme solo si hay plazas libres y el usuario no está inscrito */}
              {!isFull && user && !jugadoresReales.some((player) => player.id === user.id) && (
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

              {/* Si no hay usuario, mostrar link a login para unirse */}
              {!user && !isFull && (
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

              {isFull && !isCreator && !match.players.some((player) => player.id === user?.id) &&
                // Oculta el mensaje si el usuario ya está en la lista de reserva
                !(Array.isArray(match.jugadoresReserva) && match.jugadoresReserva.some(reserva => reserva.id === user?.id)) && (
                  <>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className={`${colorsSporty.secondaryText} text-center mt-8 text-lg bg-red-700 p-3 rounded-lg font-bold text-white`}
                    >
                      ¡Uy! Este partido está <span className="font-bold text-white">lleno</span>. ¡No te desanimes, busca otros o únete a la lista de espera!
                    </motion.p>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.98 }}
                      className={`mx-auto mt-4 flex items-center gap-2 px-5 py-2 rounded-full font-bold text-base uppercase tracking-wide transition-all duration-300 ${colorsSporty.accentOrange} hover:${colorsSporty.accentOrangeHover} shadow-md ${joinLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                      style={{ minWidth: 'unset', maxWidth: 260 }}
                      onClick={handleJoinWaitlist}
                      disabled={joinLoading}
                    >
                      <FiUsers className="text-lg mr-1" />
                      {joinLoading ? "Uniéndote..." : "Unirme a la reserva"}
                    </motion.button>
                  </>
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