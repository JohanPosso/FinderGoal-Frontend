import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaFutbol } from "react-icons/fa";
import { motion } from "framer-motion"; // Import motion for animations
import { FiMenu, FiX, FiLogOut, FiUser } from "react-icons/fi"; // Import icons for mobile menu
import { useStore } from "../store/useStore";

// Re-using the color configuration from the Sporty & Energetic landing page
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

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useStore();

  const navLinks = [
    { name: "Inicio", path: "/" },
    { name: "Partidos", path: "/matches" },
    { name: "Canchas", path: "/fields" },
    { name: "Comunidad", path: "/community" },
    { name: "WhatsApp Listado", path: "/whatsapp-parser" },
  ];

  const SportyNavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`relative text-lg font-semibold uppercase tracking-wide transition-all duration-300
          ${colorsSporty.primaryText} hover:text-lime-400
          ${isActive ? "text-lime-400" : "text-gray-300"}`}
      >
        {children}
        {isActive && (
          <motion.span
            layoutId="underline"
            className="absolute left-0 bottom-[-5px] h-0.5 w-full bg-lime-400 rounded-full"
          />
        )}
      </Link>
    );
  };

  const MobileMenuLink = ({ to, children, onClick }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`block py-3 px-4 text-xl font-bold transition-colors duration-200
          ${
            isActive
              ? "bg-lime-600 text-gray-900"
              : "text-white hover:bg-gray-700"
          }`}
      >
        {children}
      </Link>
    );
  };

  const SportyButton = ({
    children,
    className = "",
    variant = "solid",
    ...props
  }) => (
    <motion.button
      whileHover={{ scale: 1.05, boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }}
      whileTap={{ scale: 0.95 }}
      className={`px-6 py-2.5 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 ${
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

  return (
    <nav
      className={`${colorsSporty.primaryBg} ${colorsSporty.primaryText} shadow-lg py-4 px-6 relative z-50`}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <FaFutbol className="text-3xl text-lime-500 mr-2 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-2xl font-extrabold text-white">FinderGoal</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <SportyNavLink key={link.name} to={link.path}>
              {link.name}
            </SportyNavLink>
          ))}
        </div>

        {/* Auth/Profile Buttons */}
        <div className="hidden md:flex gap-4 items-center">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex items-center gap-2 group">
                <img
                  src={user.avatar || "/icono-default.png"}
                  alt="avatar"
                  className="w-9 h-9 rounded-full border-2 border-lime-400 shadow"
                />
                <span className="font-semibold text-lime-400 group-hover:underline">
                  {user.name || user.nombre}
                </span>
              </Link>
              <SportyButton
                variant="outline"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="flex items-center gap-2"
              >
                <FiLogOut /> Salir
              </SportyButton>
            </div>
          ) : (
            <>
              <Link to="/login">
                <SportyButton variant="outline">Iniciar sesión</SportyButton>
              </Link>
              <Link to="/register">
                <SportyButton variant="solid">Registrarse</SportyButton>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white text-3xl"
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`md:hidden ${colorsSporty.secondaryBg} absolute top-full left-0 w-full shadow-lg border-b border-gray-700`}
        >
          <div className="flex flex-col py-4">
            {navLinks.map((link) => (
              <MobileMenuLink
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </MobileMenuLink>
            ))}
            <div className="mt-6 pt-4 border-t border-gray-700 flex flex-col gap-4 px-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 mb-2"
                  >
                    <img
                      src={user.avatar || "/icono-default.png"}
                      alt="avatar"
                      className="w-9 h-9 rounded-full border-2 border-lime-400 shadow"
                    />
                    <span className="font-semibold text-lime-400">
                      {user.name || user.nombre}
                    </span>
                  </Link>
                  <SportyButton
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                      navigate("/");
                    }}
                  >
                    <FiLogOut /> Salir
                  </SportyButton>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <SportyButton variant="outline" className="w-full">
                      Iniciar sesión
                    </SportyButton>
                  </Link>
                  <Link to="/register">
                    <SportyButton variant="solid" className="w-full">
                      Registrarse
                    </SportyButton>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
