// Configuración global de tours para Driver.js

export const landingTourSteps = [
  {
    element: "#navbar",
    popover: {
      title: "Navegación",
      description: "Aquí puedes navegar entre las diferentes secciones.",
      position: "bottom"
    }
  },
  {
    element: "#crear-partido-btn",
    popover: {
      title: "Crea un partido",
      description: "Haz clic aquí para crear un nuevo partido.",
      position: "right"
    }
  },
  {
    element: "#buscar-partidos-btn",
    popover: {
      title: "Buscar partidos",
      description: "Haz clic aquí para explorar y unirte a partidos activos.",
      position: "right"
    }
  },
  // Puedes agregar más pasos según los elementos de tu landing
];

export const matchesTourSteps = [
  {
    element: "#matches-list",
    popover: {
      title: "Lista de partidos",
      description: "Aquí puedes ver todos los partidos activos.",
      position: "top"
    }
  },
  // Puedes agregar más pasos para la vista de partidos
]; 