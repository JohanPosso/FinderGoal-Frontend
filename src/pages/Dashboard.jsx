import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore"; // Assuming this path is correct for your store
import { format, isFuture, isPast } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlusCircle,
  FiEdit,
  FiTrash2,
  FiEye,
  FiLogOut,
  FiUser,
  FiZap, // For active/upcoming matches
  FiCheckCircle, // For past matches
  FiInfo, // For empty state
  FiCalendar, // <--- Agregado
  FiMapPin, // <--- Agregado
  FiUsers, // <--- Agregado
} from "react-icons/fi";
import { FaFutbol } from "react-icons/fa"; // For general sports theme
import api from "../utils/axios";

// Re-using the color configuration from the Sporty & Energetic theme
const colorsSporty = {
  primaryBg: "bg-gray-900", // Fondo oscuro principal
  secondaryBg: "bg-gray-800", // Fondo secundario para tarjetas/secciones
  primaryText: "text-white", // Texto principal
  secondaryText: "text-gray-300", // Texto secundario/descriptivo
  accentLime: "bg-lime-500 text-gray-900", // Verde lima brillante para botones/acentos
  accentLimeText: "text-lime-500", // Color de texto lima
  accentLimeHover: "bg-lime-400",
  accentOrange: "bg-orange-500 text-white", // Naranja intenso para botones secundarios/acentos
  accentOrangeText: "text-orange-400", // Color de texto naranja
  accentOrangeHover: "bg-orange-600",
  cardBg: "bg-gray-800", // Fondo de las tarjetas
  cardBorder: "border-gray-700", // Borde de las tarjetas
  shadowPrimary: "shadow-xl",
  shadowAccent: "shadow-lime-500/30", // Sombra con tinte de acento
  success: "text-green-500",
  danger: "text-red-500",
  info: "text-blue-400",
};

