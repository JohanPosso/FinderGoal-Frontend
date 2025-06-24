import React, { useState } from "react";
import { useStore } from "../store/useStore"; // Assuming this path is correct
import { useNavigate, Link } from "react-router-dom"; // Import Link for navigation
import { motion } from "framer-motion"; // For subtle animations
import { FaFutbol } from "react-icons/fa"; // For the logo icon
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
  inputBorder: "border-gray-700",
  inputFocusRing: "focus:ring-lime-500",
  errorText: "text-orange-400", // Texto de error en naranja
  shadowPrimary: "shadow-xl",
  shadowAccent: "shadow-lime-500/30",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, users } = useStore(); // Access users from the store to simulate auth
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      if (res.data && (res.data.token || res.data.access_token)) {
        const token = res.data.token || res.data.access_token;
        localStorage.setItem("token", token);
        // Guardar el token en el usuario para el store
        const userWithToken = {
          ...res.data.user,
          token,
        };
        login(userWithToken);
      } else if (res.data && res.data.user) {
        login(res.data.user);
      }
      navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al iniciar sesión. Intenta de nuevo.");
      }
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${colorsSporty.primaryBg} ${colorsSporty.primaryText}`}
    >
      <motion.form
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit}
        className={`${colorsSporty.secondaryBg} p-8 rounded-2xl ${colorsSporty.shadowPrimary} ${colorsSporty.shadowAccent} w-full max-w-md border ${colorsSporty.cardBorder}`}
      >
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <FaFutbol
            className={`text-6xl ${colorsSporty.accentLimeText} mb-4`}
          />
          <h2 className="text-4xl font-extrabold text-white text-center tracking-wide">
            Iniciar <span className={colorsSporty.accentLimeText}>Sesión</span>
          </h2>
          <p
            className={`${colorsSporty.secondaryText} mt-2 text-lg text-center`}
          >
            Accede a la cancha.
          </p>
        </div>

        {/* Email Input */}
        <motion.input
          whileFocus={{
            scale: 1.01,
            boxShadow: "0 0 0 4px rgba(139, 230, 0, 0.2)",
          }} // Custom focus ring with lime
          type="email"
          className={`w-full mb-5 px-5 py-3 rounded-lg bg-gray-700 ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200 placeholder-gray-400 font-medium text-lg`}
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Input */}
        <motion.input
          whileFocus={{
            scale: 1.01,
            boxShadow: "0 0 0 4px rgba(139, 230, 0, 0.2)",
          }} // Custom focus ring with lime
          type="password"
          className={`w-full mb-5 px-5 py-3 rounded-lg bg-gray-700 ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200 placeholder-gray-400 font-medium text-lg`}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

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
          className={`w-full ${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover} ${colorsSporty.primaryText} py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 text-lg shadow-lg`}
        >
          Ingresar
        </motion.button>

        {/* Registration Link */}
        <div className="mt-8 text-center">
          <span className={`${colorsSporty.secondaryText} text-lg`}>
            ¿No tienes cuenta?{" "}
          </span>
          <Link
            to="/register"
            className={`${colorsSporty.accentOrangeText} hover:underline font-semibold text-lg transition-colors duration-200`}
          >
            Regístrate
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
