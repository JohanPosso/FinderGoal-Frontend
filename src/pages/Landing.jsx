import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiStar,
  FiUserPlus,
  FiClock,
  FiChevronDown,
} from "react-icons/fi";
import { FaFutbol, FaRunning, FaTshirt } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  getCityCountryFromCoords,
  getCityCountryFromIP,
} from "../utils/geolocation";
import { useLocationStore, useStore } from "../store/useStore";
import api from "../utils/axios";
import Driver from "driver.js";
import "driver.js/dist/driver.css";
import { landingTourSteps } from "../config/tourConfig";

// Configuración de colores para Diseño Deportivo y Energético
const colorsSporty = {
  primaryBg: "bg-gray-900", // Fondo oscuro
  secondaryBg: "bg-gray-800",
  primaryText: "text-white",
  secondaryText: "text-gray-300",
  accentLime: "bg-lime-500 text-gray-900", // Verde lima brillante
  accentLimeHover: "bg-lime-400",
  accentOrange: "bg-orange-500 text-white", // Naranja intenso
  accentOrangeHover: "bg-orange-600",
  cardBg: "bg-gray-800",
  cardBorder: "border-gray-700",
  iconBg: "bg-lime-600",
};

// Componentes UI personalizados para Diseño Deportivo y Energético
const SportyButton = ({
  children,
  className = "",
  variant = "solid",
  ...props
}) => (
  <motion.button
    whileHover={{ scale: 1.05, boxShadow: "0 6px 12px rgba(0,0,0,0.3)" }}
    whileTap={{ scale: 0.95 }}
    className={`px-8 py-4 rounded-lg font-extrabold uppercase tracking-wide transition-all duration-300 ${
      variant === "solid"
        ? `${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover}`
        : variant === "secondary"
        ? `${colorsSporty.accentOrange} hover:${colorsSporty.accentOrangeHover}`
        : "bg-transparent border-2 border-lime-500 text-lime-500 hover:bg-lime-500 hover:text-gray-900" // Outline lime
    } ${className}`}
    {...props}
  >
    {children}
  </motion.button>
);

const SportySectionTitle = ({ children, className = "" }) => (
  <div className={`mb-16 text-center ${className}`}>
    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
      {children}
    </h2>
    <div className="w-28 h-2 bg-lime-500 mx-auto rounded-full"></div>
  </div>
);

const SportyStat = ({ value, label, icon }) => (
  <div className="flex flex-col items-center">
    <div className="text-5xl font-extrabold text-lime-400 mb-2">{value}</div>
    <div className="text-gray-300 text-lg uppercase tracking-wide">{label}</div>
    {icon && <div className="mt-2 text-lime-300 text-3xl">{icon}</div>}
  </div>
);

const SportyTestimonial = ({ name, avatar, text, role }) => (
  <motion.div
    whileHover={{ y: -8, boxShadow: "0 12px 24px rgba(0,0,0,0.4)" }}
    className={`${colorsSporty.cardBg} p-8 rounded-2xl shadow-xl max-w-sm ${colorsSporty.cardBorder} border-t-4 border-orange-500`}
  >
    <div className="flex items-center mb-6">
      <img
        src={avatar}
        alt={name}
        className="w-16 h-16 rounded-full mr-5 object-cover border-4 border-lime-500 p-0.5"
      />
      <div>
        <h4 className="font-bold text-white text-xl">{name}</h4>
        {role && <p className="text-sm text-gray-400">{role}</p>}
      </div>
    </div>
    <p className="text-gray-200 italic text-base">"{text}"</p>
    <div className="flex mt-4 text-amber-400">
      {[...Array(5)].map((_, i) => (
        <FiStar key={i} className="fill-current w-5 h-5" />
      ))}
    </div>
  </motion.div>
);

