import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiX, FiAlertCircle, FiInfo } from "react-icons/fi";

const EmailNotification = ({ 
  message, 
  type = "success", 
  isVisible, 
  onClose, 
  autoClose = true,
  duration = 5000 
}) => {
  React.useEffect(() => {
    if (autoClose && isVisible && type !== "error") {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose, type]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FiCheck className="text-xl" />;
      case "error":
        return <FiX className="text-xl" />;
      case "warning":
        return <FiAlertCircle className="text-xl" />;
      case "info":
        return <FiInfo className="text-xl" />;
      default:
        return <FiInfo className="text-xl" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-900/20",
          border: "border-green-500",
          text: "text-green-400",
          icon: "text-green-400"
        };
      case "error":
        return {
          bg: "bg-red-900/20",
          border: "border-red-500",
          text: "text-red-400",
          icon: "text-red-400"
        };
      case "warning":
        return {
          bg: "bg-yellow-900/20",
          border: "border-yellow-500",
          text: "text-yellow-400",
          icon: "text-yellow-400"
        };
      case "info":
        return {
          bg: "bg-blue-900/20",
          border: "border-blue-500",
          text: "text-blue-400",
          icon: "text-blue-400"
        };
      default:
        return {
          bg: "bg-gray-900/20",
          border: "border-gray-500",
          text: "text-gray-400",
          icon: "text-gray-400"
        };
    }
  };

  const styles = getStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed top-4 right-4 z-50 max-w-md ${styles.bg} ${styles.border} border-2 rounded-lg p-4 shadow-2xl`}
        >
          <div className="flex items-start gap-3">
            <div className={`${styles.icon} mt-0.5`}>
              {getIcon()}
            </div>
            
            <div className="flex-1">
              <p className={`${styles.text} font-medium`}>
                {message}
              </p>
            </div>
            
            <button
              onClick={onClose}
              className={`${styles.text} hover:opacity-70 transition-opacity p-1`}
            >
              <FiX className="text-lg" />
            </button>
          </div>
          
          {/* Progress bar for auto-close */}
          {autoClose && type !== "error" && (
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              className={`h-1 ${styles.border.replace('border-', 'bg-')} mt-3 rounded-full`}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmailNotification; 