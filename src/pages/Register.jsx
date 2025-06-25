import React, { useState } from "react";
import { useStore } from "../store/useStore"; // Assuming this path is correct
import { useNavigate, Link } from "react-router-dom"; // Import Link for navigation
import { motion } from "framer-motion"; // For subtle animations
import { FaFutbol } from "react-icons/fa"; // For the logo icon
import { FiUser, FiMail } from "react-icons/fi"; // Icons for input fields
import { GoogleLogin } from "@react-oauth/google";
import api from "../utils/axios";

// Re-using the color configuration from the Sporty & Energetic theme
const colorsSporty = {
  primaryBg: "bg-gray-900", // Fondo oscuro principal
  secondaryBg: "bg-gray-800", // Fondo secundario para formularios/tarjetas
  primaryText: "text-white", // Texto principal
  secondaryText: "text-gray-300", // Texto secundario
  accentLime: "bg-lime-500 text-gray-900", // Verde lima brillante para botones principales
  accentLimeHover: "bg-lime-400",
  accentOrange: "bg-orange-500 text-white", // Naranja intenso para botones secundarios/acentos
  accentOrangeHover: "bg-orange-600",
  accentOrangeText: "text-orange-400",
  inputBg: "bg-gray-700",
  inputBorder: "border-gray-700",
  inputFocusRing: "focus:ring-lime-500",
  errorText: "text-orange-400", // Texto de error en naranja
  shadowPrimary: "shadow-xl",
  shadowAccent: "shadow-lime-500/30",
  cardBorder: "border-gray-700",
};

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useStore();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        email,
        nombre: name,
        password,
      });
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al registrar. Intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setError("");
      
      const response = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });
      
      if (response.data && response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        register(response.data.user);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error en autenticación con Google:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Error al autenticar con Google. Intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Error al autenticar con Google. Intenta de nuevo.");
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${colorsSporty.primaryBg} ${colorsSporty.primaryText}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${colorsSporty.secondaryBg} p-8 rounded-2xl ${colorsSporty.shadowPrimary} ${colorsSporty.shadowAccent} w-full max-w-md border ${colorsSporty.cardBorder}`}
      >
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <FaFutbol
            className={`text-6xl ${colorsSporty.accentOrangeText} mb-4`}
          />{" "}
          {/* Orange accent for register */}
          <h2 className="text-4xl font-extrabold text-white text-center tracking-wide">
            Únete a la{" "}
            <span className={colorsSporty.accentOrangeText}>Cancha</span>
          </h2>
          <p
            className={`${colorsSporty.secondaryText} mt-2 text-lg text-center`}
          >
            Regístrate y empieza a jugar.
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="filled_black"
            size="large"
            text="continue_with"
            shape="rectangular"
            locale="es"
            disabled={isLoading}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name Input */}
          <div className="relative mb-5">
            <FiUser
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl ${colorsSporty.secondaryText}`}
            />
            <motion.input
              whileFocus={{
                scale: 1.01,
                boxShadow: "0 0 0 4px rgba(251, 146, 60, 0.2)",
              }} // Custom focus ring with orange
              type="text"
              className={`w-full pl-12 pr-5 py-3 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 placeholder-gray-400 font-medium text-lg`}
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Email Input */}
          <div className="relative mb-5">
            <FiMail
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl ${colorsSporty.secondaryText}`}
            />
            <motion.input
              whileFocus={{
                scale: 1.01,
                boxShadow: "0 0 0 4px rgba(251, 146, 60, 0.2)",
              }} // Custom focus ring with orange
              type="email"
              className={`w-full pl-12 pr-5 py-3 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 placeholder-gray-400 font-medium text-lg`}
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div className="relative mb-5">
            <span
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl ${colorsSporty.secondaryText}`}
            >
              {/* Puedes usar un ícono de candado si lo deseas */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3m12 0A2.25 2.25 0 0121 12.75v6A2.25 2.25 0 0118.75 21h-13.5A2.25 2.25 0 013 18.75v-6A2.25 2.25 0 015.25 10.5h13.5z"
                />
              </svg>
            </span>
            <motion.input
              whileFocus={{
                scale: 1.01,
                boxShadow: "0 0 0 4px rgba(251, 146, 60, 0.2)",
              }} // Custom focus ring with orange
              type="password"
              className={`w-full pl-12 pr-5 py-3 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 placeholder-gray-400 font-medium text-lg`}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${colorsSporty.errorText} text-sm mb-4 text-center font-medium`}
            >
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03, boxShadow: "0 6px 12px rgba(0,0,0,0.3)" }}
            whileTap={{ scale: 0.97 }}
            disabled={isLoading}
            className={`w-full ${colorsSporty.accentOrange} hover:${colorsSporty.accentOrangeHover} ${colorsSporty.primaryText} py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? "Registrando..." : "Registrarse"}
          </motion.button>
        </form>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <span className={`${colorsSporty.secondaryText} text-lg`}>
            ¿Ya tienes cuenta?{" "}
          </span>
          <Link
            to="/login"
            className={`${colorsSporty.accentLimeText} hover:underline font-semibold text-lg transition-colors duration-200`}
          >
            Inicia sesión
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