const SportyMatchCard = ({ title, date, location, players, maxPlayers }) => (
  <div
    className={`${colorsSporty.cardBg} rounded-2xl overflow-hidden shadow-xl transition-transform hover:scale-[1.02] ${colorsSporty.cardBorder} border-b-4 border-lime-500`}
  >
    <div className="bg-gray-900 text-white p-5 text-lg flex justify-between items-center">
      <div>
        <div className="flex items-center">
          <FiCalendar className="mr-3 text-orange-400 text-xl" />
          <span>{date}</span>
        </div>
        <div className="flex items-center mt-2">
          <FiMapPin className="mr-3 text-orange-400 text-xl" />
          <span>{location}</span>
        </div>
      </div>
      <span className="bg-lime-600 text-gray-900 text-sm px-3 py-1.5 rounded-full font-bold uppercase">
        Activo
      </span>
    </div>
    <div className="p-5">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center text-gray-300 text-base">
          <FiUsers className="mr-2 text-lime-500 text-xl" />
          <span>
            {players}/{maxPlayers} jugadores
          </span>
        </div>
        <span className="bg-orange-600 text-white text-sm px-3 py-1.5 rounded-full font-bold">
          ¡Únete ya!
        </span>
      </div>
      <div className="h-40 bg-gray-900 rounded-lg mb-4 flex items-center justify-center border border-gray-700">
        <FaFutbol className="text-6xl text-gray-700 opacity-60" />
      </div>
      <SportyButton className="w-full text-lg" variant="secondary">
        Unirse al Partido
      </SportyButton>
    </div>
  </div>
);

const SportyPositionSelector = () => {
  const positions = [
    {
      name: "Portero",
      icon: <FaTshirt className="text-2xl" />,
      color: "bg-red-600 hover:bg-red-700",
    },
    {
      name: "Defensa",
      icon: <FaTshirt className="text-2xl" />,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Medio",
      icon: <FaTshirt className="text-2xl" />,
      color: "bg-yellow-600 hover:bg-yellow-700",
    },
    {
      name: "Delantero",
      icon: <FaTshirt className="text-2xl" />,
      color: "bg-lime-600 hover:bg-lime-700",
    },
  ];

  const [selected, setSelected] = useState(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {positions.map((pos) => (
        <motion.div
          key={pos.name}
          whileHover={{ scale: 1.05 }}
          onClick={() => setSelected(pos.name)}
          className={`p-5 rounded-lg cursor-pointer flex flex-col items-center text-lg transition-colors duration-200 ${
            selected === pos.name
              ? `${pos.color} text-white shadow-lg`
              : "bg-gray-700 text-gray-200 hover:bg-gray-600"
          }`}
        >
          {pos.icon}
          <span className="mt-3 font-semibold">{pos.name}</span>
        </motion.div>
      ))}
    </div>
  );
};

