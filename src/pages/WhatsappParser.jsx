import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiClipboard, 
  FiCheck, 
  FiX, 
  FiUsers, 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiDollarSign,
  FiArrowRight,
  FiZap,
  FiInfo,
  FiCopy,
  FiPlus
} from "react-icons/fi";
import { FaFutbol, FaWhatsapp } from "react-icons/fa";
import { parseWhatsappList, isValidWhatsappList, cleanWhatsappText } from "../utils/whatsappParser";

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

export default function WhatsappParserPage() {
  const [whatsappText, setWhatsappText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleTextChange = (e) => {
    const text = e.target.value;
    setWhatsappText(text);
    setIsValid(isValidWhatsappList(text));
    setError("");
    setExtractedData(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setWhatsappText(text);
      setIsValid(isValidWhatsappList(text));
      setError("");
      setExtractedData(null);
    } catch (err) {
      setError("No se pudo acceder al portapapeles. Copia y pega manualmente.");
    }
  };

  const handleProcess = async () => {
    if (!isValid) {
      setError("El texto no parece ser un listado válido de WhatsApp.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const cleanedText = cleanWhatsappText(whatsappText);
      const data = await parseWhatsappList(cleanedText);
      setExtractedData(data);
    } catch (err) {
      setError(err.message || "Error procesando el listado.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateMatch = () => {
    if (extractedData) {
      // Guardar datos en localStorage para que CreateMatch los use
      localStorage.setItem('whatsappExtractedData', JSON.stringify(extractedData));
      navigate('/create-match');
    }
  };

  const handleClear = () => {
    setWhatsappText("");
    setExtractedData(null);
    setError("");
    setIsValid(false);
    setCopied(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <FaWhatsapp className="text-4xl text-gray-900" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4"
          >
            Procesador de{" "}
            <span className={colorsSporty.accentLimeText}>WhatsApp</span>
          </motion.h1>
          
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-xl ${colorsSporty.secondaryText} max-w-3xl mx-auto`}
          >
            Pega tu listado de WhatsApp y la IA extraerá automáticamente toda la información 
            para crear un partido en segundos
          </motion.p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`${colorsSporty.secondaryBg} rounded-2xl ${colorsSporty.shadowPrimary} p-8 border ${colorsSporty.cardBorder}`}
          >
            <div className="flex items-center mb-6">
              <FiClipboard className={`text-2xl ${colorsSporty.accentLimeText} mr-3`} />
              <h2 className="text-2xl font-bold text-white">Listado de WhatsApp</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className={`block text-lg font-semibold ${colorsSporty.primaryText}`}>
                  Pega tu listado aquí
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handlePaste}
                    className={`px-4 py-2 rounded-lg ${colorsSporty.accentOrange} hover:${colorsSporty.accentOrangeHover} text-sm font-medium transition-colors flex items-center`}
                  >
                    <FiClipboard className="mr-1" />
                    Pegar
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
              
              <textarea
                rows={12}
                className={`w-full px-4 py-3 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200 placeholder-gray-400 font-medium`}
                placeholder="Pega aquí tu listado de WhatsApp...&#10;&#10;Ejemplo:&#10;Partido sábado 21 de junio&#10;Cancha 4, piso 2, de la 63 con 30&#10;Fútbol 7-7 (14 cupos)&#10;hora 3:00pm&#10;$16.000 por persona&#10;&#10;1. Orlando✅&#10;2. Gustavo✅&#10;3. Mateo✅&#10;..."
                value={whatsappText}
                onChange={handleTextChange}
              />
              
              {whatsappText && (
                <div className="flex items-center">
                  {isValid ? (
                    <FiCheck className="text-green-400 mr-2" />
                  ) : (
                    <FiX className="text-red-400 mr-2" />
                  )}
                  <span className={`text-sm ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                    {isValid ? 'Formato válido detectado' : 'Formato no reconocido'}
                  </span>
                </div>
              )}

              {/* Process Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProcess}
                disabled={!isValid || isProcessing}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center ${
                  isValid && !isProcessing
                    ? `${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover}`
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Procesando con IA...
                  </div>
                ) : (
                  <>
                    <FiZap className="mr-2" />
                    Procesar con IA
                  </>
                )}
              </motion.button>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
                  <p className="text-red-400">{error}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`${colorsSporty.secondaryBg} rounded-2xl ${colorsSporty.shadowPrimary} p-8 border ${colorsSporty.cardBorder}`}
          >
            <div className="flex items-center mb-6">
              <FiCheck className={`text-2xl ${colorsSporty.accentLimeText} mr-3`} />
              <h2 className="text-2xl font-bold text-white">Información Extraída</h2>
            </div>

            {!extractedData ? (
              <div className="text-center py-12">
                <FaFutbol className="text-6xl mx-auto mb-4 opacity-30 text-lime-500" />
                <p className={`text-lg ${colorsSporty.secondaryText}`}>
                  Procesa un listado para ver la información extraída
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Date & Time */}
                <div className="flex items-center p-4 bg-gray-700 rounded-lg">
                  <FiCalendar className={`text-xl ${colorsSporty.accentLimeText} mr-3`} />
                  <div>
                    <p className="text-sm text-gray-400">Fecha</p>
                    <p className="text-white font-semibold">
                      {extractedData.fecha ? new Date(extractedData.fecha).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'No especificada'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-700 rounded-lg">
                  <FiClock className={`text-xl ${colorsSporty.accentLimeText} mr-3`} />
                  <div>
                    <p className="text-sm text-gray-400">Hora</p>
                    <p className="text-white font-semibold">
                      {extractedData.hora || 'No especificada'}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center p-4 bg-gray-700 rounded-lg">
                  <FiMapPin className={`text-xl ${colorsSporty.accentLimeText} mr-3`} />
                  <div>
                    <p className="text-sm text-gray-400">Ubicación</p>
                    <p className="text-white font-semibold">
                      {extractedData.ubicacion || 'No especificada'}
                    </p>
                  </div>
                </div>

                {/* Type & Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-400">Tipo</p>
                    <p className="text-white font-semibold">
                      {extractedData.tipoFutbol || 'No especificado'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <FiDollarSign className={`text-xl ${colorsSporty.accentLimeText} mb-1`} />
                    <p className="text-sm text-gray-400">Precio</p>
                    <p className="text-white font-semibold">
                      ${extractedData.precio?.toLocaleString() || '0'} COP
                    </p>
                  </div>
                </div>

                {/* Players */}
                <div className="p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <FiUsers className={`text-xl ${colorsSporty.accentLimeText} mr-2`} />
                      <p className="text-sm text-gray-400">Jugadores ({extractedData.jugadores?.length || 0})</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(extractedData.jugadores?.join(', ') || '')}
                      className="text-lime-400 hover:text-lime-300 transition-colors"
                    >
                      <FiCopy className="text-lg" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.jugadores?.map((player, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-lime-500/20 text-lime-400 rounded-full text-sm font-medium"
                      >
                        {player}
                      </span>
                    )) || (
                      <span className="text-gray-400">No se encontraron jugadores</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateMatch}
                    className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all duration-300 ${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover} flex items-center justify-center`}
                  >
                    <FiPlus className="mr-2" />
                    Crear Partido
                  </motion.button>
                  
                  <Link to="/create-match">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="py-3 px-6 rounded-lg font-bold transition-all duration-300 bg-gray-600 hover:bg-gray-500 text-white flex items-center"
                    >
                      <FiArrowRight className="mr-2" />
                      Ir a Crear
                    </motion.button>
                  </Link>
                </div>

                {copied && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-green-400 text-sm"
                  >
                    ¡Lista de jugadores copiada al portapapeles!
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`mt-12 ${colorsSporty.secondaryBg} rounded-2xl ${colorsSporty.shadowPrimary} p-8 border ${colorsSporty.cardBorder}`}
        >
          <div className="flex items-center mb-6">
            <FiInfo className={`text-2xl ${colorsSporty.accentOrangeText} mr-3`} />
            <h3 className="text-xl font-bold text-white">¿Cómo funciona?</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full ${colorsSporty.accentLime} flex items-center justify-center mx-auto mb-4`}>
                <span className="text-gray-900 font-bold text-xl">1</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Pega tu listado</h4>
              <p className={`text-sm ${colorsSporty.secondaryText}`}>
                Copia y pega cualquier listado de WhatsApp de un partido de fútbol
              </p>
            </div>
            
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full ${colorsSporty.accentLime} flex items-center justify-center mx-auto mb-4`}>
                <span className="text-gray-900 font-bold text-xl">2</span>
              </div>
              <h4 className="font-semibold text-white mb-2">IA procesa</h4>
              <p className={`text-sm ${colorsSporty.secondaryText}`}>
                Nuestra IA extrae automáticamente fecha, hora, ubicación, precio y jugadores
              </p>
            </div>
            
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full ${colorsSporty.accentLime} flex items-center justify-center mx-auto mb-4`}>
                <span className="text-gray-900 font-bold text-xl">3</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Crea el partido</h4>
              <p className={`text-sm ${colorsSporty.secondaryText}`}>
                Los datos se aplican automáticamente al formulario de creación de partidos
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 