import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

const mockUsers = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan@mail.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "2",
    name: "Ana Gómez",
    email: "ana@mail.com",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "3",
    name: "Usuario Demo",
    email: "valen@gmail.com",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
];

const mockMatches = [
  {
    id: "m1",
    title: "Partido en Cancha Central",
    date: "2025-06-20T18:00:00",
    location: "Cancha Central",
    players: [mockUsers[0], mockUsers[2]],
    maxPlayers: 10,
    description: "Partido amistoso, nivel intermedio.",
    creator: mockUsers[2],
    fieldMap: Array(10)
      .fill(null)
      .map((_, i) => (i === 0 ? mockUsers[0] : i === 1 ? mockUsers[2] : null)),
  },
  {
    id: "m2",
    title: "Fútbol rápido nocturno",
    date: "2025-06-18T21:00:00",
    location: "Cancha 2",
    players: [mockUsers[2]],
    maxPlayers: 8,
    description: "¡Ven a jugar un partido rápido bajo las luces!",
    creator: mockUsers[2],
    fieldMap: Array(8)
      .fill(null)
      .map((_, i) => (i === 0 ? mockUsers[2] : null)),
  },
  {
    id: "m3",
    title: "Clásico de los viernes",
    date: "2025-06-13T19:00:00",
    location: "Estadio Municipal",
    players: [mockUsers[1], mockUsers[2]],
    maxPlayers: 14,
    description: "Partido clásico semanal, todos los niveles bienvenidos.",
    creator: mockUsers[1],
    fieldMap: Array(14)
      .fill(null)
      .map((_, i) => (i === 0 ? mockUsers[1] : i === 1 ? mockUsers[2] : null)),
  },
];

function getInitialFieldMap(maxPlayers) {
  // Para fútbol, siempre es vs (ej: 5 = 5 vs 5, 11 = 11 vs 11)
  // El total de jugadores en cancha es maxPlayers * 2
  const totalPlayers = maxPlayers * 2;
  // Presets para alineaciones típicas
  const presets = {
    5: [
      // 5 vs 5
      // Local (abajo)
      { top: "90%", left: "50%" }, // Portero
      { top: "75%", left: "30%" }, // Defensa
      { top: "75%", left: "70%" }, // Defensa
      { top: "60%", left: "40%" }, // Medio
      { top: "60%", left: "60%" }, // Medio
      // Visitante (arriba)
      { top: "10%", left: "50%" }, // Portero
      { top: "25%", left: "30%" }, // Defensa
      { top: "25%", left: "70%" }, // Defensa
      { top: "40%", left: "40%" }, // Medio
      { top: "40%", left: "60%" }, // Medio
    ],
    6: [
      // 6 vs 6
      // Local
      { top: "90%", left: "50%" },
      { top: "75%", left: "25%" },
      { top: "75%", left: "75%" },
      { top: "60%", left: "35%" },
      { top: "60%", left: "65%" },
      { top: "45%", left: "50%" },
      // Visitante
      { top: "10%", left: "50%" },
      { top: "25%", left: "25%" },
      { top: "25%", left: "75%" },
      { top: "40%", left: "35%" },
      { top: "40%", left: "65%" },
      { top: "55%", left: "50%" },
    ],
    7: [
      // 7 vs 7
      // Local
      { top: "90%", left: "50%" },
      { top: "80%", left: "20%" },
      { top: "80%", left: "80%" },
      { top: "70%", left: "35%" },
      { top: "70%", left: "65%" },
      { top: "60%", left: "50%" },
      { top: "50%", left: "50%" },
      // Visitante
      { top: "10%", left: "50%" },
      { top: "20%", left: "20%" },
      { top: "20%", left: "80%" },
      { top: "30%", left: "35%" },
      { top: "30%", left: "65%" },
      { top: "40%", left: "50%" },
      { top: "50%", left: "50%" },
    ],
    8: [
      // 8 vs 8
      // Local
      { top: "90%", left: "50%" },
      { top: "80%", left: "20%" },
      { top: "80%", left: "80%" },
      { top: "70%", left: "30%" },
      { top: "70%", left: "70%" },
      { top: "60%", left: "40%" },
      { top: "60%", left: "60%" },
      { top: "50%", left: "50%" },
      // Visitante
      { top: "10%", left: "50%" },
      { top: "20%", left: "20%" },
      { top: "20%", left: "80%" },
      { top: "30%", left: "30%" },
      { top: "30%", left: "70%" },
      { top: "40%", left: "40%" },
      { top: "40%", left: "60%" },
      { top: "50%", left: "50%" },
    ],
    9: [
      // 9 vs 9
      // Local
      { top: "90%", left: "50%" },
      { top: "80%", left: "15%" },
      { top: "80%", left: "85%" },
      { top: "70%", left: "30%" },
      { top: "70%", left: "70%" },
      { top: "60%", left: "20%" },
      { top: "60%", left: "80%" },
      { top: "50%", left: "40%" },
      { top: "50%", left: "60%" },
      // Visitante
      { top: "10%", left: "50%" },
      { top: "20%", left: "15%" },
      { top: "20%", left: "85%" },
      { top: "30%", left: "30%" },
      { top: "30%", left: "70%" },
      { top: "40%", left: "20%" },
      { top: "40%", left: "80%" },
      { top: "50%", left: "40%" },
      { top: "50%", left: "60%" },
    ],
    10: [
      // 10 vs 10
      // Local
      { top: "90%", left: "50%" },
      { top: "80%", left: "10%" },
      { top: "80%", left: "90%" },
      { top: "70%", left: "25%" },
      { top: "70%", left: "75%" },
      { top: "60%", left: "35%" },
      { top: "60%", left: "65%" },
      { top: "50%", left: "20%" },
      { top: "50%", left: "80%" },
      { top: "40%", left: "50%" },
      // Visitante
      { top: "10%", left: "50%" },
      { top: "20%", left: "10%" },
      { top: "20%", left: "90%" },
      { top: "30%", left: "25%" },
      { top: "30%", left: "75%" },
      { top: "40%", left: "35%" },
      { top: "40%", left: "65%" },
      { top: "50%", left: "20%" },
      { top: "50%", left: "80%" },
      { top: "60%", left: "50%" },
    ],
    11: [
      // 11 vs 11
      // Local
      { top: "92%", left: "50%" }, // Portero
      { top: "80%", left: "10%" },
      { top: "80%", left: "30%" },
      { top: "80%", left: "50%" },
      { top: "80%", left: "70%" },
      { top: "80%", left: "90%" },
      { top: "65%", left: "20%" },
      { top: "65%", left: "40%" },
      { top: "65%", left: "60%" },
      { top: "65%", left: "80%" },
      { top: "50%", left: "50%" },
      // Visitante
      { top: "8%", left: "50%" }, // Portero
      { top: "20%", left: "10%" },
      { top: "20%", left: "30%" },
      { top: "20%", left: "50%" },
      { top: "20%", left: "70%" },
      { top: "20%", left: "90%" },
      { top: "35%", left: "20%" },
      { top: "35%", left: "40%" },
      { top: "35%", left: "60%" },
      { top: "35%", left: "80%" },
      { top: "50%", left: "50%" },
    ],
  };
  if (presets[maxPlayers] && presets[maxPlayers].length === totalPlayers) {
    return presets[maxPlayers].map((p) => ({ ...p }));
  }
  // Si no hay preset, distribuir en círculo
  const arr = [];
  for (let i = 0; i < totalPlayers; i++) {
    const angle = (2 * Math.PI * i) / totalPlayers;
    arr.push({
      top: `${50 + 40 * Math.sin(angle)}%`,
      left: `${50 + 40 * Math.cos(angle)}%`,
    });
  }
  return arr;
}

