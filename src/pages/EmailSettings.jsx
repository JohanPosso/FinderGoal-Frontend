import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FiMail, 
  FiSend, 
  FiUsers, 
  FiSettings, 
  FiCheck, 
  FiX,
  FiEdit,
  FiEye,
  FiTrash2,
  FiPlus
} from "react-icons/fi";
import { FaFutbol } from "react-icons/fa";
import { sendCustomEmail, sendWelcomeEmail } from "../utils/emailService";
import api from "../utils/axios";

// Colores del tema Sporty & Energetic
const colorsSporty = {
  primaryBg: "bg-gray-900",
  secondaryBg: "bg-gray-800",
  primaryText: "text-white",
  secondaryText: "text-gray-400",
  accentLime: "bg-lime-500 text-gray-900",
  accentLimeText: "text-lime-400",
  accentLimeHover: "bg-lime-400",
  accentOrange: "bg-orange-500 text-white",
  accentOrangeText: "text-orange-400",
  accentOrangeHover: "bg-orange-600",
  inputBg: "bg-gray-700",
  inputBorder: "border-gray-700",
  inputFocusRing: "focus:ring-lime-500",
  shadowPrimary: "shadow-2xl",
  shadowAccent: "shadow-lime-500/40",
  cardBorder: "border-gray-700",
};

