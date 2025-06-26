// Utilidades para la app, por ejemplo, validaciones, helpers de fecha, etc.
// Aquí puedes agregar funciones auxiliares si lo necesitas en el futuro.

/**
 * Obtiene la URL del avatar del usuario, usando una imagen por defecto si no tiene una
 * @param {string} avatar - URL del avatar del usuario
 * @param {string} fallback - URL de la imagen por defecto (opcional)
 * @returns {string} URL del avatar o imagen por defecto
 */
export const getAvatarUrl = (avatar, fallback = "/icono-default.png") => {
  if (!avatar || avatar.trim() === "") {
    return fallback;
  }
  
  // Si es una URL válida, la devolvemos
  if (avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("/")) {
    return avatar;
  }
  
  // Si no es una URL válida, devolvemos la imagen por defecto
  return fallback;
};

/**
 * Obtiene las iniciales del nombre para mostrar en avatares
 * @param {string} name - Nombre completo del usuario
 * @returns {string} Iniciales (máximo 2 caracteres)
 */
export const getInitials = (name) => {
  if (!name || typeof name !== "string") {
    return "U";
  }
  
  const words = name.trim().split(" ");
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Obtiene la fecha de registro del usuario de manera robusta
 * @param {Object} userData - Datos del usuario
 * @returns {string} Fecha de registro formateada
 */
export const getRegistrationDate = (userData) => {
  const fechaRegistro = userData?.fechaRegistro;
  
  if (!fechaRegistro) {
    return "Fecha no disponible";
  }

  try {
    const fecha = new Date(fechaRegistro);
    if (isNaN(fecha.getTime())) {
      return "Fecha no disponible";
    }

    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting registration date:', error);
    return "Fecha no disponible";
  }
};