// --- Sub-component: MatchCard ---
function MatchCard({ match, onView, onEdit, onDelete, user, isPastMatch }) {
  const isCreator = user && match.creator && user.id === match.creator.id;

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <motion.div
      variants={cardVariants}
      layout // Enable layout animations for list changes
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`${colorsSporty.secondaryBg} rounded-2xl p-6 ${colorsSporty.shadowPrimary} border ${colorsSporty.cardBorder} flex flex-col`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3
          className={`text-xl font-bold ${colorsSporty.primaryText} truncate pr-4`}
        >
          {match.title}
        </h3>
        {isCreator && (
          <span
            className={`text-xs ${colorsSporty.accentLime} px-2 py-1 rounded-full font-bold uppercase`}
          >
            Creador
          </span>
        )}
      </div>

      <div className={`flex items-center ${colorsSporty.secondaryText} mb-2`}>
        <FiCalendar className={`mr-2 ${colorsSporty.accentLimeText}`} />
        <span>
          {format(new Date(match.date), "dd MMM yyyy, HH:mm", { locale: es })}
        </span>
      </div>
      <div className={`flex items-center ${colorsSporty.secondaryText} mb-4`}>
        <FiMapPin className={`mr-2 ${colorsSporty.accentLimeText}`} />
        <span>{match.location}</span>
      </div>

      <div className="flex-grow">
        <p
          className={`${colorsSporty.secondaryText} text-sm mb-4 line-clamp-2`}
        >
          {match.description || "Sin descripción."}
        </p>
      </div>

      <div className="flex justify-between items-center mt-auto border-t border-gray-700 pt-4">
        <span className={`${colorsSporty.accentLimeText} text-lg font-bold`}>
          {match.players?.length || 0}/{match.maxPlayers}{" "}
          <FiUsers className="inline-block ml-1 text-xl" />
        </span>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onView(match.id)}
            className={`${colorsSporty.accentLime} text-sm px-4 py-2 rounded-lg font-semibold flex items-center shadow-md hover:${colorsSporty.accentLimeHover} transition`}
          >
            <FiEye className="mr-1" /> Ver
          </motion.button>
          {isCreator && !isPastMatch && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(match.id)}
              className={`${colorsSporty.accentOrange} text-sm px-4 py-2 rounded-lg font-semibold flex items-center shadow-md hover:${colorsSporty.accentOrangeHover} transition`}
            >
              <FiEdit className="mr-1" /> Editar
            </motion.button>
          )}
          {isCreator && ( // Allow creator to delete any match
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(match.id)}
              className={`bg-red-600 text-white text-sm px-4 py-2 rounded-lg font-semibold flex items-center shadow-md hover:bg-red-700 transition`}
            >
              <FiTrash2 className="mr-1" /> Eliminar
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// --- Main Component: ProfileDashboard ---
export default function ProfileDashboard() {
  const { user, matches, logout, deleteMatch, updateUser } = useStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("myMatches"); // 'myMatches', 'joinedMatches', 'pastMatches'
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyMatches, setHistoryMatches] = useState([]); // Nuevo estado para historial
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState("");
  const [myMatches, setMyMatches] = useState([]);
  const [loadingMyMatches, setLoadingMyMatches] = useState(false);
  const [errorMyMatches, setErrorMyMatches] = useState("");

  // Usar directamente el usuario del estado global
  useEffect(() => {
    if (user) {
      setUserData(user);
      setEditNombre(user.nombre || user.name || "");
      setEditEmail(user.email || "");
      setEditAvatar(user.avatar || "");
      setLoading(false);
    }
  }, [user]);

  // Cargar historial solo cuando se selecciona la pestaña
  useEffect(() => {
    const fetchHistory = async () => {
      if (activeTab === "pastMatches" && user) {
        setLoadingHistory(true);
        setErrorHistory("");
        try {
          const res = await api.get(`/users/${user.id}/historial`);
          // Normalizar los datos para que coincidan con MatchCard
          const normalized = res.data.map((m) => ({
            ...m,
            date: m.fecha || m.date,
            title: m.titulo || m.title,
            location: m.direccion || m.location,
            description: m.descripcion || m.description,
            maxPlayers: m.maxPlayers,
            players: m.players || [], // Si no viene, poner array vacío
            creator: m.creador || m.creator,
          }));
          setHistoryMatches(normalized);
        } catch (err) {
          setErrorHistory("No se pudo cargar el historial de partidos.");
        } finally {
          setLoadingHistory(false);
        }
      }
    };
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  // Cargar partidos creados por mí solo cuando se selecciona la pestaña
  useEffect(() => {
    const fetchMyMatches = async () => {
      if (activeTab === "myMatches" && user) {
        setLoadingMyMatches(true);
        setErrorMyMatches("");
        try {
          const res = await api.get(`/users/${user.id}/mine`);
          // Normalizar los datos para que coincidan con MatchCard
          const normalized = res.data.map((m) => ({
            ...m,
            date: m.fecha || m.date,
            title: m.titulo || m.title,
            location: m.direccion || m.location,
            description: m.descripcion || m.description,
            maxPlayers: m.maxPlayers,
            players: m.jugadores || m.players || [],
            creator: user, // El usuario actual es el creador
          }));
          setMyMatches(normalized);
        } catch (err) {
          setErrorMyMatches("No se pudo cargar tus partidos creados.");
        } finally {
          setLoadingMyMatches(false);
        }
      }
    };
    fetchMyMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  // Si quieres recargar desde la API tras editar, puedes hacerlo en handleUpdate
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const id = userData.id;
      const res = await api.put(`/users/${id}`, {
        nombre: editNombre,
        email: editEmail,
        avatar: editAvatar || null,
      });
      setUserData(res.data);
      setEditMode(false);
      if (res.data) {
        updateUser(res.data); // Actualiza el usuario global y localStorage
      }
    } catch (err) {
      setError("No se pudo actualizar el perfil.");
    }
  };

  if (!user) {
    navigate("/login"); // Redirect to login if no user is logged in
    return null;
  }

  const userMatches = matches.filter((match) => match.creator?.id === user.id);
  const userJoinedMatches = matches.filter(
    (match) =>
      match.players.some((player) => player.id === user.id) &&
      match.creator?.id !== user.id // Exclude matches they created
  );

  const upcomingCreatedMatches = userMatches.filter((match) =>
    isFuture(new Date(match.date))
  );
  const pastCreatedMatches = userMatches.filter((match) =>
    isPast(new Date(match.date))
  );

  const upcomingJoinedMatches = userJoinedMatches.filter((match) =>
    isFuture(new Date(match.date))
  );
  const pastJoinedMatches = userJoinedMatches.filter((match) =>
    isPast(new Date(match.date))
  );

  const handleDeleteMatch = (matchId) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este partido? Esta acción es irreversible."
      )
    ) {
      deleteMatch(matchId);
    }
  };

  const handleViewMatch = (matchId) => {
    navigate(`/matches/${matchId}`);
  };

  const handleEditMatch = (matchId) => {
    // Implement edit logic, maybe navigate to a /edit-match/:id route
    // For now, let's just navigate to create, and you'd load the match data there
    alert(`Funcionalidad de edición para el partido ID: ${matchId}`);
    // navigate(`/create-match?edit=${matchId}`); // Example of passing edit param
  };

  const currentTabMatches = () => {
    if (activeTab === "myMatches") return myMatches;
    if (activeTab === "joinedMatches") return upcomingJoinedMatches;
    if (activeTab === "pastMatches") return historyMatches;
    return [];
  };
  console.log(userData, "userdata xxxxxxx");
  return (
    <div
      className={`${colorsSporty.primaryBg} min-h-screen py-10 px-6 ${colorsSporty.primaryText}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-gray-700"
        >
          <div className="flex items-center mb-6 md:mb-0">
            {userData?.avatar ? (
              <img
                src={userData.avatar}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-lime-500 mr-6"
              />
            ) : (
              <FiUser
                className={`text-7xl ${colorsSporty.accentLimeText} mr-6`}
              />
            )}
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Mi <span className={colorsSporty.accentLimeText}>Perfil</span>
              </h1>
              {loading ? (
                <p className={`${colorsSporty.secondaryText} text-lg mt-1`}>
                  Cargando...
                </p>
              ) : error ? (
                <p className="text-red-400 text-lg mt-1">{error}</p>
              ) : (
                <>
                  <p className={`${colorsSporty.secondaryText} text-lg mt-1`}>
                    <span className="font-semibold text-white">
                      {userData?.nombre}
                    </span>
                  </p>
                  <p className={`${colorsSporty.secondaryText} text-md mt-1`}>
                    {userData?.email}
                  </p>
                  <p className={`${colorsSporty.secondaryText} text-sm mt-1`}>
                    Registrado:{" "}
                    {userData?.fechaRegistro &&
                      new Date(userData.fechaRegistro).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setEditMode((v) => !v)}
              className={`inline-flex items-center px-4 py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 ${colorsSporty.accentOrange} hover:${colorsSporty.accentOrangeHover}`}
            >
              <FiEdit className="mr-2" />{" "}
              {editMode ? "Cancelar" : "Editar Perfil"}
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className={`inline-flex items-center px-4 py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 bg-red-600 text-white hover:bg-red-700`}
            >
              <FiLogOut className="mr-2" /> Salir
            </motion.button>
          </div>
        </motion.div>

        {/* Formulario de edición */}
        {editMode && (
          <form
            onSubmit={handleUpdate}
            className="mb-10 bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 max-w-lg mx-auto"
          >
            <h2 className="text-2xl font-bold mb-6 text-white">
              Editar Perfil
            </h2>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Nombre</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-500"
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-500"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">
                Foto de perfil (URL)
              </label>
              <input
                type="url"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-500"
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <button
              type="submit"
              className={`w-full mt-4 ${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover} text-lg font-bold py-3 rounded-lg transition-all duration-300`}
            >
              Guardar Cambios
            </button>
            {error && <p className="text-red-400 mt-4">{error}</p>}
          </form>
        )}

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <button
            onClick={() => setActiveTab("myMatches")}
            className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-300
              ${
                activeTab === "myMatches"
                  ? `${colorsSporty.accentOrange} shadow-lg`
                  : `${colorsSporty.secondaryBg} ${
                      colorsSporty.secondaryText
                    } hover:${colorsSporty.accentOrangeHover.replace(
                      "bg-",
                      "text-"
                    )}`
              } `}
          >
            <FiZap className="inline-block mr-2 text-xl" /> Mis Partidos Creados
          </button>
          <button
            onClick={() => setActiveTab("joinedMatches")}
            className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-300
              ${
                activeTab === "joinedMatches"
                  ? `${colorsSporty.accentLime} shadow-lg`
                  : `${colorsSporty.secondaryBg} ${
                      colorsSporty.secondaryText
                    } hover:${colorsSporty.accentLimeHover.replace(
                      "bg-",
                      "text-"
                    )}`
              } `}
          >
            <FaFutbol className="inline-block mr-2 text-xl" /> Partidos Unidos
          </button>
          <button
            onClick={() => setActiveTab("pastMatches")}
            className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-300
              ${
                activeTab === "pastMatches"
                  ? `bg-blue-600 text-white shadow-lg`
                  : `${colorsSporty.secondaryBg} ${colorsSporty.secondaryText} hover:text-blue-400`
              } `}
          >
            <FiCheckCircle className="inline-block mr-2 text-xl" /> Historial de
            Partidos
          </button>
        </motion.div>

        {/* Matches List */}
        <AnimatePresence mode="wait">
          {currentTabMatches().length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`${colorsSporty.secondaryBg} rounded-xl ${colorsSporty.shadowPrimary} p-12 text-center ${colorsSporty.secondaryText} border ${colorsSporty.cardBorder}`}
            >
              <FiInfo className="text-8xl mx-auto mb-6 opacity-30 text-lime-500" />
              <p className="text-xl font-semibold mb-3">
                {activeTab === "myMatches" &&
                  "¡Aún no has creado ningún partido!"}
                {activeTab === "joinedMatches" &&
                  "¡No te has unido a ningún partido todavía!"}
                {activeTab === "pastMatches" &&
                  "¡Aún no tienes partidos en el historial!"}
              </p>
              <p className="text-lg">
                {activeTab === "myMatches" &&
                  "Empieza creando uno y organiza tu juego."}
                {activeTab === "joinedMatches" &&
                  "Explora la sección de partidos y únete a la acción."}
                {activeTab === "pastMatches" &&
                  "Una vez que tus partidos terminen, aparecerán aquí."}
              </p>
              <Link to="/matches">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`mt-8 inline-flex items-center px-6 py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 ${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover}`}
                >
                  <FiPlusCircle className="mr-2" />{" "}
                  {activeTab === "myMatches"
                    ? "Crear Partido"
                    : "Ver Partidos Disponibles"}
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="matches"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {currentTabMatches().map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onView={handleViewMatch}
                  onEdit={handleEditMatch}
                  onDelete={handleDeleteMatch}
                  user={user}
                  isPastMatch={isPast(new Date(match.date))}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