export default function EmailSettings() {
  const [activeTab, setActiveTab] = useState("welcome");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  
  // Estados para correo de bienvenida
  const [welcomeEmail, setWelcomeEmail] = useState({
    to: "",
    userName: ""
  });
  
  // Estados para correo personalizado
  const [customEmail, setCustomEmail] = useState({
    to: "",
    subject: "",
    html: ""
  });
  
  // Estados para correo masivo
  const [bulkEmail, setBulkEmail] = useState({
    subject: "",
    html: "",
    userList: []
  });

  const handleWelcomeEmailTest = async () => {
    if (!welcomeEmail.to || !welcomeEmail.userName) {
      setMessage("Por favor completa todos los campos");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const result = await sendWelcomeEmail(welcomeEmail.to, welcomeEmail.userName);
      
      if (result.success) {
        setMessage("Correo de bienvenida enviado exitosamente");
        setMessageType("success");
        setWelcomeEmail({ to: "", userName: "" });
      } else {
        setMessage(`Error al enviar correo: ${result.error}`);
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error inesperado al enviar el correo");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomEmailSend = async () => {
    if (!customEmail.to || !customEmail.subject || !customEmail.html) {
      setMessage("Por favor completa todos los campos");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const result = await sendCustomEmail(
        customEmail.to, 
        customEmail.subject, 
        customEmail.html
      );
      
      if (result.success) {
        setMessage("Correo personalizado enviado exitosamente");
        setMessageType("success");
        setCustomEmail({ to: "", subject: "", html: "" });
      } else {
        setMessage(`Error al enviar correo: ${result.error}`);
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error inesperado al enviar el correo");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkEmailSend = async () => {
    if (!bulkEmail.subject || !bulkEmail.html || bulkEmail.userList.length === 0) {
      setMessage("Por favor completa todos los campos y agrega al menos un destinatario");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const email of bulkEmail.userList) {
        const result = await sendCustomEmail(email, bulkEmail.subject, bulkEmail.html);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (errorCount === 0) {
        setMessage(`Todos los correos (${successCount}) fueron enviados exitosamente`);
        setMessageType("success");
        setBulkEmail({ subject: "", html: "", userList: [] });
      } else {
        setMessage(`${successCount} correos enviados, ${errorCount} fallaron`);
        setMessageType("warning");
      }
    } catch (error) {
      setMessage("Error inesperado al enviar los correos");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const addBulkEmail = () => {
    const email = prompt("Ingresa el email del destinatario:");
    if (email && email.includes("@")) {
      setBulkEmail(prev => ({
        ...prev,
        userList: [...prev.userList, email]
      }));
    }
  };

  const removeBulkEmail = (index) => {
    setBulkEmail(prev => ({
      ...prev,
      userList: prev.userList.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className={`${colorsSporty.primaryBg} min-h-screen py-10 px-6 ${colorsSporty.primaryText}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-center mb-6"
          >
            <div className={`p-4 rounded-full ${colorsSporty.accentLime} shadow-lg`}>
              <FiMail className="text-4xl text-gray-900" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4"
          >
            Configuración de{" "}
            <span className={colorsSporty.accentLimeText}>Correos</span>
          </motion.h1>
          
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-xl ${colorsSporty.secondaryText} max-w-3xl mx-auto`}
          >
            Gestiona el envío de correos electrónicos y notificaciones a los usuarios
          </motion.p>
        </div>

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg border ${
              messageType === "success" 
                ? "bg-green-900/20 border-green-500 text-green-400"
                : messageType === "error"
                ? "bg-red-900/20 border-red-500 text-red-400"
                : "bg-yellow-900/20 border-yellow-500 text-yellow-400"
            }`}
          >
            <div className="flex items-center">
              {messageType === "success" ? (
                <FiCheck className="mr-2" />
              ) : (
                <FiX className="mr-2" />
              )}
              {message}
            </div>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-4 mb-8 justify-center"
        >
          <button
            onClick={() => setActiveTab("welcome")}
            className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-300 flex items-center ${
              activeTab === "welcome"
                ? `${colorsSporty.accentLime} shadow-lg`
                : `${colorsSporty.secondaryBg} ${colorsSporty.secondaryText} hover:${colorsSporty.accentLimeHover.replace("bg-", "text-")}`
            }`}
          >
            <FiMail className="mr-2" />
            Correo de Bienvenida
          </button>
          
          <button
            onClick={() => setActiveTab("custom")}
            className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-300 flex items-center ${
              activeTab === "custom"
                ? `${colorsSporty.accentOrange} shadow-lg`
                : `${colorsSporty.secondaryBg} ${colorsSporty.secondaryText} hover:${colorsSporty.accentOrangeHover.replace("bg-", "text-")}`
            }`}
          >
            <FiSend className="mr-2" />
            Correo Personalizado
          </button>
          
          <button
            onClick={() => setActiveTab("bulk")}
            className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-300 flex items-center ${
              activeTab === "bulk"
                ? `${colorsSporty.accentLime} shadow-lg`
                : `${colorsSporty.secondaryBg} ${colorsSporty.secondaryText} hover:${colorsSporty.accentLimeHover.replace("bg-", "text-")}`
            }`}
          >
            <FiUsers className="mr-2" />
            Correo Masivo
          </button>
        </motion.div>

        {/* Content Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${colorsSporty.secondaryBg} rounded-2xl ${colorsSporty.shadowPrimary} p-8 border ${colorsSporty.cardBorder}`}
        >
          {/* Welcome Email Tab */}
          {activeTab === "welcome" && (
            <div className="space-y-6">
              <div className="flex items-center mb-6">
                <FiMail className={`text-2xl ${colorsSporty.accentLimeText} mr-3`} />
                <h2 className="text-2xl font-bold text-white">Correo de Bienvenida</h2>
              </div>
              
              <p className={`${colorsSporty.secondaryText} mb-6`}>
                Prueba el envío de correos de bienvenida que se envían automáticamente 
                a los usuarios que se registran con Google.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-lg font-semibold ${colorsSporty.primaryText} mb-2`}>
                    Email de prueba
                  </label>
                  <input
                    type="email"
                    className={`w-full px-4 py-3 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200`}
                    placeholder="ejemplo@email.com"
                    value={welcomeEmail.to}
                    onChange={(e) => setWelcomeEmail(prev => ({ ...prev, to: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className={`block text-lg font-semibold ${colorsSporty.primaryText} mb-2`}>
                    Nombre del usuario
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200`}
                    placeholder="Nombre del jugador"
                    value={welcomeEmail.userName}
                    onChange={(e) => setWelcomeEmail(prev => ({ ...prev, userName: e.target.value }))}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWelcomeEmailTest}
                disabled={isLoading}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center ${
                  !isLoading
                    ? `${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover}`
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </div>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    Enviar Correo de Prueba
                  </>
                )}
              </motion.button>
            </div>
          )}

          {/* Custom Email Tab */}
          {activeTab === "custom" && (
            <div className="space-y-6">
              <div className="flex items-center mb-6">
                <FiSend className={`text-2xl ${colorsSporty.accentOrangeText} mr-3`} />
                <h2 className="text-2xl font-bold text-white">Correo Personalizado</h2>
              </div>
              
              <p className={`${colorsSporty.secondaryText} mb-6`}>
                Envía correos personalizados a usuarios específicos con contenido HTML personalizado.
              </p>

              <div className="space-y-4">
                <div>
                  <label className={`block text-lg font-semibold ${colorsSporty.primaryText} mb-2`}>
                    Destinatario
                  </label>
                  <input
                    type="email"
                    className={`w-full px-4 py-3 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200`}
                    placeholder="destinatario@email.com"
                    value={customEmail.to}
                    onChange={(e) => setCustomEmail(prev => ({ ...prev, to: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className={`block text-lg font-semibold ${colorsSporty.primaryText} mb-2`}>
                    Asunto
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200`}
                    placeholder="Asunto del correo"
                    value={customEmail.subject}
                    onChange={(e) => setCustomEmail(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className={`block text-lg font-semibold ${colorsSporty.primaryText} mb-2`}>
                    Contenido HTML
                  </label>
                  <textarea
                    rows={8}
                    className={`w-full px-4 py-3 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200 font-mono text-sm`}
                    placeholder="<h1>Hola</h1><p>Este es el contenido del correo...</p>"
                    value={customEmail.html}
                    onChange={(e) => setCustomEmail(prev => ({ ...prev, html: e.target.value }))}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCustomEmailSend}
                disabled={isLoading}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center ${
                  !isLoading
                    ? `${colorsSporty.accentOrange} hover:${colorsSporty.accentOrangeHover}`
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </div>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    Enviar Correo
                  </>
                )}
              </motion.button>
            </div>
          )}

          {/* Bulk Email Tab */}
          {activeTab === "bulk" && (
            <div className="space-y-6">
              <div className="flex items-center mb-6">
                <FiUsers className={`text-2xl ${colorsSporty.accentLimeText} mr-3`} />
                <h2 className="text-2xl font-bold text-white">Correo Masivo</h2>
              </div>
              
              <p className={`${colorsSporty.secondaryText} mb-6`}>
                Envía el mismo correo a múltiples destinatarios de forma masiva.
              </p>

              <div className="space-y-4">
                <div>
                  <label className={`block text-lg font-semibold ${colorsSporty.primaryText} mb-2`}>
                    Asunto
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200`}
                    placeholder="Asunto del correo masivo"
                    value={bulkEmail.subject}
                    onChange={(e) => setBulkEmail(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className={`block text-lg font-semibold ${colorsSporty.primaryText} mb-2`}>
                    Contenido HTML
                  </label>
                  <textarea
                    rows={6}
                    className={`w-full px-4 py-3 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200 font-mono text-sm`}
                    placeholder="<h1>Hola a todos</h1><p>Este es el contenido del correo masivo...</p>"
                    value={bulkEmail.html}
                    onChange={(e) => setBulkEmail(prev => ({ ...prev, html: e.target.value }))}
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-lg font-semibold ${colorsSporty.primaryText}`}>
                      Destinatarios ({bulkEmail.userList.length})
                    </label>
                    <button
                      onClick={addBulkEmail}
                      className={`px-4 py-2 rounded-lg ${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover} text-sm font-medium transition-colors flex items-center`}
                    >
                      <FiPlus className="mr-1" />
                      Agregar Email
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {bulkEmail.userList.map((email, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <span className="text-white">{email}</span>
                        <button
                          onClick={() => removeBulkEmail(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                    
                    {bulkEmail.userList.length === 0 && (
                      <p className={`text-center py-4 ${colorsSporty.secondaryText}`}>
                        No hay destinatarios agregados
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBulkEmailSend}
                disabled={isLoading || bulkEmail.userList.length === 0}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center ${
                  !isLoading && bulkEmail.userList.length > 0
                    ? `${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover}`
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </div>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    Enviar a {bulkEmail.userList.length} Destinatarios
                  </>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 