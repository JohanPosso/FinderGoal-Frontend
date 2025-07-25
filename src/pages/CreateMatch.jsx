import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiInfo,
  FiX,
  FiCheck,
  FiLock,
  FiUnlock,
  FiAward,
  FiTarget,
  FiClock,
  FiCopy,
  FiClipboard,
} from "react-icons/fi";
import { FaFutbol } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import api from "../utils/axios";
import WhatsappParser from "../components/WhatsappParser";

// Función helper para Google Analytics
const trackEvent = (action, category, label, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
};

// Colores del tema Sporty & Energetic
const colorsSporty = {
  primaryBg: "bg-gray-900", // Fondo oscuro principal
  secondaryBg: "bg-gray-800", // Fondo secundario para tarjetas/secciones (el formulario)
  primaryText: "text-white", // Texto principal
  secondaryText: "text-gray-400", // Texto secundario/descriptivo (ligeramente más claro para iconos)
  accentLime: "bg-lime-500 text-gray-900", // Verde lima brillante para botones/acentos
  accentLimeText: "text-lime-400", // Color de texto lima ligeramente más suave para contraste
  accentLimeHover: "bg-lime-400",
  accentOrange: "bg-orange-500 text-white", // Naranja intenso para acentos/botones secundarios
  accentOrangeText: "text-orange-400", // Color de texto naranja
  accentOrangeHover: "bg-orange-600",
  inputBg: "bg-gray-700", // Fondo de los inputs
  inputBorder: "border-gray-700", // Borde de los inputs
  inputFocusRing: "focus:ring-lime-500", // Anillo de foco en verde lima
  shadowPrimary: "shadow-2xl", // Sombra más pronunciada
  shadowAccent: "shadow-lime-500/40", // Sombra con tinte de acento más visible
  toggleOn: "bg-lime-500", // Color del toggle cuando está activado
  toggleOff: "bg-gray-600", // Color del toggle cuando está desactivado
  cardBorder: "border-gray-700", // Borde de las tarjetas/contenedores
};

// Estilos personalizados para React-Select (adaptados al tema oscuro y zIndex)
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: colorsSporty.inputBg.replace("bg-", "#"),
    borderColor: state.isFocused
      ? colorsSporty.inputFocusRing
          .replace("focus:ring-", "")
          .replace("500", "400") // Use slightly lighter lime for ring
      : colorsSporty.inputBorder.replace("border-", "#"),
    color: colorsSporty.primaryText.replace("text-", "#"),
    padding: "0.5rem 0.25rem", // py-3
    borderRadius: "0.5rem", // rounded-lg
    boxShadow: state.isFocused
      ? `0 0 0 2px ${colorsSporty.inputFocusRing
          .replace("focus:ring-", "")
          .replace("500", "400")}`
      : "none",
    "&:hover": {
      borderColor: state.isFocused
        ? colorsSporty.inputFocusRing
            .replace("focus:ring-", "")
            .replace("500", "400")
        : colorsSporty.inputBorder.replace("border-", "#"),
    },
    minHeight: "48px",
    cursor: "pointer",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: colorsSporty.primaryText.replace("text-", "#"),
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#23272b", // Fondo sólido oscuro
    borderRadius: "0.5rem",
    boxShadow: colorsSporty.shadowPrimary,
    zIndex: 9999,
    border: `1px solid ${colorsSporty.cardBorder.replace("border-", "#")}`,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? "#2d3238" // Fondo más claro al enfocar
      : state.isSelected
      ? "#a3e635" // Verde lima para seleccionado
      : "#23272b", // Fondo sólido oscuro
    color:
      state.isFocused || state.isSelected
        ? colorsSporty.primaryText.replace("text-", "#")
        : colorsSporty.primaryText.replace("text-", "#"),
    "&:active": {
      backgroundColor: "#a3e635",
    },
    fontSize: "1rem",
    padding: "0.75rem 1rem",
    cursor: "pointer",
  }),
  input: (provided) => ({
    ...provided,
    color: colorsSporty.primaryText.replace("text-", "#"),
  }),
  placeholder: (provided) => ({
    ...provided,
    color: colorsSporty.secondaryText.replace("text-", "#"),
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: colorsSporty.secondaryText.replace("text-", "#"), // Icon color
    "&:hover": {
      color: colorsSporty.accentLimeText.replace("text-", "#"), // Icon color on hover
    },
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: colorsSporty.inputBorder.replace("border-", "#"), // Separator color
  }),
};

