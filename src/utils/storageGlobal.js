
export const STORAGE_KEYS = {
  usuarios: "usuarios",
  preguntas: "preguntas",
  simulacros: "simulacros",
  resultados: "resultados",
  notificaciones: "notificaciones",
  observacionesDocente: "observacionesDocente",
  permisosPorRol: "permisosPorRol",
  modulosPlataforma: "modulosPlataforma",
  solicitudesPlataforma: "solicitudesPlataforma",
  usuarioActual: "usuarioActual"
};

export const leerStorage = (clave, valorDefecto = []) => {
  try {
    const data = localStorage.getItem(clave);
    if (!data) return valorDefecto;
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error leyendo ${clave}:`, error);
    return valorDefecto;
  }
};

export const guardarStorage = (clave, data) => {
  try {
    localStorage.setItem(clave, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(`${clave}Actualizadas`));
    window.dispatchEvent(new CustomEvent("datosGlobalesActualizados"));
  } catch (error) {
    console.error(`Error guardando ${clave}:`, error);
  }
};

export const obtenerUsuarioActual = () => {
  return leerStorage(STORAGE_KEYS.usuarioActual, null);
};

export const obtenerBancoPreguntasGlobal = (usuarioActual) => {
  const preguntas = leerStorage(STORAGE_KEYS.preguntas, []);
  const rol = String(usuarioActual?.rol || "").toLowerCase();

  return preguntas.filter((pregunta) => {
    const estado = String(pregunta.estado || "activa").toLowerCase();

    // El administrador ve todo lo no eliminado
    if (rol === "administrador") {
      return estado !== "eliminada";
    }

    if (rol === "docente") {
      const noEliminada = estado !== "eliminada";
      const activa = estado === "activa" || estado === "activo" || estado === "publicada" || !pregunta.estado;
      
      const visibleParaDocente = 
        pregunta.visibilidad === "global" || 
        pregunta.visibilidad === "compartida" ||
        pregunta.visiblePara?.includes("docente") ||
        pregunta.usablePor?.includes("docente") ||
        pregunta.autorRol === "docente" ||
        pregunta.autorRol === "administrador" ||
        pregunta.creadoPor === usuarioActual?.id;

      return noEliminada && activa && visibleParaDocente;
    }

    return false;
  });
};

export const normalizarPreguntasGlobales = () => {
  const preguntasExistentes = leerStorage(STORAGE_KEYS.preguntas, []);

  const preguntasNormalizadas = preguntasExistentes.map((pregunta) => ({
    ...pregunta,
    id: pregunta.id || `PREG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    estado: pregunta.estado || "activa",
    visibilidad: "global",
    visiblePara: ["administrador", "docente"],
    seleccionable: true,
    editablePor: pregunta.editablePor || ["administrador", "autor"],
    usablePor: ["administrador", "docente"],
    autorRol: pregunta.autorRol || pregunta.origen || pregunta.rolAutor || "docente",
    autorNombre:
      pregunta.autorNombre ||
      pregunta.creadoPorNombre ||
      pregunta.docenteNombre ||
      pregunta.adminNombre ||
      "Desconocido"
  }));

  guardarStorage(STORAGE_KEYS.preguntas, preguntasNormalizadas);
  return preguntasNormalizadas;
};

