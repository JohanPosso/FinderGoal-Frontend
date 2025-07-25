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
  FiAward, // <--- Agregado
} from "react-icons/fi";
import { FaFutbol } from "react-icons/fa"; // For general sports theme
import api from "../utils/axios";
import { getAvatarUrl, getRegistrationDate } from "../utils/helpers";
import { createPortal } from "react-dom";

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
  // Mejorar la detección del creador para manejar diferentes estructuras de datos
  const isCreator = user && (
    (match.creator && user.id === match.creator.id) ||
    (match.creador && user.id === match.creador.id) ||
    (match.creatorId && user.id === match.creatorId) ||
    (match.creadorId && user.id === match.creadorId)
  );

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

// --- Modal de edición de perfil ---
function EditProfileModal({
  isOpen,
  onClose,
  userData,
  editNombre,
  setEditNombre,
  editEmail,
  setEditEmail,
  editAvatar,
  setEditAvatar,
  onSubmit,
  error,
  uploading,
  onFileChange,
  previewUrl,
}) {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative mx-2 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-400 text-2xl font-bold focus:outline-none"
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Editar Perfil</h2>
        <form onSubmit={onSubmit}>
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-2">
              <img
                src={previewUrl || editAvatar || getAvatarUrl(userData?.avatar)}
                alt="Avatar preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-lime-500 shadow-lg"
              />
              <label className="absolute bottom-0 right-0 bg-lime-500 text-gray-900 rounded-full p-2 cursor-pointer shadow-md hover:bg-lime-400 transition-all border-2 border-white">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                  disabled={uploading}
                />
                <FiEdit />
              </label>
            </div>
            <span className="text-xs text-gray-400">Haz clic en el lápiz para cambiar la foto</span>
          </div>
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
            <label className="block text-gray-300 mb-2">Correo electrónico</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-500"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full mt-4 ${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover} text-lg font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center`}
            disabled={uploading}
          >
            {uploading ? (
              <span className="animate-spin mr-2">⏳</span>
            ) : null}
            Guardar Cambios
          </button>
          {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        </form>
      </div>
    </div>,
    document.body
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [profileUpdateStatus, setProfileUpdateStatus] = useState(""); // "success" | "error" | ""

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

  // Cargar información completa del usuario desde la API
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        try {
          const res = await api.get(`/users/${user.id}`);
          setUserData(res.data);
          setEditNombre(res.data.nombre || res.data.name || "");
          setEditEmail(res.data.email || "");
          setEditAvatar(res.data.avatar || "");
        } catch (err) {
          console.error("Error fetching user data:", err);
          // Si falla, usar los datos del store
          setUserData(user);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user?.id]);

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
      if (res.data) {
        updateUser(res.data); // Actualiza el usuario global y localStorage
        setShowEditModal(false);
        setProfileUpdateStatus("success");
        setTimeout(() => setProfileUpdateStatus(""), 3500);
      }
    } catch (err) {
      setError("No se pudo actualizar el perfil.");
      setProfileUpdateStatus("error");
      setTimeout(() => setProfileUpdateStatus(""), 3500);
    }
  };

  // Manejar cambio de archivo de imagen
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    // Previsualización local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    // Subir al backend
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditAvatar(res.data.url); // Guardar la URL recibida
    } catch (err) {
      setError("No se pudo subir la imagen. Intenta con otra.");
    } finally {
      setUploading(false);
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

  const handleDeleteMatch = async (matchId) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este partido? Esta acción es irreversible."
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        const response = await api.delete(`/matches/${matchId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Si llegamos aquí, la eliminación fue exitosa
        // Actualizar la lista de partidos después de eliminar
        if (activeTab === "myMatches") {
          setMyMatches(prev => prev.filter(match => match.id !== matchId));
        }
        
        // También actualizar el store global si es necesario
        deleteMatch(matchId);
        
        alert("Partido eliminado exitosamente");
      } catch (err) {
        console.error("Error deleting match:", err);
        
        // Verificar diferentes tipos de respuesta que pueden indicar éxito
        const status = err.response?.status;
        const statusText = err.response?.statusText;
        
        // Si el status es 200, 204, o 404, probablemente la eliminación fue exitosa
        if (status === 200 || status === 204 || status === 404) {
          // Actualizar la lista de todos modos
          if (activeTab === "myMatches") {
            setMyMatches(prev => prev.filter(match => match.id !== matchId));
          }
          deleteMatch(matchId);
          alert("Partido eliminado exitosamente");
        } else {
          // Solo mostrar error si realmente hay un problema
          alert("No se pudo eliminar el partido. Inténtalo de nuevo.");
        }
      }
    }
  };

  const handleViewMatch = (matchId) => {
    navigate(`/matches/${matchId}`);
  };

  const handleEditMatch = async (matchId) => {
    try {
      // Navegar directamente a la página de crear partido con el ID para editar
      navigate(`/create-match?id=${matchId}`);
    } catch (err) {
      console.error("Error navigating to edit match:", err);
      alert("No se pudo abrir el editor del partido. Inténtalo de nuevo.");
    }
  };

  const currentTabMatches = () => {
    if (activeTab === "myMatches") return myMatches;
    if (activeTab === "joinedMatches") return upcomingJoinedMatches;
    if (activeTab === "pastMatches") return historyMatches;
    return [];
  };
  return (
    <div
      className={`${colorsSporty.primaryBg} min-h-screen py-10 px-6 ${colorsSporty.primaryText}`}
    >
      {/* Notificación de guardado de perfil */}
      {profileUpdateStatus === "success" && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] bg-lime-500 text-gray-900 px-6 py-3 rounded-xl shadow-lg font-bold text-lg animate-fadeIn">
          Perfil actualizado correctamente
        </div>
      )}
      {profileUpdateStatus === "error" && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg font-bold text-lg animate-fadeIn">
          No se pudo actualizar el perfil
        </div>
      )}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setPreviewUrl("");
          setError("");
        }}
        userData={userData}
        editNombre={editNombre}
        setEditNombre={setEditNombre}
        editEmail={editEmail}
        setEditEmail={setEditEmail}
        editAvatar={editAvatar}
        setEditAvatar={setEditAvatar}
        onSubmit={handleUpdate}
        error={error}
        uploading={uploading}
        onFileChange={handleFileChange}
        previewUrl={previewUrl}
      />
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-gray-700"
        >
          <div className="flex items-center mb-6 md:mb-0">
            <img
              src={getAvatarUrl(userData?.avatar)}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-lime-500 mr-6"
            />
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
                    {getRegistrationDate(userData)}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 items-end">
            {user?.isAdmin && (
              <Link
                to="/admin"
                className="text-lime-400 hover:text-lime-300 font-bold text-md underline mb-2 transition-colors duration-200"
                style={{ alignSelf: 'flex-end' }}
              >
                Ir al Panel Admin
              </Link>
            )}
            <button
              onClick={() => setShowEditModal(true)}
              className={`inline-flex items-center px-4 py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 ${colorsSporty.accentOrange} hover:${colorsSporty.accentOrangeHover}`}
            >
              <FiEdit className="mr-2" /> Editar Perfil
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

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-gray-800 rounded-xl p-5 flex flex-col items-center border border-gray-700 shadow">
            <FaFutbol className="text-3xl text-lime-400 mb-2" />
            <span className="text-lg font-bold text-white">{userData?.partidosJugados || 0}</span>
            <span className="text-xs text-gray-400">Jugados</span>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 flex flex-col items-center border border-gray-700 shadow">
            <FiUsers className="text-3xl text-orange-400 mb-2" />
            <span className="text-lg font-bold text-white">{userData?.partidosCreados || 0}</span>
            <span className="text-xs text-gray-400">Creados</span>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 flex flex-col items-center border border-gray-700 shadow">
            <FiAward className="text-3xl text-yellow-400 mb-2" />
            <span className="text-lg font-bold text-white">{userData?.goles || 0}</span>
            <span className="text-xs text-gray-400">Goles</span>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 flex flex-col items-center border border-gray-700 shadow">
            <FiAward className="text-3xl text-blue-400 mb-2" />
            <span className="text-lg font-bold text-white">{userData?.asistencias || 0}</span>
            <span className="text-xs text-gray-400">Asistencias</span>
          </div>
        </div>
        {/* Sección de logros futuros */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-lime-400 mb-3 flex items-center gap-2">
            <FiAward /> Logros y medallas (próximamente)
          </h3>
          <div className="flex gap-3 flex-wrap">
            <span className="bg-gray-700 text-gray-400 px-4 py-2 rounded-full font-semibold text-sm shadow">Participante</span>
            <span className="bg-gray-700 text-gray-400 px-4 py-2 rounded-full font-semibold text-sm shadow">Goleador</span>
            <span className="bg-gray-700 text-gray-400 px-4 py-2 rounded-full font-semibold text-sm shadow">Asistente</span>
            <span className="bg-gray-700 text-gray-400 px-4 py-2 rounded-full font-semibold text-sm shadow">Organizador</span>
          </div>
        </div>

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
