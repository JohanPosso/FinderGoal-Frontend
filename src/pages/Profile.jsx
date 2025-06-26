import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { motion } from "framer-motion";
import { FiEdit, FiLogOut, FiUsers, FiFrown, FiAward, FiMail, FiUser } from "react-icons/fi";
import { FaFutbol } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getAvatarUrl } from "../utils/helpers";

// Paleta deportiva
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

export default function Profile() {
  const { user, logout } = useStore();
  const [editMode, setEditMode] = useState(false);
  const [nombre, setNombre] = useState(user?.nombre || user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  // Simulación de estadísticas (puedes conectar a la API real en el futuro)
  const stats = {
    partidosJugados: user?.partidosJugados || 0,
    partidosCreados: user?.partidosCreados || 0,
    goles: user?.goles || 0,
    asistencias: user?.asistencias || 0,
    nivel: user?.nivel || "Intermedio",
  };

  if (!user)
    return (
      <div className={`${colorsSporty.primaryBg} min-h-screen flex items-center justify-center ${colorsSporty.primaryText}`}>
        <div className="p-8 text-center bg-gray-800 rounded-xl shadow-xl border border-gray-700">
          <FiFrown className="mx-auto text-5xl text-orange-400 mb-4" />
          <div className="text-xl font-bold mb-2">No has iniciado sesión.</div>
          <Link to="/login" className="text-lime-400 hover:underline">Iniciar sesión</Link>
        </div>
      </div>
    );

  return (
    <div className={`${colorsSporty.primaryBg} min-h-screen py-10 px-4 ${colorsSporty.primaryText}`}>
      <div className="max-w-2xl mx-auto">
        {/* Tarjeta de perfil */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`rounded-2xl ${colorsSporty.cardBg} ${colorsSporty.shadowPrimary} border ${colorsSporty.cardBorder} p-8 flex flex-col items-center mb-10`}
        >
          <div className="relative mb-4">
            <img
              src={getAvatarUrl(avatar) || "/default-avatar.png"}
              alt="avatar"
              className="w-32 h-32 rounded-full border-4 border-lime-500 shadow-lg object-cover"
            />
            <button
              className="absolute bottom-2 right-2 bg-lime-500 hover:bg-lime-400 text-gray-900 rounded-full p-2 shadow"
              onClick={() => setEditMode((v) => !v)}
              title="Editar perfil"
            >
              <FiEdit />
            </button>
          </div>
          {editMode ? (
            <form className="w-full flex flex-col items-center gap-3 mb-2">
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="w-full max-w-xs px-4 py-2 rounded-lg bg-gray-700 border border-lime-500 text-white text-lg focus:outline-none"
                placeholder="Nombre"
              />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full max-w-xs px-4 py-2 rounded-lg bg-gray-700 border border-lime-500 text-white text-lg focus:outline-none"
                placeholder="Email"
              />
              <input
                type="text"
                value={avatar}
                onChange={e => setAvatar(e.target.value)}
                className="w-full max-w-xs px-4 py-2 rounded-lg bg-gray-700 border border-lime-500 text-white text-lg focus:outline-none"
                placeholder="URL del avatar"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg bg-lime-500 hover:bg-lime-400 text-gray-900 font-bold"
                  onClick={() => setEditMode(false)}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold"
                  onClick={() => setEditMode(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <h2 className="text-3xl font-extrabold text-lime-400 mb-1 text-center flex items-center gap-2">
                <FiUser className="inline-block text-2xl" /> {nombre}
              </h2>
              <div className="text-gray-400 mb-2 flex items-center gap-2">
                <FiMail /> {email}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm bg-lime-600 text-gray-900 px-3 py-1 rounded-full font-bold">Nivel: {stats.nivel}</span>
              </div>
            </>
          )}
          <button
            className="mt-4 px-6 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center gap-2"
            onClick={logout}
          >
            <FiLogOut /> Cerrar sesión
          </button>
        </motion.div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-gray-800 rounded-xl p-5 flex flex-col items-center border border-gray-700 shadow">
            <FaFutbol className="text-3xl text-lime-400 mb-2" />
            <span className="text-lg font-bold text-white">{stats.partidosJugados}</span>
            <span className="text-xs text-gray-400">Jugados</span>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 flex flex-col items-center border border-gray-700 shadow">
            <FiUsers className="text-3xl text-orange-400 mb-2" />
            <span className="text-lg font-bold text-white">{stats.partidosCreados}</span>
            <span className="text-xs text-gray-400">Creados</span>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 flex flex-col items-center border border-gray-700 shadow">
            <FiAward className="text-3xl text-yellow-400 mb-2" />
            <span className="text-lg font-bold text-white">{stats.goles}</span>
            <span className="text-xs text-gray-400">Goles</span>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 flex flex-col items-center border border-gray-700 shadow">
            <FiAward className="text-3xl text-blue-400 mb-2" />
            <span className="text-lg font-bold text-white">{stats.asistencias}</span>
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

        {/* Acceso rápido a partidos creados y jugados (futuro: links reales) */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-orange-400 mb-3 flex items-center gap-2">
            <FaFutbol /> Mis partidos
          </h3>
          <div className="flex flex-col gap-2">
            <Link to="/dashboard" className="text-lime-400 hover:underline">Ver mis partidos creados y jugados</Link>
            <span className="text-gray-500 text-sm">(Próximamente: historial, favoritos, estadísticas avanzadas...)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