export const limpiarDatosDePrueba = () => {
  const clavesParaLimpiar = [
    "usuarios",
    "preguntas",
    "simulacros",
    "resultados",
    "notificaciones",
    "observacionesDocente",
    "solicitudesPlataforma",
    "avancePlanMejora",
    "reportes",
    "historialIntentos",
    "asignaciones",
    "preguntasDocente",
    "preguntasAdmin",
    "bancoDocente",
    "bancoAdmin",
    "simulacrosDocente",
    "simulacrosAdmin",
    "resultadosDocente",
    "resultadosEstudiante",
    "datosPrueba",
    "solicitudesFunciones",
    "intentos",
    "migracionGlobalRealizada"
  ];

  clavesParaLimpiar.forEach((clave) => {
    localStorage.removeItem(clave);
  });

  const administradorPrincipal = {
    id: "admin_001",
    rol: "administrador",
    nombreCompleto: "Administrador del Sistema",
    correo: "admin@checkicfes.com",
    usuario: "admin",
    contrasena: "Admin123*",
    estado: "activo",
    esPrincipal: true,
    institucion: "CHECKICFES HQ",
    debeCambiarContrasena: false,
    fechaCreacion: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEYS.usuarios, JSON.stringify([administradorPrincipal]));
  localStorage.setItem(STORAGE_KEYS.usuarioActual, JSON.stringify(administradorPrincipal));
  localStorage.setItem("sesionActiva", "true");

  // Inicializar claves críticas
  localStorage.setItem(STORAGE_KEYS.preguntas, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.simulacros, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.resultados, JSON.stringify([]));
  localStorage.setItem("intentos", JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.observacionesDocente, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.solicitudesPlataforma, JSON.stringify([]));
  
  // Inicializar notificaciones con el mensaje de éxito
  const notificacionExito = {
    id: "notif_reset_success",
    destinatarioId: "admin_001",
    destinatarioRol: "administrador",
    titulo: "Limpieza Completada",
    mensaje: "Limpieza de plataforma completada. El sistema está listo para configurar usuarios reales.",
    tipo: "sistema",
    prioridad: "alta",
    leida: false,
    fechaCreacion: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.notificaciones, JSON.stringify([notificacionExito]));
  
  // Marcar la plataforma como inicializada para uso real
  localStorage.setItem("plataformaInicializadaParaUsoReal", "true");

  // Disparar eventos
  window.dispatchEvent(new CustomEvent("datosGlobalesActualizados"));
  window.dispatchEvent(new CustomEvent("usuariosActualizadas"));
  window.dispatchEvent(new CustomEvent("preguntasActualizadas"));
  window.dispatchEvent(new CustomEvent("notificacionesActualizadas"));
  window.dispatchEvent(new CustomEvent("simulacrosActualizadas"));
  window.dispatchEvent(new CustomEvent("resultadosActualizadas"));
  window.dispatchEvent(new CustomEvent("notificacionesActualizadas"));
  window.dispatchEvent(new CustomEvent("usuarioActualizado"));
};

