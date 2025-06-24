import React from "react";
import { motion } from "framer-motion";
import { FaUsers } from "react-icons/fa";

// Reutilizando la configuración de colores de Matches.jsx
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

export default function Community() {
  return (
    <div className={`${colorsSporty.primaryBg} min-h-screen flex items-center justify-center px-6 ${colorsSporty.primaryText}`}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className={`max-w-xl w-full text-center p-12 rounded-2xl ${colorsSporty.secondaryBg} ${colorsSporty.shadowPrimary} border ${colorsSporty.cardBorder}`}
      >
        <FaUsers className="mx-auto text-7xl mb-6 text-lime-500 opacity-80" />
        <h1 className="text-4xl font-extrabold mb-4">
          Comunidad <span className={colorsSporty.accentLimeText}>FinderGoal</span>
        </h1>
        <p className={`text-xl mb-6 ${colorsSporty.secondaryText}`}>
          ¡Estamos trabajando en una sección de comunidad para que puedas conectar, compartir y vivir el fútbol con otros jugadores!
        </p>
        <span className={`inline-block px-6 py-2 rounded-full font-bold uppercase tracking-wide text-lg ${colorsSporty.accentOrange} ${colorsSporty.shadowAccent}`}>
          Próximamente
        </span>
      </motion.div>
    </div>
  );
} 