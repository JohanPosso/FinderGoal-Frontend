// Configuración de autenticación social
export const AUTH_CONFIG = {
  // Google OAuth
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || "738269751915-ppicnv6ti2qs14jk6e783p2jqase90bt.apps.googleusercontent.com",
  
  // URLs de redirección (opcional)
  REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
};

// Función para validar si las credenciales están configuradas
export const validateAuthConfig = () => {
  if (!AUTH_CONFIG.GOOGLE_CLIENT_ID) {
    console.error("❌ Google Client ID no configurado");
    return false;
  }
  
  return true;
}; 