export const guardarPreguntaGlobal = (pregunta) => {
  const preguntasActuales = leerStorage(STORAGE_KEYS.preguntas, []);
  const usuarioActual = leerStorage(STORAGE_KEYS.usuarioActual, null);

  const preguntaFinal = {
    ...pregunta,
    id: pregunta.id || `PREG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    estado: pregunta.estado || "activa",
    visibilidad: "global",
    visiblePara: ["administrador", "docente"],
    seleccionable: true,
    editablePor: pregunta.editablePor || ["administrador", "autor"],
    usablePor: ["administrador", "docente"],

    creadoPor: pregunta.creadoPor || usuarioActual?.id,
    autorNombre: pregunta.autorNombre || usuarioActual?.nombreCompleto || "Desconocido",
    autorRol: pregunta.autorRol || usuarioActual?.rol || "docente",
    origen: pregunta.origen || usuarioActual?.rol || "docente",

    fechaCreacion: pregunta.fechaCreacion || new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  };

  const indice = preguntasActuales.findIndex((p) => p.id === preguntaFinal.id);

  const preguntasActualizadas = indice !== -1
    ? preguntasActuales.map((p) => (p.id === preguntaFinal.id ? preguntaFinal : p))
    : [...preguntasActuales, preguntaFinal];

  guardarStorage(STORAGE_KEYS.preguntas, preguntasActualizadas);

  window.dispatchEvent(new CustomEvent("preguntasActualizadas"));
  window.dispatchEvent(new CustomEvent("datosGlobalesActualizados"));

  return preguntasActualizadas;
};

export const guardarSimulacroGlobal = (simulacro) => {
  const simulacrosActuales = leerStorage(STORAGE_KEYS.simulacros, []);
  const usuarioActual = leerStorage(STORAGE_KEYS.usuarioActual, null);

  const simulacroFinal = {
    ...simulacro,
    id: simulacro.id || `SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    nombre: simulacro.nombre || simulacro.titulo || "Simulacro sin nombre",
    titulo: simulacro.titulo || simulacro.nombre || "Simulacro sin nombre",
    descripcion: simulacro.descripcion,
    preguntasIds: simulacro.preguntasIds || [],
    numeroPreguntas: simulacro.preguntasIds?.length || 0,
    tiempoMinutos: simulacro.tiempoMinutos || 45,

    estado: simulacro.estado || "publicado",
    visible: true,
    visibilidad: "global",
    compartidoCon: ["administrador", "docente"],

    creadoPor: simulacro.creadoPor || usuarioActual?.id,
    autorNombre: simulacro.autorNombre || usuarioActual?.nombreCompleto || "Desconocido",
    autorRol: simulacro.autorRol || usuarioActual?.rol || "docente",
    origen: simulacro.origen || usuarioActual?.rol || "docente",

    editablePor: simulacro.editablePor || ["administrador", "autor", "docente"],
    asignablePor: simulacro.asignablePor || ["administrador", "docente"],

    fechaCreacion: simulacro.fechaCreacion || new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  };

  const indice = simulacrosActuales.findIndex((s) => s.id === simulacroFinal.id);

  const simulacrosActualizados = indice !== -1
    ? simulacrosActuales.map((s) => (s.id === simulacroFinal.id ? simulacroFinal : s))
    : [...simulacrosActuales, simulacroFinal];

  guardarStorage(STORAGE_KEYS.simulacros, simulacrosActualizados);

  window.dispatchEvent(new CustomEvent("simulacrosActualizados"));
  window.dispatchEvent(new CustomEvent("datosGlobalesActualizados"));

  return simulacrosActualizados;
};
export const migrarDatosAntiguosAGlobales = () => {
  if (localStorage.getItem("migracionGlobalRealizada") === "true") return;

  const clavesPreguntasAntiguas = [
    "preguntasDocente",
    "preguntasAdmin",
    "bancoDocente",
    "bancoAdministrador",
    "misPreguntas"
  ];

  let preguntasGlobales = leerStorage(STORAGE_KEYS.preguntas, []);

  clavesPreguntasAntiguas.forEach((clave) => {
    const datos = leerStorage(clave, []);
    if (Array.isArray(datos)) {
      preguntasGlobales = [...preguntasGlobales, ...datos];
    }
  });

  const preguntasSinDuplicados = preguntasGlobales.filter(
    (pregunta, index, self) =>
      pregunta.id &&
      index === self.findIndex((p) => p.id === pregunta.id)
  );

  const preguntasNormalizadas = preguntasSinDuplicados.map((pregunta) => ({
    ...pregunta,
    estado: pregunta.estado || "activa",
    visibilidad: "compartida",
    visiblePara: ["administrador", "docente"],
    seleccionable: true,
    autorRol: pregunta.autorRol || pregunta.origen || "docente"
  }));

  guardarStorage(STORAGE_KEYS.preguntas, preguntasNormalizadas);

  // Migración de simulacros si existen claves viejas
  const clavesSimulacrosAntiguas = ["simulacrosDocente", "simulacrosAdmin", "misSimulacros"];
  let simulacrosGlobales = leerStorage(STORAGE_KEYS.simulacros, []);
  clavesSimulacrosAntiguas.forEach(clave => {
    const datos = leerStorage(clave, []);
    if(Array.isArray(datos)) simulacrosGlobales = [...simulacrosGlobales, ...datos];
  });
  const simulacrosSinDuplicados = simulacrosGlobales.filter((s, index, self) => s.id && index === self.findIndex(p => p.id === s.id));
  guardarStorage(STORAGE_KEYS.simulacros, simulacrosSinDuplicados);

  localStorage.setItem("migracionGlobalRealizada", "true");
};
