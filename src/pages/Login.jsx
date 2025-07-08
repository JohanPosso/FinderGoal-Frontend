import React, { useState } from "react";
import { useStore } from "../store/useStore"; // Assuming this path is correct
import { useNavigate, Link } from "react-router-dom"; // Import Link for navigation
import { motion } from "framer-motion"; // For subtle animations
import { FaFutbol } from "react-icons/fa"; // For the logo icon
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { AUTH_CONFIG } from "../config/auth";
import api from "../utils/axios";
import { sendWelcomeEmail } from "../utils/emailService";

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
  cardBorder: "border-gray-700",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useStore(); // Access users from the store to simulate auth
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      
      if (res.data && (res.data.access_token || res.data.token)) {
        const token = res.data.access_token || res.data.token;
        localStorage.setItem("token", token);
        const userWithToken = {
          ...res.data.user,
          token,
          isAdmin: res.data.user.isAdmin
        };
        login(userWithToken);
        navigate("/dashboard");
      } else if (res.data && res.data.user) {
        login(res.data.user);
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al iniciar sesión. Intenta de nuevo.");
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
        login({ ...response.data.user, isAdmin: response.data.user.isAdmin });
        
        // Enviar correo de bienvenida solo si es un usuario nuevo
        if (response.data.isNewUser && response.data.user && response.data.user.email) {
          const userName = response.data.user.nombre || response.data.user.name || "Jugador";
          const emailResult = await sendWelcomeEmail(response.data.user.email, userName);
          if (emailResult.success) {
            console.log("Correo de bienvenida enviado exitosamente");
          } else {
            console.warn("No se pudo enviar el correo de bienvenida:", emailResult.error);
          }
        }
        
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
    <GoogleOAuthProvider clientId={AUTH_CONFIG.GOOGLE_CLIENT_ID}>
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
            {/* Logo FinderGoal */}
            <img
              src={"/dark_logo.webp"}
              alt="FinderGoal Logo"
              className="w-24 h-24  mb-4 drop-shadow-lg rounded-full bg-white"
              draggable={false}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
              className={`w-full ${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover} ${colorsSporty.primaryText} py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? "Iniciando sesión..." : "Ingresar"}
            </motion.button>
          </form>

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
        </motion.div>
      </div>
    </GoogleOAuthProvider>
  );
}
