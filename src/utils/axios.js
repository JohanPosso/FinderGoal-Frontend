import axios from "axios";
const baseURL = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  timeout: 5000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo global de errores
    if (error.response && error.response.status === 401) {
      // Redirigir al login si el token es inválido, por ejemplo
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
