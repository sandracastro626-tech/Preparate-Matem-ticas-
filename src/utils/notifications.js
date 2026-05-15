/**
 * Utilidades para el sistema de notificaciones de CHECK-ICFES
 */

export const obtenerNotificacionesTotales = () => {
  try {
    return JSON.parse(localStorage.getItem("notificaciones")) || [];
  } catch (e) {
    return [];
  }
};

export const obtenerNotificacionesUsuario = (user) => {
  if (!user) return [];
  const notifications = obtenerNotificacionesTotales();
  
  return notifications
    .filter((n) => {
      return (
        n.destinatarioId === user.id ||
        n.destinatarioRol === user.rol ||
        n.destinatarioId === "todos"
      );
    })
    .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
};

export const crearNotificacion = ({
  destinatarioId = "todos",
  destinatarioRol = null,
  titulo,
  mensaje,
  tipo = "sistema",
  prioridad = "media",
  enlace = null,
  metadata = {}
}) => {
  const notificaciones = obtenerNotificacionesTotales();

  // Evitar duplicados si existe claveUnica en metadata
  if (metadata.claveUnica) {
    const existe = notificaciones.some(n => n.metadata?.claveUnica === metadata.claveUnica);
    if (existe) return null;
  }

  const nuevaNotificacion = {
    id: crypto.randomUUID ? crypto.randomUUID() : `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    destinatarioId,
    destinatarioRol,
    titulo,
    mensaje,
    tipo,
    prioridad,
    leida: false,
    fechaCreacion: new Date().toISOString(),
    enlace,
    metadata
  };

  const actualizadas = [nuevaNotificacion, ...notificaciones];
  localStorage.setItem("notificaciones", JSON.stringify(actualizadas));

  // Disparar evento para actualización en tiempo real en la UI
  window.dispatchEvent(new Event("notificacionesActualizadas"));

  return nuevaNotificacion;
};

export const marcarComoLeida = (notificacionId) => {
  const notificaciones = obtenerNotificacionesTotales();
  const actualizadas = notificaciones.map(n => 
    n.id === notificacionId ? { ...n, leida: true } : n
  );
  localStorage.setItem("notificaciones", JSON.stringify(actualizadas));
  window.dispatchEvent(new Event("notificacionesActualizadas"));
};

export const marcarTodasComoLeidas = (user) => {
  if (!user) return;
  const notificaciones = obtenerNotificacionesTotales();
  const actualizadas = notificaciones.map(n => {
    const esParaUsuario = n.destinatarioId === user.id || n.destinatarioRol === user.rol || n.destinatarioId === "todos";
    return esParaUsuario ? { ...n, leida: true } : n;
  });
  localStorage.setItem("notificaciones", JSON.stringify(actualizadas));
  window.dispatchEvent(new Event("notificacionesActualizadas"));
};

export const eliminarNotificacion = (notificacionId) => {
  const notificaciones = obtenerNotificacionesTotales();
  const actualizadas = notificaciones.filter(n => n.id !== notificacionId);
  localStorage.setItem("notificaciones", JSON.stringify(actualizadas));
  window.dispatchEvent(new Event("notificacionesActualizadas"));
};

export const formatearFechaRelativa = (fechaIso) => {
  const fecha = new Date(fechaIso);
  const ahora = new Date();
  const diffMs = ahora - fecha;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "ahora mismo";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHr < 24) return `hace ${diffHr} h`;
  if (diffDays === 1) return "ayer";
  return fecha.toLocaleDateString();
};

export const cargarNotificacionesIniciales = () => {
  const existentes = obtenerNotificacionesTotales();
  if (existentes.length > 0) return;

  const notificacionesIniciales = [
    {
      id: "notif_admin_001",
      destinatarioRol: "administrador",
      titulo: "Nueva solicitud del docente",
      mensaje: "Sandra Castro solicitó una mejora en el módulo de resultados.",
      tipo: "solicitud_docente",
      prioridad: "alta",
      leida: false,
      fechaCreacion: new Date().toISOString(),
      enlace: "proyectos"
    },
    {
      id: "notif_docente_001",
      destinatarioRol: "docente",
      titulo: "Actividad pendiente",
      mensaje: "Fernando Potosí tiene un simulacro próximo a vencer.",
      tipo: "actividad_por_vencer",
      prioridad: "urgente",
      leida: false,
      fechaCreacion: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
      enlace: "simulacros"
    },
    {
      id: "notif_estudiante_001",
      destinatarioRol: "estudiante",
      titulo: "Nuevo simulacro asignado",
      mensaje: "Tienes disponible el Simulacro Diagnóstico - Matemáticas.",
      tipo: "simulacro_asignado",
      prioridad: "media",
      leida: false,
      fechaCreacion: new Date(Date.now() - 7200000).toISOString(), // 2 horas atrás
      enlace: "misSimulacros"
    }
  ];

  localStorage.setItem("notificaciones", JSON.stringify(notificacionesIniciales));
};

export const verificarVencimientos = (user, simulacros) => {
  if (!user || user.rol !== 'estudiante' || !simulacros) return;

  const hoy = new Date();
  const unDiaEnMs = 24 * 60 * 60 * 1000;

  simulacros.forEach(simulacro => {
    if (!simulacro.fechaCierre) return;

    const fechaCierre = new Date(simulacro.fechaCierre);
    const diff = fechaCierre - hoy;

    // Si falta un día o menos y aún no ha vencido
    if (diff > 0 && diff <= unDiaEnMs) {
      crearNotificacion({
        destinatarioId: user.id,
        destinatarioRol: "estudiante",
        titulo: "Actividad por vencer",
        mensaje: `El simulacro ${simulacro.nombre} vence pronto. ¡No olvides presentarlo!`,
        tipo: "actividad_por_vencer",
        prioridad: "urgente",
        enlace: "misSimulacros",
        metadata: {
          simulacroId: simulacro.id,
          estudianteId: user.id,
          claveUnica: `vencimiento_${simulacro.id}_${user.id}_${simulacro.fechaCierre}`
        }
      });
    }
  });
};
