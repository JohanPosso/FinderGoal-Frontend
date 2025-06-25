import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiClipboard, FiCheck, FiX, FiUsers, FiCalendar, FiClock, FiMapPin, FiDollarSign } from "react-icons/fi";
import { parseWhatsappList, isValidWhatsappList, cleanWhatsappText } from "../utils/whatsappParser";

// Colores del tema Sporty & Energetic (copiados de CreateMatch)
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

export default function WhatsappParser({ onDataExtracted, onClose }) {
  const [whatsappText, setWhatsappText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);

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

  const handleApplyData = () => {
    if (extractedData && onDataExtracted) {
      onDataExtracted(extractedData);
      onClose();
    }
  };

  const handleClear = () => {
    setWhatsappText("");
    setExtractedData(null);
    setError("");
    setIsValid(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4`}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`w-full max-w-4xl ${colorsSporty.secondaryBg} rounded-2xl ${colorsSporty.shadowPrimary} ${colorsSporty.shadowAccent} border ${colorsSporty.cardBorder} overflow-hidden`}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiClipboard className={`text-3xl ${colorsSporty.accentLimeText} mr-4`} />
              <div>
                <h2 className="text-2xl font-bold text-white">Procesar Listado de WhatsApp</h2>
                <p className={`${colorsSporty.secondaryText} mt-1`}>
                  Pega tu listado y la IA extraerá automáticamente la información del partido
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-white hover:bg-gray-700 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Input Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={`block text-lg font-semibold ${colorsSporty.primaryText}`}>
                Listado de WhatsApp
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handlePaste}
                  className={`px-3 py-1 rounded-lg ${colorsSporty.accentOrange} hover:${colorsSporty.accentOrangeHover} text-sm font-medium transition-colors`}
                >
                  <FiClipboard className="inline mr-1" />
                  Pegar
                </button>
                <button
                  onClick={handleClear}
                  className="px-3 py-1 rounded-lg bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium transition-colors"
                >
                  Limpiar
                </button>
              </div>
            </div>
            
            <textarea
              rows={8}
              className={`w-full px-4 py-3 rounded-lg ${colorsSporty.inputBg} ${colorsSporty.primaryText} ${colorsSporty.inputBorder} border-2 focus:outline-none ${colorsSporty.inputFocusRing} transition-all duration-200 placeholder-gray-400 font-medium`}
              placeholder="Pega aquí tu listado de WhatsApp...&#10;&#10;Ejemplo:&#10;Partido sábado 21 de junio&#10;Cancha 4, piso 2, de la 63 con 30&#10;Fútbol 7-7 (14 cupos)&#10;hora 3:00pm&#10;$16.000 por persona&#10;&#10;1. Orlando✅&#10;2. Gustavo✅&#10;3. Mateo✅&#10;..."
              value={whatsappText}
              onChange={handleTextChange}
            />
            
            {whatsappText && (
              <div className="mt-2 flex items-center">
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
          </div>

          {/* Process Button */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleProcess}
              disabled={!isValid || isProcessing}
              className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 ${
                isValid && !isProcessing
                  ? `${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover}`
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                'Procesar con IA'
              )}
            </motion.button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Extracted Data Preview */}
          {extractedData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 ${colorsSporty.inputBg} rounded-lg border ${colorsSporty.cardBorder}`}
            >
              <h3 className={`text-xl font-bold ${colorsSporty.primaryText} mb-4`}>
                Información Extraída
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <FiCalendar className={`${colorsSporty.accentLimeText} mr-3`} />
                  <div>
                    <p className={`${colorsSporty.secondaryText} text-sm`}>Fecha</p>
                    <p className={`${colorsSporty.primaryText} font-medium`}>
                      {extractedData.fecha || 'No especificada'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FiClock className={`${colorsSporty.accentLimeText} mr-3`} />
                  <div>
                    <p className={`${colorsSporty.secondaryText} text-sm`}>Hora</p>
                    <p className={`${colorsSporty.primaryText} font-medium`}>
                      {extractedData.hora || 'No especificada'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FiMapPin className={`${colorsSporty.accentLimeText} mr-3`} />
                  <div>
                    <p className={`${colorsSporty.secondaryText} text-sm`}>Ubicación</p>
                    <p className={`${colorsSporty.primaryText} font-medium`}>
                      {extractedData.ubicacion || 'No especificada'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FiDollarSign className={`${colorsSporty.accentLimeText} mr-3`} />
                  <div>
                    <p className={`${colorsSporty.secondaryText} text-sm`}>Precio</p>
                    <p className={`${colorsSporty.primaryText} font-medium`}>
                      ${extractedData.precio?.toLocaleString() || '0'} COP
                    </p>
                  </div>
                </div>
              </div>

              {/* Players List */}
              {extractedData.jugadores && extractedData.jugadores.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <FiUsers className={`${colorsSporty.accentLimeText} mr-2`} />
                    <p className={`${colorsSporty.primaryText} font-medium`}>
                      Jugadores ({extractedData.jugadores.length})
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {extractedData.jugadores.map((jugador, index) => (
                      <div
                        key={index}
                        className={`px-3 py-2 rounded-lg ${colorsSporty.cardBorder} border bg-gray-700/50`}
                      >
                        <span className={`${colorsSporty.primaryText} text-sm`}>{jugador}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply Button */}
              <div className="flex justify-end mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApplyData}
                  className={`px-6 py-3 rounded-lg font-bold ${colorsSporty.accentLime} hover:${colorsSporty.accentLimeHover} transition-all duration-300`}
                >
                  Aplicar Datos
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
} 