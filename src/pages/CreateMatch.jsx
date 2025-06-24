import React, { useState } from "react";
import { useStore, useLocationStore } from "../store/useStore";
import { useNavigate } from "react-router-dom";
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
} from "react-icons/fi";
import { FaFutbol } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import api from "../utils/axios";

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
    backgroundColor: colorsSporty.secondaryBg.replace("bg-", "#"),
    borderRadius: "0.5rem",
    boxShadow: colorsSporty.shadowPrimary,
    // CRÍTICO para que se vea por encima:
    zIndex: 9999, // Asegura que el menú desplegable esté por encima de otros elementos
    border: `1px solid ${colorsSporty.cardBorder.replace("border-", "#")}`, // Add border to dropdown
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? colorsSporty.inputBg.replace("bg-", "#") // Lighter dark on focus
      : state.isSelected
      ? colorsSporty.accentLimeText.replace("text-", "#") // Lime on select
      : colorsSporty.secondaryBg.replace("bg-", "#"),
    color:
      state.isFocused || state.isSelected
        ? colorsSporty.primaryText.replace("text-", "#")
        : colorsSporty.primaryText.replace("text-", "#"),
    "&:active": {
      backgroundColor: colorsSporty.accentLimeText.replace("text-", "#"),
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
];

export default function CreateMatch() {
  // Solo dejamos 'fecha' (date) y eliminamos 'hora'
  // Eliminamos estados y lógica innecesaria
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [hour, setHour] = useState("18:00");
  const [location, setLocation] = useState("");
  const [direccion, setDireccion] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [description, setDescription] = useState("");
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [skillLevel, setSkillLevel] = useState("medium");
  const [precio, setPrecio] = useState(0);
  const [serJugador, setSerJugador] = useState(false);
  const { createMatch, user } = useStore();
  const navigate = useNavigate();
  const { city, country, getFieldsCache } = useLocationStore();

  // Obtener token del usuario si existe
  const token = localStorage.getItem("token");

  React.useEffect(() => {
    if (city && country) {
      const fields = getFieldsCache(city, country);
      if (fields && fields.length > 0) {
        const field = fields[0];
        if (field) {
          setLocation(field.name || "");
          // Ya no hay dirección separada
          setPrecio(field.price || 0);
        }
      }
    }
  }, [city, country, getFieldsCache]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      alert("Debes iniciar sesión para crear un partido.");
      navigate("/login");
      return;
    }
    if (!title || !date || !hour || !direccion || !maxPlayers) {
      alert("Completa todos los campos obligatorios.");
      return;
    }
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
      };
      const res = await api.post("/matches", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate(`/matches/${res.data.id}`);
    } catch (err) {
      alert(
        "Error al crear el partido. Verifica los datos e inténtalo de nuevo."
      );
    }
  };

  // Efecto para autocompletar datos de cancha si hay selección previa
  React.useEffect(() => {
    // Si hay city/country y hay canchas cacheadas, autocompletar
    if (city && country) {
      const fields = getFieldsCache(city, country);
      if (fields && fields.length > 0) {
        // Tomar la primera cancha como sugerencia
        const field = fields[0];
        if (field) {
          setLocation(field.name || "");
          // Ya no hay dirección separada
          setPrecio(field.price || 0);
        }
      }
    }
  }, [city, country, getFieldsCache]);

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
                Crear{" "}
                <span className={`${colorsSporty.accentLimeText}`}>
                  Partido
                </span>
              </h1>
              <p
                className={`${colorsSporty.secondaryText} text-md md:text-lg mt-1`}
              >
                ¡Organiza tu próximo encuentro y haz que el balón ruede!
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
          {/* Fila 1: Título del partido | Número de jugadores */}
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
                Número de jugadores <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={5}
                  max={22}
                  className={`w-full px-4 py-3 md:py-4 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200 placeholder-gray-400 font-medium`}
                  placeholder="10"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  required
                />
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
              <FaFutbol className="mr-3 text-2xl md:text-3xl" /> Crear Partido
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