// En el estado inicial del usuario, agregar isAdmin si está presente
const initialUser = JSON.parse(localStorage.getItem('user')) || null;

export const useStore = create((set, get) => ({
  user: initialUser,
  users: mockUsers,
  matches: mockMatches,
  login: (userOrEmail) => {
    let user = null;
    if (typeof userOrEmail === "string") {
      user = get().users.find((u) => u.email === userOrEmail);
    } else if (userOrEmail && userOrEmail.id) {
      // GUARDAR EL USUARIO COMPLETO DEL BACKEND
      user = { ...userOrEmail };
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      set({ user });
    }
  },
  logout: () => {
    localStorage.removeItem("user");
    set({ user: null });
  },
  register: (userOrName, email) => {
    let newUser = null;
    // Si se pasa un objeto de usuario completo (desde Google OAuth o backend)
    if (typeof userOrName === "object" && userOrName.id) {
      newUser = { ...userOrName };
    } 
    // Si se pasan parámetros individuales (registro tradicional)
    else if (typeof userOrName === "string" && email) {
      newUser = {
        id: uuidv4(),
        name: userOrName,
        email: email,
        avatar: `https://randomuser.me/api/portraits/men/${Math.floor(
          Math.random() * 99
        )}.jpg`,
      };
    }
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      set((state) => ({ users: [...state.users, newUser], user: newUser }));
    }
  },
  createMatch: (match) => {
    // Validar maxPlayers
    let maxPlayers = Number(match.maxPlayers);
    if (!maxPlayers || maxPlayers < 5) maxPlayers = 10;
    set((state) => ({
      matches: [
        ...state.matches,
        {
          ...match,
          id: uuidv4(),
          players: [],
          maxPlayers,
          fieldMap: getInitialFieldMap(maxPlayers),
        },
      ],
    }));
  },
  joinMatch: (matchId, position) => {
    set((state) => {
      const matches = state.matches.map((m) => {
        if (m.id === matchId && m.fieldMap[position] === null && state.user) {
          const newFieldMap = [...m.fieldMap];
          newFieldMap[position] = state.user;
          return {
            ...m,
            players: [...m.players, state.user],
            fieldMap: newFieldMap,
          };
        }
        return m;
      });
      return { matches };
    });
  },
  updateFieldMap: (matchId, newFieldMap) => {
    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, fieldMap: newFieldMap } : m
      ),
    }));
  },
  updateUser: (newUser) => {
    set({ user: newUser });
    localStorage.setItem("user", JSON.stringify(newUser));
  },
  deleteMatch: (matchId) => {
    set((state) => ({
      matches: state.matches.filter((m) => m.id !== matchId),
    }));
  },
}));

// Estado global para ubicación y caché de canchas por ciudad/país
export const useLocationStore = create((set, get) => ({
  city: null,
  country: null,
  setLocation: (city, country) => set({ city, country }),
  clearLocation: () => set({ city: null, country: null }),
  // --- Caché de canchas ---
  fieldsCache: {}, // { 'ciudad|pais': [canchas] }
  setFieldsCache: (city, country, fields) => {
    const key = `${city}|${country}`;
    set((state) => ({ fieldsCache: { ...state.fieldsCache, [key]: fields } }));
  },
  getFieldsCache: (city, country) => {
    const key = `${city}|${country}`;
    return get().fieldsCache[key] || null;
  },
  clearFieldsCache: (city, country) => {
    const key = `${city}|${country}`;
    set((state) => {
      const newCache = { ...state.fieldsCache };
      delete newCache[key];
      return { fieldsCache: newCache };
    });
  },
}));
