import React, { createContext, useContext, useState, useEffect } from 'react';
import { USUARIOS_INICIALES, PREGUNTAS_INICIALES, SIMULACROS_INICIALES } from '../data/mockData';
import { 
  STORAGE_KEYS, 
  leerStorage, 
  guardarStorage, 
  migrarDatosAntiguosAGlobales,
  normalizarPreguntasGlobales,
  guardarPreguntaGlobal,
  guardarSimulacroGlobal
} from '../utils/storageGlobal';
import { crearNotificacion } from '../utils/notifications';

const AppContext = createContext();

const normalizarTexto = (texto) => {
  return String(texto || "").trim().toLowerCase();
};

const normalizarRol = (rol) => {
  const valor = normalizarTexto(rol);
  if (valor === "admin" || valor === "administrador") return "administrador";
  if (valor === "docente" || valor === "teacher" || valor === "profesor") return "docente";
  if (valor === "estudiante" || valor === "student" || valor === "alumno") return "estudiante";
  return valor;
};

const normalizarEstado = (estado) => {
  const valor = normalizarTexto(estado);
  if (valor === "activo" || valor === "active" || valor === "habilitado") return "activo";
  if (valor === "inactivo" || valor === "inactive" || valor === "deshabilitado") return "inactivo";
  return valor || "activo";
};