// Opciones de nivel de juego (asegura que esté definido antes de usarse)
const skillLevelsOptions = [
  { value: "beginner", label: "Principiante" },
  { value: "medium", label: "Intermedio" },
  { value: "advanced", label: "Avanzado" },
  { value: "competitive", label: "Competitivo" },
  { value: "pro", label: "Profesional" },
];

export default function CreateMatch() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [hour, setHour] = useState("18:00");
  const [direccion, setDireccion] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [codigoPrivado, setCodigoPrivado] = useState("");
  const [skillLevel, setSkillLevel] = useState("medium");
  const [precio, setPrecio] = useState(0);
  const [serJugador, setSerJugador] = useState(false);
  const { createMatch, user } = useStore();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showWhatsappParser, setShowWhatsappParser] = useState(false);
  const location = useLocation();
  const searchParams = useSearchParams()[0];

  // Obtener token del usuario si existe
  const token = localStorage.getItem("token");

  useEffect(() => {
    const matchId = searchParams.get("id");
    if (matchId) {
      fetchMatchData(matchId);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      navigate("/login");
      return;
    }
    if (!title || !date || !hour || !direccion || !maxPlayers) {
      return;
    }

    const isEditing = searchParams.has("id");
    const matchId = searchParams.get("id");

    try {
      const payload = {
        titulo: title,
        fecha: date.toISOString().split("T")[0],
        hora: hour,
        direccion,
        maxPlayers,
        descripcion: description,
        precio: precio ? Number(precio) : 0,
        serJugador,
        privado: isPrivate,
        skillLevel,
      };

      let res;
      if (isEditing) {
        // Actualizar partido existente
        res = await api.patch(`/matches/${matchId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Track evento de edición de partido
        trackEvent('match_updated', 'match_management', 'edit_match', matchId);
      } else {
        // Crear nuevo partido
        res = await api.post("/matches", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Track evento de creación de partido
        trackEvent('match_created', 'match_management', 'create_match', res.data.id);
        
        // Track detalles adicionales del partido creado
        trackEvent('match_details', 'match_management', 'match_type', isPrivate ? 'private' : 'public');
        trackEvent('match_details', 'match_management', 'skill_level', skillLevel);
        trackEvent('match_details', 'match_management', 'max_players', maxPlayers);
        trackEvent('match_details', 'match_management', 'has_price', precio > 0 ? 'yes' : 'no');
        
        if (res.data.privado && res.data.codigoPrivado) {
          setCodigoPrivado(res.data.codigoPrivado);
          setShowModal(true);
          // Track evento de creación de partido privado
          trackEvent('private_match_created', 'match_management', 'private_match', res.data.id);
        }
      }
      
      navigate(`/matches/${res.data.id}`);
    } catch (err) {
      const action = isEditing ? "actualizar" : "crear";
    }
  };

  // Función para manejar los datos extraídos del parser de WhatsApp
  const handleWhatsappDataExtracted = (data) => {
    // Track evento de uso del parser de WhatsApp
    trackEvent('whatsapp_parser_used', 'match_creation', 'parse_whatsapp', 1);
    
    // Aplicar fecha si está disponible
    if (data.fecha) {
      const fechaParts = data.fecha.split('-');
      if (fechaParts.length === 3) {
        const year = parseInt(fechaParts[0]);
        const month = parseInt(fechaParts[1]) - 1; // Los meses en JS van de 0-11
        const day = parseInt(fechaParts[2]);
        setDate(new Date(year, month, day));
      }
    }

    // Aplicar hora si está disponible
    if (data.hora) {
      setHour(data.hora);
    }

    // Aplicar ubicación si está disponible
    if (data.ubicacion) {
      setDireccion(data.ubicacion);
    }

    // Aplicar precio si está disponible
    if (data.precio && data.precio > 0) {
      setPrecio(data.precio);
    }

    // Aplicar número de jugadores basado en la lista si está disponible
    if (data.jugadores && data.jugadores.length > 0) {
      setMaxPlayers(data.jugadores.length);
    }

    // Crear descripción con información adicional
    let descripcion = "";
    if (data.tipoFutbol) {
      descripcion += `Tipo: ${data.tipoFutbol}. `;
    }
    if (data.jugadores && data.jugadores.length > 0) {
      descripcion += `Jugadores confirmados: ${data.jugadores.join(', ')}. `;
    }
    if (descripcion) {
      setDescription(descripcion);
    }
  };

  const fetchMatchData = async (id) => {
    try {
      const res = await api.get(`/matches/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const matchData = res.data;
      setTitle(matchData.titulo || matchData.title || "");
      setDate(new Date(matchData.fecha || matchData.date));
      setHour(matchData.hora || matchData.hour || "18:00");
      setDireccion(matchData.direccion || matchData.location || "");
      setMaxPlayers(matchData.maxPlayers || 10);
      setDescription(matchData.descripcion || matchData.description || "");
      setIsPrivate(matchData.privado || matchData.isPrivate || false);
      setSkillLevel(matchData.skillLevel || "medium");
      setPrecio(matchData.precio || matchData.price || 0);
      setSerJugador(matchData.serJugador || matchData.willPlay || false);
    } catch (err) {
      console.error("Error fetching match data:", err);
    }
  };

  const isEditing = searchParams.has("id");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen flex items-start justify-center ${colorsSporty.primaryBg} ${colorsSporty.primaryText} py-8 px-4`}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`w-full max-w-sm md:max-w-3xl lg:max-w-4xl ${colorsSporty.secondaryBg} rounded-2xl ${colorsSporty.shadowPrimary} ${colorsSporty.shadowAccent} border ${colorsSporty.cardBorder} overflow-hidden`}
      >
        {/* Header Section - With subtle gradient and bigger */}
        <div className="relative p-6 md:p-8 flex items-center justify-between border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
          <div className="flex items-center">
            <FaFutbol
              className={`text-4xl md:text-5xl ${colorsSporty.accentLimeText} mr-4`}
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {isEditing ? "Editar" : "Crear"}{" "}
                <span className={`${colorsSporty.accentLimeText}`}>
                  Partido
                </span>
              </h1>
              <p
                className={`${colorsSporty.secondaryText} text-md md:text-lg mt-1`}
              >
                {isEditing 
                  ? "Modifica los detalles de tu partido y actualiza la información."
                  : "¡Organiza tu próximo encuentro y haz que el balón ruede!"
                }
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/matches")}
            className="p-2 md:p-3 rounded-full text-white hover:bg-gray-700 transition-colors"
          >
            <FiX size={28} />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Fila 1: Título del partido | Formato de jugadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label
                className={`block text-md md:text-lg font-semibold ${colorsSporty.primaryText} mb-2`}
              >
                Título del partido <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  className={`w-full px-4 py-3 md:py-4 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200 placeholder-gray-400 font-medium`}
                  placeholder="Ej: Amistoso sabatino en el parque"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <FiInfo
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-lg md:text-xl ${colorsSporty.secondaryText}`}
                />
              </div>
            </div>
            <div>
              <label
                className={`block text-md md:text-lg font-semibold ${colorsSporty.primaryText} mb-2`}
              >
                Formato de jugadores <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  className={`w-full px-4 py-3 md:py-4 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200 font-medium`}
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  required
                >
                  <option value={10}>5 vs 5 (10 jugadores)</option>
                  <option value={14}>7 vs 7 (14 jugadores)</option>
                  <option value={18}>9 vs 9 (18 jugadores)</option>
                  <option value={22}>11 vs 11 (22 jugadores)</option>
                </select>
                <FiUsers
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-lg md:text-xl ${colorsSporty.secondaryText}`}
                />
              </div>
            </div>
          </div>
          {/* Fila 2: Fecha | Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label
                className={`block text-md md:text-lg font-semibold ${colorsSporty.primaryText} mb-2`}
              >
                Fecha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DatePicker
                  selected={date}
                  onChange={(date) => setDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className={`w-full px-4 py-3 md:py-4 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200`}
                  minDate={new Date()}
                  required
                />
                <FiCalendar
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-lg md:text-xl ${colorsSporty.secondaryText}`}
                />
              </div>
            </div>
            <div>
              <label
                className={`block text-md md:text-lg font-semibold ${colorsSporty.primaryText} mb-2`}
              >
                Hora <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  className={`w-full px-4 py-3 md:py-4 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200 placeholder-gray-400 font-medium`}
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  required
                />
                <FiClock
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-lg md:text-xl ${colorsSporty.secondaryText}`}
                />
              </div>
            </div>
          </div>
          {/* Fila 3: Dirección | Precio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label
                className={`block text-md md:text-lg font-semibold ${colorsSporty.primaryText} mb-2`}
              >
                Dirección <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 md:py-4 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200 placeholder-gray-400 font-medium`}
                placeholder="Ej: Calle 123, Barrio Centro"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                className={`block text-md md:text-lg font-semibold ${colorsSporty.primaryText} mb-2`}
              >
                Precio
              </label>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                min="0"
                className={`w-full px-4 py-3 md:py-4 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200 placeholder-gray-400 font-medium`}
                placeholder="Ej: 5.00"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />
            </div>
          </div>
          {/* Fila 4: Nivel de juego | ¿Serás jugador? */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label
                className={`block text-md md:text-lg font-semibold ${colorsSporty.primaryText} mb-2`}
              >
                Nivel de juego
              </label>
              <div className="relative">
                <Select
                  options={skillLevelsOptions}
                  value={skillLevelsOptions.find(
                    (level) => level.value === skillLevel
                  )}
                  onChange={(selected) => setSkillLevel(selected.value)}
                  styles={customSelectStyles}
                  classNamePrefix="react-select"
                />
                <FiAward
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-lg md:text-xl ${colorsSporty.secondaryText} pointer-events-none`}
                />
              </div>
            </div>
            <div>
              <label
                className={`block text-md md:text-lg font-semibold ${colorsSporty.primaryText} mb-2`}
              >
                ¿Serás jugador?
              </label>
              <div className="flex items-center h-full">
                <input
                  type="checkbox"
                  className="mr-2 leading-tight"
                  checked={serJugador}
                  onChange={() => setSerJugador(!serJugador)}
                />
                <span
                  className={`text-md md:text-lg ${colorsSporty.primaryText}`}
                >
                  Marcar si deseas unirte como jugador
                </span>
              </div>
            </div>
          </div>
          {/* Fila 5: Descripción */}
          <div>
            <label
              className={`block text-md md:text-lg font-semibold ${colorsSporty.primaryText} mb-2`}
            >
              Descripción
            </label>
            <div className="relative">
              <textarea
                rows={4}
                className={`w-full px-4 py-3 md:py-4 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200 placeholder-gray-400 font-medium`}
                placeholder="Ej: Traer balón y bebidas. Cancha de césped sintético, no olvidéis las espinilleras."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <FiInfo
                className={`absolute right-3 top-3.5 text-lg md:text-xl ${colorsSporty.secondaryText} pointer-events-none`}
              />
            </div>
          </div>
          {/* Fila 6: Partido privado */}
          <div className="flex items-center gap-4 pt-2">
            <input
              type="checkbox"
              id="privado"
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
              className="w-5 h-5 accent-lime-500"
            />
            <label htmlFor="privado" className={`text-lg font-semibold ${colorsSporty.primaryText}`}>
              Partido privado
            </label>
            {isPrivate && (
              <span className="ml-2 text-sm text-orange-400">
                Se generará un código privado para compartir con tus invitados.
              </span>
            )}
          </div>

          <div className="pt-4">
            <motion.button
              whileHover={{
                scale: 1.03,
                boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
              }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className={`w-full ${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover} ${colorsSporty.primaryText} py-3 md:py-4 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 text-lg md:text-xl shadow-lg flex items-center justify-center`}
            >
              <FaFutbol className="mr-3 text-2xl md:text-3xl" /> 
              {isEditing ? "Actualizar Partido" : "Crear Partido"}
            </motion.button>
          </div>
        </form>
      </motion.div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className={`bg-gray-900 rounded-2xl p-8 shadow-2xl border-2 border-lime-500 max-w-sm w-full text-center`}>
            <h2 className="text-2xl font-bold text-white mb-4">¡Partido privado creado!</h2>
            <p className="text-lg text-gray-300 mb-2">Comparte este código con tus invitados para que puedan unirse:</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-3xl font-mono bg-gray-800 px-4 py-2 rounded-lg border border-lime-500 text-lime-400 select-all">{codigoPrivado}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(codigoPrivado);
                  // Track evento de copia de código privado
                  trackEvent('private_code_copied', 'match_management', 'copy_code', 1);
                }}
                className="ml-2 p-2 rounded-lg bg-lime-500 hover:bg-lime-400 text-gray-900 font-bold"
                title="Copiar código"
              >
                <FiCopy size={22} />
              </button>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-2 px-6 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de WhatsApp Parser */}
      {showWhatsappParser && (
        <WhatsappParser
          onDataExtracted={handleWhatsappDataExtracted}
          onClose={() => {
            setShowWhatsappParser(false);
            // Track evento cuando se cierra el parser
            trackEvent('whatsapp_parser_closed', 'match_creation', 'close_parser', 1);
          }}
        />
      )}
    </motion.div>
  );
}