const SportyCitySelector = ({ selectedCity, onSelectCity, className = "" }) => {
  const cities = [
    "Madrid",
    "Barcelona",
    "Valencia",
    "Sevilla",
    "Zaragoza",
    "Málaga",
    "Murcia",
    "Palma",
    "Bilbao",
    "Alicante",
  ];

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-gray-800 px-6 py-3 rounded-full shadow-lg text-white font-bold border border-gray-700 text-lg"
      >
        <FiMapPin className="text-lime-500 text-xl" />
        {selectedCity}
        <FiChevronDown
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-10 mt-3 w-full bg-gray-800 rounded-lg shadow-xl py-2 border border-gray-700"
        >
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => {
                onSelectCity(city);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-5 py-3 hover:bg-gray-700 ${
                city === selectedCity
                  ? "bg-gray-700 text-lime-400 font-semibold"
                  : "text-gray-200"
              }`}
            >
              {city}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

const SportyHowItWorksCard = ({ step, title, description, icon }) => (
  <motion.div
    whileHover={{ y: -8, boxShadow: "0 12px 24px rgba(0,0,0,0.4)" }}
    className={`${colorsSporty.cardBg} p-8 rounded-2xl text-center shadow-xl border ${colorsSporty.cardBorder}`}
  >
    <div
      className={`${colorsSporty.iconBg} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md`}
    >
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3 text-white">
      {step}. {title}
    </h3>
    <p className="text-gray-300 text-base">{description}</p>
  </motion.div>
);

export default function SportyEnergeticLanding() {
  const [userLocation, setUserLocation] = useState({
    city: null,
    country: null,
    loading: true,
    error: null,
  });
  const [selectedCity, setSelectedCity] = useState("Madrid");
  const [selectedCountry, setSelectedCountry] = useState("España");
  const [loadingLocation, setLoadingLocation] = useState(true);
  const setLocation = useLocationStore((state) => state.setLocation);
  const { matches } = useStore();
  const [apiMatches, setApiMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [errorMatches, setErrorMatches] = useState("");

  useEffect(() => {
    const getUserGeoLocation = async () => {
      setLoadingLocation(true);
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
          const result = await getCityCountryFromCoords(latitude, longitude);
          if (result) {
            setUserLocation({
              city: result.city,
              country: result.country,
              loading: false,
              error: null,
            });
            setSelectedCity(result.city);
            setSelectedCountry(result.country);
            setLocation(result.city, result.country); // Guardar en store global
          } else {
            setUserLocation({
              city: null,
              country: null,
              loading: false,
              error: "No se pudo obtener la ciudad/país.",
            });
          }
        } catch (err) {
          setUserLocation({
            city: null,
            country: null,
            loading: false,
            error: "No se pudo obtener tu ubicación.",
          });
          // Fallback a IP
          const result = await getCityCountryFromIP();
          if (result) {
            setUserLocation({
              city: result.city,
              country: result.country,
              loading: false,
              error: null,
            });
            setSelectedCity(result.city);
            setSelectedCountry(result.country);
            setLocation(result.city, result.country); // Guardar en store global
          }
        }
      } else {
        setUserLocation({
          city: null,
          country: null,
          loading: false,
          error: "Tu navegador no soporta geolocalización.",
        });
      }
      setLoadingLocation(false);
    };
    getUserGeoLocation();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoadingMatches(true);
      setErrorMatches("");
      try {
        const res = await api.get("/matches");
        setApiMatches(res.data);
      } catch (err) {
        setErrorMatches("No se pudieron cargar los partidos.");
      } finally {
        setLoadingMatches(false);
      }
    };
    fetchMatches();
  }, []);

  // Obtener los 4 últimos partidos agregados desde la API
  const latestMatches = apiMatches
    .sort((a, b) => new Date(b.createdAt || b.fecha || b.date) - new Date(a.createdAt || a.fecha || a.date))
    .slice(0, 4)
    .map((m) => {
      // Combinar fecha y hora en formato legible
      let fechaHora = m.fecha;
      if (m.hora) {
        fechaHora += ` ${m.hora}`;
      }
      let fechaLegible = "";
      if (m.fecha && m.hora) {
        const fechaObj = new Date(`${m.fecha}T${m.hora}`);
        fechaLegible = fechaObj.toLocaleString("es-ES", {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (m.fecha) {
        const fechaObj = new Date(m.fecha);
        fechaLegible = fechaObj.toLocaleDateString("es-ES", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
      } else {
        fechaLegible = "Próximamente";
      }
      // Calcular total de jugadores
      const totalJugadores = (Array.isArray(m.jugadores) ? m.jugadores.length : 0) + (Array.isArray(m.jugadoresInvitados) ? m.jugadoresInvitados.length : 0);
      return {
        title: m.titulo || m.title || "Partido de fútbol",
        date: fechaLegible,
        location: m.direccion || m.ubicacion || m.location || "Ubicación no especificada",
        players: totalJugadores,
        maxPlayers: m.maxPlayers,
      };
    });

  const testimonials = [
    {
      name: "Carlos Torres",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      text: "Desde que uso FinderGoal juego 3 veces por semana. La comunidad es increíble y siempre encuentro partidos cerca.",
      role: "Jugador frecuente",
    },
    {
      name: "Jesus Posso",
      avatar: "https://johanposso.com/images/IMG_76972.webp",
      text: "Organizar partidos ahora es tan fácil que mis amigos me eligieron como la capitana del grupo. ¡Gracias por simplificar todo!",
      role: "CEO",
    },
    {
      name: "Andrés López",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
      text: "Me mudé a una nueva ciudad y gracias a esta app pude encontrar un grupo de fútbol que ahora son mis amigos.",
      role: "Nuevo en la ciudad",
    },
    {
      name: "María González",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      text: "El sistema de valoración de jugadores hace que todos se comporten mejor. ¡El ambiente en los partidos es excelente!",
      role: "Árbitro ocasional",
    },
  ];

  useEffect(() => {
    if (!localStorage.getItem("tourLandingShown")) {
      const driver = new Driver();
      driver.defineSteps(landingTourSteps);
      driver.start();
      localStorage.setItem("tourLandingShown", "true");
    }
  }, []);

  return (
    <div
      className={`min-h-screen ${colorsSporty.primaryBg} ${colorsSporty.primaryText} flex flex-col`}
    >
      {/* Hero Principal */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1579952962645-a773d42e2b86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black opacity-90"></div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
          <div className="md:w-1/2 text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-7 leading-tight drop-shadow-lg"
            >
              ¡Tu Cancha te Espera en{" "}
              <span className="text-lime-400">{selectedCity}</span>!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
              className="text-xl text-gray-200 mb-10 max-w-lg mx-auto md:mx-0"
            >
              Encuentra partidos, forma tu equipo y vive la pasión del fútbol
              como nunca antes.
            </motion.p>
            <div className="mb-8 flex justify-center md:justify-start">
              <SportyCitySelector
                selectedCity={selectedCity}
                onSelectCity={setSelectedCity}
              />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-5 mb-14 justify-center md:justify-start"
            >
              <Link to="/matches">
                <SportyButton className="flex items-center gap-2">
                  <FaFutbol className="text-xl" /> Buscar Partidos
                </SportyButton>
              </Link>
              <Link to="/create-match">
                <SportyButton
                  variant="secondary"
                  className="flex items-center gap-2"
                  id="crear-partido-btn"
                >
                  <FiUserPlus className="text-xl" /> Crear Partido
                </SportyButton>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.6, ease: "easeOut" }}
              className="flex flex-wrap gap-12 justify-center md:justify-start mt-10"
            >
              <SportyStat value="+10.5K" label="Jugadores" icon={<FiUsers />} />
              <SportyStat value="+3.2K" label="Partidos" icon={<FaFutbol />} />
              <SportyStat value="4.9/5" label="Valoración" icon={<FiStar />} />
            </motion.div>
          </div>
          <div className="md:w-1/2 flex justify-center items-center relative group">
            {/* Efecto de luz ambiental */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-lime-400/20 to-transparent rounded-3xl blur-xl group-hover:opacity-80 transition-all duration-700 -z-10" />

            {/* Contenedor principal con perspectiva 3D */}
            <motion.div
              initial={{ opacity: 0, rotateY: 15 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{
                duration: 1.2,
                delay: 0.3,
                ease: [0.2, 0.85, 0.4, 1],
              }}
              className="relative w-full max-w-md perspective-1000"
            >
              {/* Tarjeta con efecto 3D al hover */}
              <div className="relative preserve-3d group-hover:[transform:rotateY(5deg)_rotateX(2deg)] transition-all duration-500 ease-out">
                {/* Imagen con efecto de vidrio esmerilado */}
                <div className="relative rounded-[2rem] shadow-2xl shadow-lime-900/30 overflow-hidden border-4 border-lime-400/30 bg-gradient-to-br from-gray-900 to-gray-800">
                  {/* Imagen con parallax */}
                  <motion.img
                    src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1896&q=80"
                    alt="Partido de fútbol emocionante"
                    className="w-full h-auto object-cover aspect-video scale-110 group-hover:scale-100 transition-transform duration-700"
                    whileHover={{ scale: 1.05 }}
                  />

                  {/* Overlay de efecto vidrio */}
                  <div className="absolute inset-0 bg-[url('https://assets.website-files.com/5e83fdebae1ad8747df3436e/5e86a6dac9b6a6aa8e7b0e1e_noise.png')] opacity-10 mix-blend-overlay" />
                </div>

                {/* Badge flotante con efecto neón */}
                <motion.div
                  className="absolute -bottom-4 -right-4 bg-gradient-to-br from-lime-400 to-emerald-600 p-0.5 rounded-xl shadow-lg shadow-lime-500/20 backdrop-blur-sm"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="bg-gray-900/90 px-4 py-3 rounded-lg flex items-center border border-lime-400/20">
                    <div className="relative">
                      <FiClock className="text-lime-300 text-2xl mr-3 animate-pulse" />
                      <div className="absolute -inset-1 rounded-full bg-lime-400/30 blur-sm"></div>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm bg-clip-text text-transparent bg-gradient-to-r from-lime-200 to-lime-400">
                        MATCH EXPRESS
                      </p>
                      <p className="text-lime-100 text-xs font-medium">
                        Cancha Elite • <span className="text-white">19:00</span>
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Efecto de partículas */}
                <div className="absolute -top-10 -left-10 w-20 h-20 rounded-full bg-lime-400/10 blur-3xl -z-10 group-hover:opacity-50 transition-opacity" />
              </div>

              {/* Efecto de balón flotante */}
              <motion.div
                className="absolute -top-8 -left-8 z-10"
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 10, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-lime-100">
                  <FaFutbol className="text-3xl text-gray-800 animate-spin-slow" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="py-24 bg-gray-800 px-6">
        <div className="max-w-6xl mx-auto">
          <SportySectionTitle>Tu Camino a la Victoria</SportySectionTitle>
          <div className="grid md:grid-cols-3 gap-10">
            <SportyHowItWorksCard
              step={1}
              title="Encuentra tu Juego"
              description="Busca partidos por ubicación, fecha o nivel. ¡Siempre hay una cancha esperando!"
              icon={<FiCalendar className="text-4xl text-gray-900" />}
            />
            <SportyHowItWorksCard
              step={2}
              title="Conéctate y Juega"
              description="Únete al equipo, chatea con tus compañeros y prepárate para la acción."
              icon={<FiUsers className="text-4xl text-gray-900" />}
            />
            <SportyHowItWorksCard
              step={3}
              title="Disfruta y Valora"
              description="Siente la adrenalina del partido y califica tu experiencia para mejorar la comunidad."
              icon={<FaRunning className="text-4xl text-gray-900" />}
            />
          </div>
        </div>
      </section>

      {/* Partidos Destacados */}
      <section className="py-24 bg-gray-900 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-14">
            <SportySectionTitle className="text-left mb-0 sm:mb-0">
              Partidos Calientes en {selectedCity}
            </SportySectionTitle>
            <Link
              to="/matches"
              className="text-lime-400 font-bold hover:underline flex items-center text-lg mt-6 sm:mt-0"
            >
              Ver todos los desafíos{" "}
              <FiChevronDown className="ml-2 transform rotate-90 text-2xl" />
            </Link>
          </div>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={35}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5500, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2, spaceBetween: 30 },
              1024: { slidesPerView: 3, spaceBetween: 40 },
            }}
            className="pb-16"
          >
            {loadingMatches ? (
              <div className="text-center text-white py-10">Cargando partidos...</div>
            ) : errorMatches ? (
              <div className="text-center text-red-400 py-10">{errorMatches}</div>
            ) : latestMatches.length === 0 ? (
              <div className="text-center text-gray-300 py-10">No hay partidos recientes.</div>
            ) : (
              latestMatches.map((match, i) => (
                <SwiperSlide key={i}>
                  <SportyMatchCard {...match} />
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </div>
      </section>

      {/* Visualizador de cancha (adaptado para Deportivo) */}
      <section className="py-24 bg-gray-800 px-6">
        <div className="max-w-6xl mx-auto">
          <SportySectionTitle>Estrategia en el Campo</SportySectionTitle>
          <div
            className={`${colorsSporty.cardBg} rounded-2xl p-10 text-white shadow-2xl border ${colorsSporty.cardBorder}`}
          >
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="md:w-1/2 text-center md:text-left">
                <h3 className="text-3xl font-bold mb-5 leading-snug">
                  Diseña tu Formación Ganadora
                </h3>
                <p className="mb-8 opacity-90 text-lg">
                  Arrastra a tus jugadores para simular la táctica perfecta. ¡La
                  victoria se planea aquí!
                </p>
                <div className="mb-8">
                  <SportyPositionSelector />
                </div>
                <SportyButton variant="solid" className="w-full md:w-auto">
                  Guardar Estrategia
                </SportyButton>
              </div>
              <div className="md:w-1/2 w-full flex justify-center">
                <div className="relative bg-gradient-to-br from-green-800 to-green-950 rounded-xl p-6 aspect-[4/3] w-full max-w-lg border-4 border-lime-500 shadow-inner shadow-green-950">
                  {/* Cancha de fútbol Sporty */}
                  <div className="absolute border-4 border-white border-dashed rounded-xl w-full h-full inset-0 m-auto opacity-80"></div>
                  <div className="absolute border-4 border-white rounded-full w-24 h-24 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-80"></div>
                  <div className="absolute w-1/2 h-full border-r-4 border-white border-dashed left-0 top-0 opacity-80"></div>
                  <div className="absolute w-1/2 h-full border-l-4 border-white border-dashed right-0 top-0 opacity-80"></div>

                  {/* Jugadores */}
                  {[
                    { top: "10%", left: "50%", color: "bg-red-600", text: "P" },
                    {
                      top: "30%",
                      left: "20%",
                      color: "bg-blue-600",
                      text: "D",
                    },
                    {
                      top: "30%",
                      left: "50%",
                      color: "bg-blue-600",
                      text: "D",
                    },
                    {
                      top: "30%",
                      left: "80%",
                      color: "bg-blue-600",
                      text: "D",
                    },
                    {
                      top: "60%",
                      left: "30%",
                      color: "bg-yellow-600",
                      text: "M",
                    },
                    {
                      top: "60%",
                      left: "70%",
                      color: "bg-yellow-600",
                      text: "M",
                    },
                    {
                      top: "85%",
                      left: "50%",
                      color: "bg-lime-600",
                      text: "A",
                    },
                  ].map((pos, i) => (
                    <motion.div
                      key={i}
                      drag
                      dragConstraints={{
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                      }}
                      className={`absolute w-12 h-12 rounded-full ${pos.color} cursor-grab active:cursor-grabbing flex items-center justify-center text-white font-bold text-lg shadow-xl`}
                      style={{
                        top: pos.top,
                        left: pos.left,
                        x: "-50%",
                        y: "-50%",
                      }}
                    >
                      {pos.text}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-24 bg-gray-900 px-6">
        <div className="max-w-6xl mx-auto">
          <SportySectionTitle>
            Lo que Dicen Nuestros Campeones
          </SportySectionTitle>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={35}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 7000, disableOnInteraction: false }}
            breakpoints={{
              768: { slidesPerView: 2, spaceBetween: 30 },
              1024: { slidesPerView: 3, spaceBetween: 40 },
            }}
            className="pb-16"
          >
            {testimonials.map((testimonial, i) => (
              <SwiperSlide key={i}>
                <SportyTestimonial {...testimonial} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Loader visual con Tailwind */}
      {loadingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
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
              Detectando tu ubicación...
            </span>
          </div>
        </div>
      )}

      {/* CTA Final */}
      <section className="py-24 px-6 bg-gradient-to-r from-lime-600 to-orange-600 text-gray-900 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-7 leading-snug drop-shadow-md">
            ¡El Partido de tu Vida Comienza Ahora!
          </h2>
          <p className="text-2xl mb-10 opacity-95 text-white">
            No esperes más. Únete a la comunidad más grande de fútbol amateur y
            vive cada gol.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link to="/register">
              <SportyButton
                variant="solid"
                className="bg-white text-gray-900 shadow-lg hover:bg-gray-100"
              >
                Regístrate Gratis
              </SportyButton>
            </Link>
            <Link to="/matches">
              <SportyButton
                variant="outline"
                className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
              >
                Explora Partidos
              </SportyButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