const normalizarUsuario = (u) => {
  if (!u) return null;
  return {
    ...u,
    id: u.id || u.uid || `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    rol: normalizarRol(u.rol || ""),
    nombreCompleto: u.nombreCompleto || u.nombre || u.name || "Usuario sin nombre",
    email: u.email || u.correo || "",
    usuario: u.usuario || u.username || "",
    codigoEstudiante: u.codigoEstudiante || u.codigo || "",
    numeroDocumento: u.numeroDocumento || u.documento || "",
    contrasena: u.contrasena || u.password || u.clave || u.contrasenaTemporal || "",
    estado: normalizarEstado(u.estado || "activo"),
    debeCambiarContrasena: u.debeCambiarContrasena || false
  };
};

const normalizarEstadoSimulacro = (estado) => {
  const valor = String(estado || "").trim().toLowerCase();
  if (
    valor === "activo" ||
    valor === "publicado" ||
    valor === "habilitado" ||
    valor === "disponible"
  ) {
    return "publicado";
  }
  if (valor === "borrador") return "borrador";
  if (valor === "inactivo") return "inactivo";
  return "publicado";
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.usuarioActual);
    const sesionActiva = localStorage.getItem('sesionActiva');
    return (sesionActiva === 'true' && saved) ? normalizarUsuario(JSON.parse(saved)) : null;
  });
  const [usuarios, setUsuarios] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.usuarios);
    const inicializada = localStorage.getItem('plataformaInicializadaParaUsoReal');
    if (!saved && inicializada === 'true') return [];
    const initial = saved ? JSON.parse(saved) : USUARIOS_INICIALES;
    return initial.map(normalizarUsuario);
  });
  const [preguntas, setPreguntas] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.preguntas);
    const inicializada = localStorage.getItem('plataformaInicializadaParaUsoReal');
    if (!saved && inicializada === 'true') return [];
    return saved ? JSON.parse(saved) : PREGUNTAS_INICIALES;
  });
  const [simulacros, setSimulacros] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.simulacros);
    const inicializada = localStorage.getItem('plataformaInicializadaParaUsoReal');
    if (!saved && inicializada === 'true') return [];
    return saved ? JSON.parse(saved) : SIMULACROS_INICIALES;
  });

  // Migración inicial
  useEffect(() => {
    const inicializada = localStorage.getItem('plataformaInicializadaParaUsoReal');
    if (inicializada !== 'true') {
      migrarDatosAntiguosAGlobales();
      const result = normalizarPreguntasGlobales();
      if (result && result.length > 0) {
        setPreguntas(result);
      }
    }
  }, []);

  // Sync state between tabs
  useEffect(() => {
    const syncStates = (e) => {
      if (e.key === STORAGE_KEYS.usuarios) setUsuarios(JSON.parse(e.newValue || '[]').map(normalizarUsuario));
      if (e.key === STORAGE_KEYS.preguntas) setPreguntas(JSON.parse(e.newValue || '[]'));
      if (e.key === STORAGE_KEYS.simulacros) setSimulacros(JSON.parse(e.newValue || '[]'));
      if (e.key === STORAGE_KEYS.usuarioActual) setUser(normalizarUsuario(JSON.parse(e.newValue || 'null')));
    };

    const handleCustomEvents = (e) => {
      setUsuarios(leerStorage(STORAGE_KEYS.usuarios, []).map(normalizarUsuario));
      setPreguntas(leerStorage(STORAGE_KEYS.preguntas, []));
      setSimulacros(leerStorage(STORAGE_KEYS.simulacros, []));
      
      const savedUser = localStorage.getItem(STORAGE_KEYS.usuarioActual);
      if (savedUser) setUser(normalizarUsuario(JSON.parse(savedUser)));
    };

    window.addEventListener('storage', syncStates);
    window.addEventListener('usuariosActualizadas', handleCustomEvents);
    window.addEventListener('preguntasActualizadas', handleCustomEvents);
    window.addEventListener('simulacrosActualizadas', handleCustomEvents);
    window.addEventListener('datosGlobalesActualizados', handleCustomEvents);
    
    return () => {
      window.removeEventListener('storage', syncStates);
      window.removeEventListener('usuariosActualizadas', handleCustomEvents);
      window.removeEventListener('preguntasActualizadas', handleCustomEvents);
      window.removeEventListener('simulacrosActualizadas', handleCustomEvents);
      window.removeEventListener('datosGlobalesActualizados', handleCustomEvents);
    };
  }, []);

  const dispatchUpdate = (key) => {
    window.dispatchEvent(new Event(`${key}Actualizados`));
  };
  const [intentos, setIntentos] = useState(() => {
    const saved = localStorage.getItem('intentos');
    return saved ? JSON.parse(saved) : [];
  });

  const [permisos, setPermisos] = useState(() => {
    const saved = localStorage.getItem('permisosPorRol');
    return saved ? JSON.parse(saved) : {
      administrador: {
        gestionUsuarios: true, bancoPreguntas: true, crearPreguntas: false, editarPreguntas: true, 
        eliminarPreguntas: true, crearSimulacros: false, asignarSimulacros: true, 
        verResultadosGlobales: true, verResultadosGrupales: true, verResultadosIndividuales: true, 
        gestionarRoles: true, gestionarModulos: true, solicitarNuevasFunciones: true,
        limpiarDatosPrueba: true
      },
      docente: {
        gestionUsuarios: false, bancoPreguntas: true, crearPreguntas: true, editarPreguntas: true, 
        eliminarPreguntas: true, crearSimulacros: true, asignarSimulacros: true, 
        verResultadosGlobales: false, verResultadosGrupales: true, verResultadosIndividuales: true, 
        gestionarRoles: false, gestionarModulos: false, solicitarNuevasFunciones: true
      },
      estudiante: {
        gestionUsuarios: false, bancoPreguntas: false, crearPreguntas: false, editarPreguntas: false, 
        eliminarPreguntas: false, crearSimulacros: false, asignarSimulacros: false, 
        verResultadosGlobales: false, verResultadosGrupales: false, verResultadosIndividuales: true, 
        presentarSimulacros: true, verRetroalimentacion: true, verReporteIndividual: true, 
        solicitarNuevasFunciones: false
      }
    };
  });

  const [modulos, setModulos] = useState(() => {
    const saved = localStorage.getItem('modulosPlataforma');
    return saved ? JSON.parse(saved) : [
      { id: 'm1', nombre: 'Usuarios', descripcion: 'Gestión de estudiantes y docentes', rolAutorizado: 'administrador', estado: 'activo' },
      { id: 'm2', nombre: 'Banco de Preguntas', descripcion: 'Consultar y filtrar preguntas', rolAutorizado: 'docente', estado: 'activo' },
      { id: 'm3', nombre: 'Crear Pregunta', descripcion: 'Agregar nuevas preguntas al banco', rolAutorizado: 'docente', estado: 'activo' },
      { id: 'm4', nombre: 'Crear Simulacro', descripcion: 'Generar exámenes personalizados', rolAutorizado: 'docente', estado: 'activo' },
      { id: 'm5', nombre: 'Resultados Grupales', descripcion: 'Análisis de desempeño por grupo', rolAutorizado: 'docente', estado: 'activo' },
      { id: 'm6', nombre: 'Mis Simulacros', descripcion: 'Exámenes disponibles para presentar', rolAutorizado: 'estudiante', estado: 'activo' },
      { id: 'm7', nombre: 'Reporte Individual', descripcion: 'Resultados detallados por intento', rolAutorizado: 'estudiante', estado: 'activo' },
      { id: 'm8', nombre: 'Recomendaciones', descripcion: 'Tips de estudio personalizados', rolAutorizado: 'estudiante', estado: 'activo' },
    ];
  });

  const [solicitudes, setSolicitudes] = useState(() => {
    const saved = localStorage.getItem('solicitudesFunciones');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('intentos', JSON.stringify(intentos));
    localStorage.setItem('resultados', JSON.stringify(intentos)); 
  }, [intentos]);

  useEffect(() => {
    localStorage.setItem('permisosPorRol', JSON.stringify(permisos));
  }, [permisos]);

  useEffect(() => {
    localStorage.setItem('modulosPlataforma', JSON.stringify(modulos));
  }, [modulos]);

  useEffect(() => {
    localStorage.setItem('solicitudesFunciones', JSON.stringify(solicitudes));
  }, [solicitudes]);

  const login = (usuarioOCorreo, contrasenaIngresada) => {
    const identificador = normalizarTexto(usuarioOCorreo);
    const claveIngresada = String(contrasenaIngresada || "").trim();

    console.log("=== DEPURACIÓN LOGIN DOCENTE ===");
    console.log("Identificador ingresado:", identificador);
    console.log("Contraseña ingresada (longitud):", claveIngresada.length);
    
    if (!identificador || !claveIngresada) {
      return { success: false, message: "Ingrese usuario, correo, código o documento y contraseña." };
    }

    const usuariosNormalizados = usuarios.map(normalizarUsuario);
    console.log("Total usuarios registrados:", usuariosNormalizados.length);

    const usuarioEncontrado = usuariosNormalizados.find((u) => {
      return (
        normalizarTexto(u.email) === identificador ||
        normalizarTexto(u.usuario) === identificador ||
        normalizarTexto(u.codigoEstudiante) === identificador ||
        normalizarTexto(u.numeroDocumento) === identificador
      );
    });

    console.log("Usuario encontrado:", usuarioEncontrado);

    if (!usuarioEncontrado) {
      return { success: false, message: "Usuario o contraseña incorrecta." };
    }

    if (usuarioEncontrado.estado !== "activo") {
      return { success: false, message: "La cuenta se encuentra inactiva. Comuníquese con el administrador." };
    }

    const contrasenaSistema = String(usuarioEncontrado.contrasena).trim();
    if (contrasenaSistema !== claveIngresada) {
      return { success: false, message: "Usuario o contraseña incorrecta." };
    }

    const rol = usuarioEncontrado.rol;
    
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioEncontrado));
    localStorage.setItem('sesionActiva', 'true');
    setUser(usuarioEncontrado);
    
    return { success: true, user: usuarioEncontrado };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('usuarioActual');
    localStorage.removeItem('sesionActiva');
  };

  const registerUser = (newUser) => {
    const rawUser = {
      ...newUser,
      contrasena: newUser.contrasena || newUser.password || 'Temp123*'
    };
    const userToSave = normalizarUsuario(rawUser);
    
    // Ensure ID is specific if not provided
    if (!newUser.id) {
      const prefix = userToSave.rol === 'docente' ? 'docente' : userToSave.rol === 'estudiante' ? 'estudiante' : 'admin';
      userToSave.id = `${prefix}_${Date.now()}`;
    }
    
    userToSave.fechaCreacion = new Date().toISOString();
    userToSave.debeCambiarContrasena = true;
    userToSave.estado = userToSave.estado || "activo";

    // Metadata específica para docentes iniciales
    if (userToSave.rol === 'docente') {
      userToSave.gruposAsignados = userToSave.gruposAsignados || [];
      userToSave.institucionesAsignadas = userToSave.institucionesAsignadas || [];
      userToSave.permisos = {
        verBancoPreguntas: true,
        crearPreguntas: true,
        usarPreguntasBanco: true,
        crearSimulacros: true,
        editarSimulacros: true,
        usarSimulacrosCompartidos: true,
        verResultados: true,
        ...userToSave.permisos
      };
    }
    
    // Validations
    if (usuarios.some(u => u.email && normalizarTexto(u.email) === normalizarTexto(userToSave.email))) {
      return { success: false, message: "El correo electrónico ya está registrado." };
    }
    if (usuarios.some(u => u.numeroDocumento && u.numeroDocumento === userToSave.numeroDocumento)) {
      return { success: false, message: "El número de documento ya está registrado." };
    }
    if (userToSave.codigoEstudiante && usuarios.some(u => u.codigoEstudiante === userToSave.codigoEstudiante)) {
      return { success: false, message: "El código de estudiante ya está registrado." };
    }

    setUsuarios(prev => {
      const updated = [...prev, userToSave];
      guardarStorage(STORAGE_KEYS.usuarios, updated);
      window.dispatchEvent(new CustomEvent('usuariosActualizadas'));
      return updated;
    });
    return { success: true };
  };

  const updateUsuario = (userId, updatedData) => {
    if (updatedData.rol) updatedData.rol = normalizarRol(updatedData.rol);
    
    setUsuarios(prev => {
      const updated = prev.map(u => u.id === userId ? { ...u, ...updatedData } : u);
      guardarStorage(STORAGE_KEYS.usuarios, updated);
      window.dispatchEvent(new CustomEvent('usuariosActualizadas'));
      return updated;
    });
    
    if (user && user.id === userId) {
      const newUserState = { ...user, ...updatedData };
      setUser(newUserState);
      localStorage.setItem(STORAGE_KEYS.usuarioActual, JSON.stringify(newUserState));
      window.dispatchEvent(new CustomEvent('usuarioActualizado'));
    }
    return { success: true };
  };

  const deleteUsuario = (userId) => {
    if (userId === 'admin_001') return { success: false, message: "No se puede eliminar el administrador principal." };
    setUsuarios(prev => {
      const updated = prev.filter(u => u.id !== userId);
      guardarStorage(STORAGE_KEYS.usuarios, updated);
      window.dispatchEvent(new CustomEvent('usuariosActualizadas'));
      return updated;
    });
    return { success: true };
  };

  const toggleUserStatus = (userId) => {
    setUsuarios(prev => {
      const updated = prev.map(u => u.id === userId ? { ...u, estado: u.estado === 'activo' ? 'inactivo' : 'activo' } : u);
      guardarStorage(STORAGE_KEYS.usuarios, updated);
      window.dispatchEvent(new CustomEvent('usuariosActualizadas'));
      return updated;
    });
    return { success: true };
  };

  const resetPassword = (userId, newPassword) => {
    setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, contrasena: newPassword, debeCambiarContrasena: true } : u));
    return { success: true };
  };

  const changePassword = (userId, newPassword) => {
    setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, contrasena: newPassword, debeCambiarContrasena: false } : u));
    if (user && user.id === userId) {
      const newUserState = { ...user, contrasena: newPassword, debeCambiarContrasena: false };
      setUser(newUserState);
      localStorage.setItem('usuarioActual', JSON.stringify(newUserState));
    }
    return { success: true };
  };

  const bulkImportUsers = (usersList) => {
    const results = {
      imported: 0,
      errors: [],
      rejectedCount: 0
    };

    const newUsersToProcess = usersList.map((csvUser, index) => {
      const rol = normalizarRol(csvUser.rol);

      const userToSave = {
        ...csvUser,
        rol,
        id: rol === 'docente' ? `docente_bulk_${Date.now()}_${index}` : rol === 'estudiante' ? `user_bulk_${Date.now()}_${index}` : `admin_bulk_${Date.now()}_${index}`,
        fechaCreacion: new Date().toISOString(),
        debeCambiarContrasena: true,
        estado: csvUser.estado || 'activo',
        contrasena: csvUser.contrasenaTemporal || csvUser.contrasena || csvUser.password || 'Temp123*'
      };

      if (userToSave.rol === 'docente') {
        userToSave.gruposAsignados = userToSave.gruposAsignados || [];
        userToSave.institucionesAsignadas = userToSave.institucionesAsignadas || [];
        userToSave.permisos = {
          verBancoPreguntas: true,
          crearPreguntas: true,
          usarPreguntasBanco: true,
          crearSimulacros: true,
          editarSimulacros: true,
          usarSimulacrosCompartidos: true,
          verResultados: true,
          ...userToSave.permisos
        };
      }

      // Validations
      if (!['administrador', 'docente', 'estudiante'].includes(userToSave.rol)) {
        results.errors.push(`Fila ${index + 1}: Rol inválido.`);
        results.rejectedCount++;
        return null;
      }
      if (!userToSave.nombreCompleto) {
        results.errors.push(`Fila ${index + 1}: Nombre completo es obligatorio.`);
        results.rejectedCount++;
        return null;
      }
      if (userToSave.email && usuarios.some(u => normalizarTexto(u.email) === normalizarTexto(userToSave.email))) {
        results.errors.push(`Fila ${index + 1}: Correo duplicado.`);
        results.rejectedCount++;
        return null;
      }
      if (userToSave.numeroDocumento && usuarios.some(u => u.numeroDocumento === userToSave.numeroDocumento)) {
        results.errors.push(`Fila ${index + 1}: Documento duplicado.`);
        results.rejectedCount++;
        return null;
      }
      if (userToSave.rol === 'estudiante' && !userToSave.codigoEstudiante) {
        results.errors.push(`Fila ${index + 1}: Código de estudiante es obligatorio.`);
        results.rejectedCount++;
        return null;
      }

      results.imported++;
      return userToSave;
    }).filter(u => u !== null);

    setUsuarios(prev => {
      const updated = [...prev, ...newUsersToProcess];
      guardarStorage(STORAGE_KEYS.usuarios, updated);
      window.dispatchEvent(new CustomEvent('usuariosActualizadas'));
      return updated;
    });
    return results;
  };

  const addPregunta = (p) => {
    const updated = guardarPreguntaGlobal(p);
    setPreguntas(updated);
    
    // Notificación al administrador
    if (user?.rol === 'docente') {
      crearNotificacion({
        destinatarioRol: "administrador",
        titulo: "Nueva pregunta creada",
        mensaje: `${user.nombreCompleto} creó una nueva pregunta en el banco general.`,
        tipo: "sistema",
        prioridad: "baja",
        enlace: "bank"
      });
    }
  };

  const deletePregunta = (id) => {
    const p = preguntas.find(item => item.id === id);
    // Verificar que un docente solo pueda borrar sus propias preguntas
    if (user?.rol === 'docente' && p?.creadoPor !== user?.id) {
       return;
    }
    const updated = preguntas.map(old => old.id === id ? { ...old, estado: 'eliminada', fechaEliminacion: new Date().toISOString() } : old);
    guardarStorage(STORAGE_KEYS.preguntas, updated);
    setPreguntas(updated);
    window.dispatchEvent(new CustomEvent('preguntasActualizadas'));
  };

  const updatePregunta = (p) => {
    const oldP = preguntas.find(item => item.id === p.id);
    // Verificar permisos de edición si es docente
    if (user?.rol === 'docente' && oldP?.creadoPor !== user?.id) {
       return;
    }
    const updated = guardarPreguntaGlobal(p);
    setPreguntas(updated);
  };

  const addSimulacro = (s) => {
    const updated = guardarSimulacroGlobal(s);
    setSimulacros(updated);

    // Notificación al administrador si lo crea un docente
    if (user?.rol === 'docente') {
      crearNotificacion({
        destinatarioRol: "administrador",
        titulo: "Nuevo simulacro creado",
        mensaje: `${user.nombreCompleto} creó un nuevo simulacro global: ${s.nombre}`,
        tipo: "sistema",
        prioridad: "media",
        enlace: "simulacros"
      });
    }

    // Notificación a estudiantes si es publicado
    if (s.estado === 'publicado' || !s.estado) {
      crearNotificacion({
        destinatarioRol: "estudiante",
        destinatarioInstitucion: s.institucion,
        destinatarioGrupo: s.grupoAsignado,
        titulo: "Nuevo simulacro asignado",
        mensaje: `Tienes disponible el simulacro: ${s.nombre || s.titulo}.`,
        tipo: "examen",
        prioridad: "alta",
        enlace: "misSimulacros"
      });
    }
  };

  const updateSimulacro = (s) => {
    const oldSim = simulacros.find(item => item.id === s.id);
    const updated = guardarSimulacroGlobal(s);
    setSimulacros(updated);

    // Si se acaba de asignar o cambió la asignación y está publicado
    if (s.estado === 'publicado' || s.estado === 'activo') {
      const asignacionNueva = JSON.stringify(s.asignadoA) !== JSON.stringify(oldSim?.asignadoA);
      
      if (asignacionNueva) {
        const tipoAsignacion = s.asignadoA?.tipo;

        if (tipoAsignacion === 'estudiantes' && s.asignadoA?.estudiantesIds?.length > 0) {
          s.asignadoA.estudiantesIds.forEach(estudianteId => {
            crearNotificacion({
              destinatarioId: estudianteId,
              destinatarioRol: "estudiante",
              titulo: "Nuevo simulacro asignado",
              mensaje: `Tienes disponible el simulacro: ${s.nombre || s.titulo}.`,
              tipo: "simulacro_asignado",
              prioridad: "media",
              enlace: "misSimulacros",
              metadata: { simulacroId: s.id }
            });
          });
        } else if (tipoAsignacion === 'grupo' || tipoAsignacion === 'institucion' || tipoAsignacion === 'todos') {
          crearNotificacion({
            destinatarioRol: "estudiante",
            destinatarioInstitucion: (tipoAsignacion === 'grupo' || tipoAsignacion === 'institucion') ? s.asignadoA.institucion : "",
            destinatarioGrupo: tipoAsignacion === 'grupo' ? s.asignadoA.grupo : "",
            titulo: "Nuevo simulacro asignado",
            mensaje: `Se ha publicado un nuevo simulacro: ${s.nombre || s.titulo}.`,
            tipo: "examen",
            prioridad: "alta",
            enlace: "misSimulacros",
            metadata: { simulacroId: s.id }
          });
        }
      }
    }
  };

  const deleteSimulacro = (id) => {
    const s = simulacros.find(item => item.id === id);
    if (user?.rol === 'docente' && s?.creadoPor !== user?.id) {
      return;
    }
    // Marcar como eliminado en lugar de filtrar para mantener consistencia con preguntas
    const updated = simulacros.map(old => old.id === id ? { ...old, estado: 'eliminado', fechaEliminacion: new Date().toISOString() } : old);
    guardarStorage(STORAGE_KEYS.simulacros, updated);
    setSimulacros(updated);
    window.dispatchEvent(new CustomEvent('simulacrosActualizados'));
    window.dispatchEvent(new CustomEvent('datosGlobalesActualizados'));
  };

  const asignarDocenteAEstudiante = (estudianteId, docenteId) => {
    const docente = usuarios.find(u => u.id === docenteId);
    if (!docente) return { success: false, message: "Docente no encontrado." };

    const updated = usuarios.map(u => {
      if (u.id === estudianteId) {
        return { ...u, docenteAsignado: docente.id, docenteNombre: docente.nombreCompleto };
      }
      return u;
    });
    setUsuarios(updated);
    guardarStorage(STORAGE_KEYS.usuarios, updated);
    return { success: true };
  };

  const asignarDocenteAGrupo = (institucion, grupo, docenteId) => {
    const docente = usuarios.find(u => u.id === docenteId);
    if (!docente) return { success: false, message: "Docente no encontrado." };

    const updated = usuarios.map(usuario => {
      const esEstudiante = normalizarRol(usuario.rol) === "estudiante";
      const perteneceGrupo = usuario.institucion === institucion && usuario.grupo === grupo;

      if (esEstudiante && perteneceGrupo) {
        return {
          ...usuario,
          docenteAsignado: docente.id,
          docenteNombre: docente.nombreCompleto
        };
      }

      if (usuario.id === docente.id) {
        const gruposActuales = Array.isArray(usuario.gruposAsignados) ? usuario.gruposAsignados : [];
        const claveGrupo = `${institucion} - ${grupo}`;
        return {
          ...usuario,
          gruposAsignados: [...new Set([...gruposActuales, grupo])],
          institucionesAsignadas: [...new Set([...(usuario.institucionesAsignadas || []), institucion])],
          gruposInstitucion: [...new Set([...(usuario.gruposInstitucion || []), claveGrupo])]
        };
      }
      return usuario;
    });
    setUsuarios(updated);
    guardarStorage(STORAGE_KEYS.usuarios, updated);
    return { success: true };
  };

  const addIntento = (intento) => {
    setIntentos(prev => [...prev, { ...intento, id: Date.now() }]);
  };

  const addSolicitud = (s) => {
    setSolicitudes(prev => [...prev, { ...s, id: `sol_${Date.now()}` }]);
  };

  const updateSolicitud = (id, data) => {
    setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteSolicitud = (id) => {
    setSolicitudes(prev => prev.filter(s => s.id !== id));
  };

  const updateModulo = (id, data) => {
    setModulos(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const updatePermisos = (nuevosPermisos) => {
    setPermisos(nuevosPermisos);
  };

  return (
    <AppContext.Provider value={{
      user, login, logout, registerUser,
      usuarios, setUsuarios, updateUsuario, deleteUsuario, toggleUserStatus, resetPassword, changePassword, bulkImportUsers,
      asignarDocenteAEstudiante, asignarDocenteAGrupo,
      preguntas, addPregunta, deletePregunta, updatePregunta,
      simulacros, addSimulacro, updateSimulacro, deleteSimulacro,
      intentos, addIntento,
      permisos, setPermisos, updatePermisos,
      modulos, setModulos, updateModulo,
      solicitudes, setSolicitudes, addSolicitud, updateSolicitud, deleteSolicitud
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
