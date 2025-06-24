import React, { useRef, useLayoutEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useStore } from "../store/useStore"; // Assuming this path is correct
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiArrowLeft,
  FiShare2,
  FiStar,
  FiCopy,
} from "react-icons/fi";
import { FaFutbol, FaUserPlus, FaRegStar, FaStar } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import api from "../utils/axios"; // Make sure this path is correct for your Axios instance

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

function PlayerPosition({
  position,
  idx,
  onJoin,
  user,
  isFull,
  title,
  isHomeTeam,
  dragHandleProps, // Keep this prop for framer-motion drag controls
}) {
  return (
    <div
      className="flex flex-col items-center group relative"
      {...dragHandleProps}
    >
      <div
        className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-md transition-all duration-200
          ${
            position // If there's a player in this position
              ? isHomeTeam
                ? "border-lime-500 bg-gray-900" // Home team: Lime border, dark background
                : "border-orange-500 bg-gray-900" // Away team: Orange border, dark background
              : isFull
              ? "border-gray-700 bg-gray-900 opacity-60" // Position full, no player (dimmed)
              : "border-gray-600 bg-gray-700" // Empty position, ready to join
          }`}
      >
        {position ? (
          <>
            <img
              src={
                position.avatar ||
                "https://via.placeholder.com/150/0f172a/9ca3af?text=JP"
              } // Fallback avatar
              alt={position.nombre || "Jugador"} // Use position.nombre based on API
              className="w-10 h-10 rounded-full object-cover pointer-events-none select-none border border-gray-600"
              draggable={false}
            />
            {user?.id === position.id && (
              <div
                className={`absolute -bottom-1.5 -right-1.5 ${
                  isHomeTeam ? "bg-lime-500" : "bg-orange-500"
                } rounded-full p-1.5 flex items-center justify-center border border-gray-900`}
              >
                <FiStar className="text-gray-900 text-xs" />
              </div>
            )}
          </>
        ) : isFull ? (
          <IoMdClose className="text-gray-500 text-xl" />
        ) : (
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onJoin(idx, isHomeTeam)}
            disabled={!user}
            className={`transition-all duration-200 p-1 rounded-full
              ${
                user
                  ? "text-lime-500 hover:text-lime-400"
                  : "text-gray-500 cursor-not-allowed"
              }`}
            title={user ? `Unirse como ${title}` : "Inicia sesión para unirte"}
          >
            <FaUserPlus size={20} />
          </motion.button>
        )}
      </div>
      <div className="absolute top-full mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 whitespace-nowrap font-medium shadow-lg border border-gray-700">
        {title}
      </div>
    </div>
  );
}

function FieldMap({
  fieldMap, // This `fieldMap` now contains actual player objects or null
  onJoin,
  user,
  isFull,
  maxPlayers,
  onMovePosition,
  isCreator,
  matchId,
  matchTitle, // Added matchTitle for WhatsApp share
  matchDate, // Added matchDate for WhatsApp share
  matchLocation, // Added matchLocation for WhatsApp share
  currentPlayersCount, // Added currentPlayersCount for WhatsApp share
}) {
  const playersPerTeam = Math.ceil(maxPlayers / 2); // Corrected: each team should be half of maxPlayers

  // Define dynamic formations based on playersPerTeam
  const getFormationPositions = (teamSize, isHome) => {
    let positions = [];
    // Base lines for field (percentages)
    const baseTop = isHome ? 88 : 12; // Goalie line
    const attackTop = isHome ? 30 : 70; // Forward line
    const midfieldTop = isHome ? 50 : 50; // Midfield line
    const defenseTop = isHome ? 70 : 30; // Defense line

    // Goalkeeper (always one)
    if (teamSize >= 1) {
      positions.push({ top: baseTop, left: 50 });
    }
    let outfieldPlayers = teamSize - 1; // Remaining players for outfield

    // Simple distribution logic for outfield players based on team size
    // This can be expanded with more specific formation patterns (e.g., 4-4-2, 4-3-3)
    let defenders = 0;
    let midfielders = 0;
    let forwards = 0;

    if (teamSize <= 5) {
      // e.g., 5v5 -> 1 Goalie, 4 Outfield. Try 1-2-1 or 1-1-2
      if (outfieldPlayers >= 2) {
        defenders = 2;
        outfieldPlayers -= 2;
      } else if (outfieldPlayers === 1) {
        defenders = 1;
        outfieldPlayers -= 1;
      }
      if (outfieldPlayers >= 1) {
        midfielders = 1;
        outfieldPlayers -= 1;
      }
      if (outfieldPlayers >= 1) {
        forwards = 1;
        outfieldPlayers -= 1;
      }
    } else if (teamSize <= 7) {
      // e.g., 7v7 -> 1 Goalie, 6 Outfield. Try 1-3-2-1
      if (outfieldPlayers >= 3) {
        defenders = 3;
        outfieldPlayers -= 3;
      } else if (outfieldPlayers >= 2) {
        defenders = 2;
        outfieldPlayers -= 2;
      } else if (outfieldPlayers === 1) {
        defenders = 1;
        outfieldPlayers -= 1;
      }
      if (outfieldPlayers >= 2) {
        midfielders = 2;
        outfieldPlayers -= 2;
      } else if (outfieldPlayers === 1) {
        midfielders = 1;
        outfieldPlayers -= 1;
      }
      if (outfieldPlayers >= 1) {
        forwards = 1;
        outfieldPlayers -= 1;
      }
    } else if (teamSize <= 9) {
      // e.g., 9v9 -> 1 Goalie, 8 Outfield. Try 1-4-3-1
      if (outfieldPlayers >= 4) {
        defenders = 4;
        outfieldPlayers -= 4;
      } else if (outfieldPlayers >= 3) {
        defenders = 3;
        outfieldPlayers -= 3;
      } else if (outfieldPlayers >= 2) {
        defenders = 2;
        outfieldPlayers -= 2;
      } else if (outfieldPlayers === 1) {
        defenders = 1;
        outfieldPlayers -= 1;
      }
      if (outfieldPlayers >= 3) {
        midfielders = 3;
        outfieldPlayers -= 3;
      } else if (outfieldPlayers >= 2) {
        midfielders = 2;
        outfieldPlayers -= 2;
      } else if (outfieldPlayers === 1) {
        midfielders = 1;
        outfieldPlayers -= 1;
      }
      if (outfieldPlayers >= 1) {
        forwards = 1;
        outfieldPlayers -= 1;
      }
    } else {
      // 11v11+ -> 1 Goalie, 10 Outfield. Try 1-4-3-3
      if (outfieldPlayers >= 4) {
        defenders = 4;
        outfieldPlayers -= 4;
      } else if (outfieldPlayers >= 3) {
        defenders = 3;
        outfieldPlayers -= 3;
      } else if (outfieldPlayers >= 2) {
        defenders = 2;
        outfieldPlayers -= 2;
      } else if (outfieldPlayers === 1) {
        defenders = 1;
        outfieldPlayers -= 1;
      }
      if (outfieldPlayers >= 3) {
        midfielders = 3;
        outfieldPlayers -= 3;
      } else if (outfieldPlayers >= 2) {
        midfielders = 2;
        outfieldPlayers -= 2;
      } else if (outfieldPlayers === 1) {
        midfielders = 1;
        outfieldPlayers -= 1;
      }
      if (outfieldPlayers >= 3) {
        forwards = 3;
        outfieldPlayers -= 3;
      } else if (outfieldPlayers >= 2) {
        forwards = 2;
        outfieldPlayers -= 2;
      } else if (outfieldPlayers === 1) {
        forwards = 1;
        outfieldPlayers -= 1;
      }
    }

    // Add defenders
    const defSpacing = 80 / (defenders + 1);
    for (let i = 0; i < defenders; i++) {
      positions.push({ top: defenseTop, left: defSpacing * (i + 1) + 10 }); // +10 for some padding
    }

    // Add midfielders
    const midSpacing = 80 / (midfielders + 1);
    for (let i = 0; i < midfielders; i++) {
      positions.push({ top: midfieldTop, left: midSpacing * (i + 1) + 10 });
    }

    // Add forwards
    const attSpacing = 80 / (forwards + 1);
    for (let i = 0; i < forwards; i++) {
      positions.push({ top: attackTop, left: attSpacing * (i + 1) + 10 });
    }

    // Distribute any remaining outfield players if the numbers don't perfectly fit the formation
    while (outfieldPlayers > 0) {
      positions.push({
        top: 40 + Math.random() * 20,
        left: 20 + Math.random() * 60,
      });
      outfieldPlayers--;
    }

    // Adjust positions for away team to be mirrored vertically
    return positions.map((p) => ({
      top: isHome ? p.top : 100 - p.top,
      left: p.left,
    }));
  };

  // Generate the final list of all positions with their data
  const allPositions = [];
  const homeTeamPositions = getFormationPositions(playersPerTeam, true);
  const awayTeamPositions = getFormationPositions(playersPerTeam, false);

  for (let i = 0; i < playersPerTeam; i++) {
    const defaultPos = homeTeamPositions[i] || { top: 50, left: 50 }; // Fallback if formation is smaller than maxPlayers
    allPositions.push({
      id: i, // Unique ID for each spot
      defaultTop: `${defaultPos.top}%`,
      defaultLeft: `${defaultPos.left}%`,
      isHomeTeam: true,
      player: fieldMap[i] || null, // Assign player from fieldMap
    });
  }
  for (let i = 0; i < playersPerTeam; i++) {
    const defaultPos = awayTeamPositions[i] || { top: 50, left: 50 }; // Fallback
    allPositions.push({
      id: playersPerTeam + i, // Unique ID
      defaultTop: `${defaultPos.top}%`,
      defaultLeft: `${defaultPos.left}%`,
      isHomeTeam: false,
      player: fieldMap[playersPerTeam + i] || null, // Assign player from fieldMap
    });
  }

  const fieldRef = useRef(null);
  const [fieldSize, setFieldSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (fieldRef.current) {
      const rect = fieldRef.current.getBoundingClientRect();
      setFieldSize({ width: rect.width, height: rect.height });
    }
    const handleResize = () => {
      if (fieldRef.current) {
        const rect = fieldRef.current.getBoundingClientRect();
        setFieldSize({ width: rect.width, height: rect.height });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Convertir % a px para drag inicial
  const percentToPx = (percent, size) => (parseFloat(percent) / 100) * size;
  // Convertir px a % para guardar
  const pxToPercent = (px, size) => (px / size) * 100;

  // Estado para mostrar mensaje de copiado o enlace a WhatsApp
  const [copied, setCopied] = React.useState(false);
  const shareUrl = `${window.location.origin}/matches/${matchId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Function to share via WhatsApp
  const handleShareWhatsApp = () => {
    const remainingPlayers = maxPlayers - currentPlayersCount;
    const message = `⚽ ¡Partido de Fútbol Abierto! ⚽\n\n${matchTitle}\n🗓️ ${format(
      new Date(matchDate),
      "dd MMM HH:mm",
      { locale: es }
    )}\n📍 ${matchLocation}\n${
      remainingPlayers > 0
        ? `🔥 ¡Necesitamos ${remainingPlayers} jugadores!`
        : "¡Partido completo!"
    }\n\nÚnete aquí: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div
      className={`${colorsSporty.cardBg} p-6 rounded-2xl mb-6 shadow-xl border ${colorsSporty.cardBorder}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Esquema del Partido</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 ${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover}`}
            title="Copiar link para compartir"
          >
            <FiShare2 className="text-xl" />
            {copied ? "¡Copiado!" : "Copiar Enlace"}
          </button>
          <button
            onClick={handleShareWhatsApp}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 ${colorsSporty.accentOrange} hover:${colorsSporty.accentOrangeHover}`}
            title="Compartir por WhatsApp"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.687-3.833-1.687-5.977C0 6.577 6.577 0 14.285 0S28.57 6.577 28.57 14.285c0 3.864-1.928 7.373-5.02 9.588l-1.463 1.056-1.523.518-6.104-1.684zm11.91-4.468c.365.2.73.4.992.4S14 19.835 14.285 19.47c.262-.365.262-.656.365-.898.103-.23.103-.492.052-.73s-.103-.492-.154-.656c-.052-.154-.103-.257-.154-.36c-.052-.103-.103-.206-.103-.309-.052-.103-.154-.257-.257-.36s-.206-.154-.309-.206c-.103-.052-.257-.103-.36-.154-.103-.052-.257-.103-.492-.154-.23-.052-.464-.052-.73-.103s-.464-.103-.73-.154c-.262-.052-.464-.103-.73-.103-.23-.052-.464-.052-.656-.052-.192-.052-.36-.052-.574-.052s-.492 0-.685.103c-.23.103-.492.206-.656.36s-.262.365-.365.656-.154.59-.154.898c0 .365.052.73.154.992.103.262.262.492.464.73s.464.4.73.492c.262.052.544.052.835.052s.59-.052.898-.052c.262-.052.544-.103.73-.103.206-.052.409-.103.59-.206.192-.103.36-.154.544-.262zM14.285 4.398c-5.465 0-9.887 4.422-9.887 9.887 0 1.954.544 3.738 1.488 5.347l.154.206-1.288 4.708 4.856-1.288.206.103c1.55 1.018 3.313 1.637 5.176 1.637 5.465 0 9.887-4.422 9.887-9.887S19.75 4.398 14.285 4.398z" />
            </svg>
            WhatsApp
          </button>
        </div>
      </div>

      <div
        ref={fieldRef}
        className="relative w-full aspect-[3/5] sm:h-[650px] bg-gradient-to-br from-green-800 to-green-950 rounded-xl border-4 border-lime-500 overflow-hidden shadow-inner shadow-green-950"
        style={{
          minHeight: 400,
        }}
      >
        {/* Cancha de fútbol Sporty (Redibujada para ser más distintiva) */}
        <div className="absolute border-4 border-white border-dashed rounded-xl w-[95%] h-[95%] inset-0 m-auto opacity-70"></div>
        <div className="absolute border-4 border-white rounded-full w-28 h-28 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-70"></div>
        <div className="absolute w-1/2 h-full border-r-4 border-white border-dashed left-0 top-0 opacity-70"></div>
        <div className="absolute w-1/2 h-full border-l-4 border-white border-dashed right-0 top-0 opacity-70"></div>
        {/* Goal areas - Más pronunciadas y oscuras */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4/5 h-1/4 border-b-4 border-white opacity-70 rounded-b-2xl"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-1/4 border-t-4 border-white opacity-70 rounded-t-2xl"></div>

        {/* Puntos de penalti - añadidos para detalle */}
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white opacity-70"></div>
        <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white opacity-70"></div>

        {allPositions.map((pos) => {
          // Determine the actual position (player's stored position or default)
          const actualTop = pos.player?.top || pos.defaultTop;
          const actualLeft = pos.player?.left || pos.defaultLeft;

          // Convert percentages to pixels for positioning
          const topPx = percentToPx(actualTop, fieldSize.height);
          const leftPx = percentToPx(actualLeft, fieldSize.width);

          return (
            <motion.div
              key={pos.id}
              className="absolute"
              style={{
                top: 0,
                left: 0,
                // Adjust for player circle size (w-12 h-12 = 48px) so drag centers them
                x: leftPx - 0.5 * 48,
                y: topPx - 0.5 * 48,
                zIndex: 2,
                width: 48, // Corresponds to w-12 in PlayerPosition
                height: 48, // Corresponds to h-12 in PlayerPosition
              }}
              drag={isCreator} // Only allow creator to drag
              dragMomentum={false}
              dragConstraints={fieldRef}
              onDragEnd={(e, info) => {
                if (!fieldRef.current || !isCreator) return;
                const rect = fieldRef.current.getBoundingClientRect();
                let x = info.point.x - rect.left;
                let y = info.point.y - rect.top;

                // Constrain drag within field boundaries with padding for player circle
                const playerSizePx = 48;
                x = Math.max(
                  playerSizePx / 2,
                  Math.min(x, rect.width - playerSizePx / 2)
                );
                y = Math.max(
                  playerSizePx / 2,
                  Math.min(y, rect.height - playerSizePx / 2)
                );

                const newLeftPercent = pxToPercent(x, rect.width);
                const newTopPercent = pxToPercent(y, rect.height);

                // If a player is already assigned to this spot, update their position
                // Otherwise, it's an empty spot being dragged (which should not happen for now, but good to handle)
                const updatedPlayer = pos.player
                  ? {
                      ...pos.player,
                      top: `${newTopPercent}%`,
                      left: `${newLeftPercent}%`,
                    }
                  : {
                      // This part might need further refinement depending on how joining empty spots works
                      id: `empty-spot-${pos.id}`,
                      name: "Posición vacía", // Changed from 'nombre' to 'name' for consistency with PlayerPosition
                      avatar:
                        "https://via.placeholder.com/150/0f172a/9ca3af?text=?",
                      top: `${newTopPercent}%`,
                      left: `${newLeftPercent}%`,
                    };
                onMovePosition(pos.id, updatedPlayer);
              }}
            >
              <PlayerPosition
                position={pos.player} // Pass the actual player object or null
                idx={pos.id} // Pass the unique spot ID
                onJoin={onJoin}
                user={user}
                isFull={isFull} // This might need refinement if fieldMap already includes the joining player
                title={
                  pos.player?.nombre || // Use 'nombre' from API
                  `Posición ${
                    pos.id < playersPerTeam ? "Local" : "Visitante"
                  } ${(pos.id % playersPerTeam) + 1}`
                }
                isHomeTeam={pos.isHomeTeam}
                dragHandleProps={
                  isCreator
                    ? { className: "cursor-grab active:cursor-grabbing" }
                    : {}
                }
              />
            </motion.div>
          );
        })}
      </div>
      <div
        className={`flex justify-between mt-6 text-base font-semibold ${colorsSporty.secondaryText}`}
      >
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-lime-500 mr-2 border border-gray-900"></div>
          <span>
            Equipo Local •{" "}
            {fieldMap.slice(0, playersPerTeam).filter((p) => p).length}/
            {playersPerTeam}
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-orange-500 mr-2 border border-gray-900"></div>
          <span>
            Equipo Visitante •{" "}
            {fieldMap.slice(playersPerTeam).filter((p) => p).length}/
            {playersPerTeam}
          </span>
        </div>
      </div>
    </div>
  );
}

function SkillLevel({ level }) {
  const stars = {
    beginner: 1,
    medium: 2,
    advanced: 3,
    competitive: 4,
  };

  return (
    <div className="flex items-center gap-1">
      <span
        className={`text-base ${colorsSporty.secondaryText} mr-2 font-medium`}
      >
        Nivel:
      </span>
      {[...Array(4)].map((_, i) =>
        i < stars[level] ? (
          <FaStar key={i} className="text-amber-400 text-lg" />
        ) : (
          <FaRegStar key={i} className="text-gray-600 text-lg" />
        )
      )}
    </div>
  );
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

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

export default function MatchDetail() {
  const { id } = useParams();
  const { user, updateFieldMap } = useStore(); // Removed 'matches' and 'joinMatch' from useStore as they will be handled by local state/API calls now
  const [match, setMatch] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [fieldMap, setFieldMap] = React.useState([]); // This needs to be declared at the top level of the component
  const [codigoInput, setCodigoInput] = useState("");
  const [codigoError, setCodigoError] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  // Effect to fetch match data from the API
  React.useEffect(() => {
    const fetchMatch = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/matches/${id}`);
        // Map API response to match existing component structure
        const apiMatch = response.data;
        setMatch({
          id: apiMatch.id,
          title: apiMatch.titulo, // Map 'titulo' to 'title'
          fecha: apiMatch.fecha, // Guardar fecha como string YYYY-MM-DD
          hora: apiMatch.hora, // Guardar hora como string HH:mm
          location: apiMatch.direccion, // Map 'direccion' to 'location'
          creator: apiMatch.creador,
          players: apiMatch.jugadores,
          maxPlayers: apiMatch.maxPlayers,
          fieldMap: apiMatch.fieldMap, // This should come from API if positions are saved
          description: apiMatch.descripcion,
          price: apiMatch.precio,
          status: apiMatch.estado,
          isPrivate: apiMatch.privado, // Map 'privado' to 'isPrivate'
          skillLevel: apiMatch.skillLevel, // Assuming skillLevel might be present or added later
          codigoPrivado: apiMatch.codigoPrivado, // <-- Agregado para que esté disponible
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

  // Effect to initialize fieldMap when match data is available
  React.useEffect(() => {
    if (match && match.maxPlayers) {
      const totalPlayersSlots = match.maxPlayers * 2; // Total slots for both teams
      const initialFieldMap = Array(totalPlayersSlots).fill(null);

      // Populate fieldMap from existing players, prioritizing `fieldMap` if present
      if (match.fieldMap && match.fieldMap.length > 0) {
        match.fieldMap.forEach((player, idx) => {
          if (idx < initialFieldMap.length) {
            initialFieldMap[idx] = player;
          }
        });
      } else {
        // If no fieldMap from API, distribute players sequentially to fill available slots
        match.players.forEach((player, idx) => {
          if (idx < initialFieldMap.length) {
            initialFieldMap[idx] = player;
          }
        });
      }
      setFieldMap(initialFieldMap);
    } else {
      setFieldMap([]);
    }
  }, [match?.fieldMap, match?.maxPlayers, match?.players]); // Add match.players as a dependency

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
  const dateBadge = match?.date ? <DateBadge date={match.date} /> : null;

  const token = localStorage.getItem("token");

  const handleJoin = async (idx, isHomeTeam) => {
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
      // API call to actually join the match
      const response = await api.post(
        `/matches/${match.id}/join`,
        {
          userId: user.id,
          positionIndex: idx, // Pass the chosen position index
          isHomeTeam: isHomeTeam, // Pass the team choice
          codigoPrivado: match.isPrivate ? codigoInput : undefined, // Solo si es privado
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update match state from API response to ensure consistency
      setMatch((prevMatch) => ({
        ...prevMatch,
        players: response.data.players || prevMatch.players,
        fieldMap: response.data.fieldMap || prevMatch.fieldMap,
      }));
      setCodigoInput(""); // Limpiar input tras unirse
    } catch (err) {
      console.error("Error joining match:", err);
      alert("No se pudo unir al partido. Inténtalo de nuevo.");
    } finally {
      setJoinLoading(false);
    }
  };

  const isCreator = user && match.creator && match.creator.id === user.id;

  // Manejar movimiento de posición y guardar en store global
  const handleMovePosition = async (idx, jugador) => {
    // Optimistic update
    setFieldMap((prev) => {
      const updated = [...prev];
      updated[idx] = jugador;
      return updated;
    });

    try {
      // Call API to save new position
      await api.put(`/matches/${match.id}/fieldmap`, {
        fieldMap: fieldMap, // Send the entire updated fieldMap
      });
      // No need to update local state from store if API is the source of truth for fieldMap
    } catch (err) {
      console.error("Error updating player position:", err);
      alert("No se pudo actualizar la posición del jugador.");
      // Potentially revert or refetch if there's a serious sync issue
    }
  };

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
                  <span
                    className={`inline-block ${colorsSporty.secondaryBg} ${colorsSporty.secondaryText} text-xs px-3 py-1 rounded-full mb-2 font-semibold border ${colorsSporty.cardBorder}`}
                  >
                    Partido privado
                  </span>
                )}
              </div>
              {dateBadge}
            </div>

            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-lg mb-6 ${colorsSporty.secondaryText}`}
            >
              <div className="flex items-center">
                <FiCalendar
                  className={`mr-3 ${colorsSporty.accentLimeText} text-2xl`}
                />
                <span>
                  {match?.fecha
                    ? `${format(parseISO(match.fecha), "PPPP", {
                        locale: es,
                      })} a las ${match.hora}`
                    : "Sin fecha"}
                </span>
              </div>

              <div className="flex items-center">
                <FiMapPin
                  className={`mr-3 ${colorsSporty.accentLimeText} text-2xl`}
                />
                <span>{match.location}</span>
              </div>

              {match.skillLevel && (
                <div className="flex items-center">
                  <SkillLevel level={match.skillLevel} />
                </div>
              )}

              <div className="flex items-center">
                <FiUsers
                  className={`mr-3 ${colorsSporty.accentLimeText} text-2xl`}
                />
                <span
                  className={`$${
                    isFull
                      ? "text-orange-500 font-bold"
                      : "text-white font-semibold"
                  }`}
                >
                  {currentPlayersCount}/{maxPlayersTotal} jugadores
                </span>
              </div>
            </div>

            {match.description && (
              <div
                className={`${colorsSporty.secondaryBg} rounded-lg p-5 mb-8 border ${colorsSporty.cardBorder}`}
              >
                <p
                  className={`${colorsSporty.secondaryText} text-base leading-relaxed`}
                >
                  {match.description}
                </p>
              </div>
            )}

            {match.price > 0 && (
              <div className="mb-8 text-right">
                <span
                  className={`${colorsSporty.accentLime} text-lg px-4 py-2 rounded-full font-bold`}
                >
                  ${match.price} por jugador
                </span>
              </div>
            )}

            <FieldMap
              fieldMap={fieldMap}
              onJoin={handleJoin}
              user={user}
              isFull={isFull}
              maxPlayers={maxPlayersTotal}
              onMovePosition={handleMovePosition}
              isCreator={isCreator}
              matchId={id}
              matchTitle={match.title}
              matchDate={match.date}
              matchLocation={match.location}
              currentPlayersCount={currentPlayersCount}
            />

            <div className="mt-8">
              <h3 className="text-2xl font-bold text-white mb-5">
                Jugadores Inscritos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Equipo Local */}
                <div
                  className={`${colorsSporty.secondaryBg} p-6 rounded-xl border ${colorsSporty.cardBorder}`}
                >
                  <h4 className="font-bold text-xl text-lime-400 mb-4 flex items-center">
                    <div className="w-4 h-4 rounded-full bg-lime-500 mr-3 border border-gray-900"></div>
                    Equipo Local (
                    {
                      fieldMap
                        .slice(0, Math.ceil(maxPlayersTotal / 2))
                        .filter((p) => p).length
                    }
                    /{Math.ceil(maxPlayersTotal / 2)})
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {fieldMap.slice(0, Math.ceil(maxPlayersTotal / 2)).map(
                      (player, idx) =>
                        player && (
                          <div
                            key={player.id || idx} // Use player.id for key, fallback to idx
                            className={`flex items-center ${colorsSporty.cardBg} rounded-full px-4 py-2 border border-gray-700 shadow-sm`}
                          >
                            <img
                              src={
                                player.avatar ||
                                "https://via.placeholder.com/150/0f172a/9ca3af?text=JP"
                              } // Fallback avatar
                              alt={player.nombre || "Jugador"} // Use player.nombre
                              className="w-8 h-8 rounded-full mr-3 object-cover border-2 border-lime-500"
                            />
                            <span
                              className={`text-base font-semibold ${colorsSporty.primaryText}`}
                            >
                              {player?.nombre
                                ? player.nombre.split(" ")[0]
                                : "Sin nombre"}
                            </span>
                          </div>
                        )
                    )}
                  </div>
                </div>

                {/* Equipo Visitante */}
                <div
                  className={`${colorsSporty.secondaryBg} p-6 rounded-xl border ${colorsSporty.cardBorder}`}
                >
                  <h4 className="font-bold text-xl text-orange-400 mb-4 flex items-center">
                    <div className="w-4 h-4 rounded-full bg-orange-500 mr-3 border border-gray-900"></div>
                    Equipo Visitante (
                    {
                      fieldMap
                        .slice(Math.ceil(maxPlayersTotal / 2))
                        .filter((p) => p).length
                    }
                    /{Math.ceil(maxPlayersTotal / 2)})
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {fieldMap.slice(Math.ceil(maxPlayersTotal / 2)).map(
                      (player, idx) =>
                        player && (
                          <div
                            key={player.id || idx} // Use player.id for key, fallback to idx
                            className={`flex items-center ${colorsSporty.cardBg} rounded-full px-4 py-2 border border-gray-700 shadow-sm`}
                          >
                            <img
                              src={
                                player.avatar ||
                                "https://via.placeholder.com/150/0f172a/9ca3af?text=JP"
                              } // Fallback avatar
                              alt={player.nombre || "Jugador"} // Use player.nombre
                              className="w-8 h-8 rounded-full mr-3 object-cover border-2 border-orange-500"
                            />
                            <span
                              className={`text-base font-semibold ${colorsSporty.primaryText}`}
                            >
                              {player?.nombre
                                ? player.nombre.split(" ")[0]
                                : "Sin nombre"}
                            </span>
                          </div>
                        )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {match.isPrivate && isCreator && (
              <div className="mb-6 flex flex-col items-start">
                <span className="text-lime-400 font-bold text-lg mb-1">Código privado para compartir:</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-mono bg-gray-800 px-4 py-2 rounded-lg border border-lime-500 text-lime-400 select-all">{match.codigoPrivado || "-"}</span>
                  <button
                    onClick={() => {navigator.clipboard.writeText(match.codigoPrivado)}}
                    className="p-2 rounded-lg bg-lime-500 hover:bg-lime-400 text-gray-900 font-bold"
                    title="Copiar código"
                  >
                    <FiCopy size={20} />
                  </button>
                </div>
                <span className="text-sm text-gray-400 mt-1">Solo tú puedes ver este código.</span>
              </div>
            )}
            {match.isPrivate && !isCreator && !isFull && !match.players.some((player) => player.id === user?.id) && (
              <div className="mb-6 flex flex-col items-start">
                <label className="text-lime-400 font-bold text-lg mb-1">¿Tienes un código privado?</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={codigoInput}
                    onChange={e => setCodigoInput(e.target.value.toUpperCase())}
                    placeholder="Ingresa el código"
                    className="px-4 py-2 rounded-lg bg-gray-800 border border-lime-500 text-lime-400 font-mono text-xl focus:outline-none"
                    maxLength={10}
                    disabled={joinLoading}
                  />
                  <button
                    className="px-4 py-2 rounded-lg bg-lime-500 hover:bg-lime-400 text-gray-900 font-bold disabled:bg-gray-600 disabled:text-gray-300"
                    onClick={async () => {
                      setCodigoError("");
                      if (codigoInput !== match.codigoPrivado) {
                        setCodigoError("Código incorrecto. Verifica con el organizador.");
                        return;
                      }
                      await handleJoin(null, true);
                    }}
                    disabled={joinLoading || !codigoInput}
                  >
                    {joinLoading ? "Uniendo..." : "Unirse"}
                  </button>
                </div>
                {codigoError && <span className="text-red-400 mt-1">{codigoError}</span>}
              </div>
            )}
            {match.isPrivate && !isCreator && !isFull && match.players.some((player) => player.id === user?.id) && (
              <div className="mb-6 flex flex-col items-start">
                <span className="inline-block bg-lime-600 text-gray-900 text-base font-bold px-4 py-2 rounded-full shadow mt-2">
                  ¡Ya estás unido a este partido!
                </span>
              </div>
            )}
          </div>

          {/* Footer del detalle del partido */}
          <div
            className={`${colorsSporty.secondaryBg} px-8 py-5 border-t ${colorsSporty.cardBorder} flex justify-between items-center`}
          >
            <div className={`text-sm ${colorsSporty.secondaryText}`}>
              Creado por{" "}
              <span className="font-semibold text-white">
                {match.creator?.nombre || "Desconocido"}
              </span>
            </div>
            {!isFull &&
              user &&
              !isCreator &&
              !match.players.some((player) => player.id === user.id) &&
              !match.isPrivate && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`${colorsSporty.accentOrange} hover:${colorsSporty.accentOrangeHover} px-6 py-2.5 rounded-lg text-base font-bold uppercase tracking-wide transition-all duration-300`}
                  onClick={() => handleJoin(null, true)}
                >
                  Unirse al partido
                </motion.button>
              )}
            {/* Show message if creator, or if full or already joined */}
            {(isCreator ||
              isFull ||
              match.players.some((player) => player.id === user?.id)) && (
              <span
                className={`${colorsSporty.accentOrangeText} text-base font-bold uppercase`}
              >
                {isCreator
                  ? "Eres el creador"
                  : match.players.some((player) => player.id === user?.id)
                  ? "Ya estás unido"
                  : "Partido Lleno"}
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
