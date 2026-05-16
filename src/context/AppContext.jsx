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
import { auth, db } from '../utils/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot, 
  query, 
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';

const AppContext = createContext();

// Error handler for Firestore as per instructions
const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [simulacros, setSimulacros] = useState([]);
  const [intentos, setIntentos] = useState([]);
  
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
    localStorage.setItem('permisosPorRol', JSON.stringify(permisos));
  }, [permisos]);

  useEffect(() => {
    localStorage.setItem('modulosPlataforma', JSON.stringify(modulos));
  }, [modulos]);

  useEffect(() => {
    localStorage.setItem('solicitudesFunciones', JSON.stringify(solicitudes));
  }, [solicitudes]);
  
  // Test connection on boot
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Auth state listener
  useEffect(() => {
    console.log("Iniciando listener de Auth...");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Estado de Auth cambiado:", firebaseUser ? `UID: ${firebaseUser.uid}, Email: ${firebaseUser.email}, Verificado: ${firebaseUser.emailVerified}` : "Sin usuario");
      
      if (firebaseUser) {
        // Deep log token claims for rule debugging
        try {
          const idTokenResult = await firebaseUser.getIdTokenResult();
          console.log("Claims del token:", {
            email: idTokenResult.claims.email,
            email_verified: idTokenResult.claims.email_verified,
            uid: idTokenResult.claims.sub
          });
        } catch (err) {
          console.error("No se pudieron obtener claims:", err.message);
        }

        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          console.log("Solicitando documento de usuario a Firestore path:", `users/${firebaseUser.uid}`);
          
          let userDoc;
          try {
            // Force fetch from server to avoid cache issues with permissions
            userDoc = await getDocFromServer(userDocRef);
            console.log("Respuesta de Firestore para usuario. ¿Existe?:", userDoc.exists());
          } catch (getErr) {
            console.error("ERROR FATAL en getDocFromServer:", getErr.code, getErr.message);
            // This is where "Missing or insufficient permissions" usually happens
            if (getErr.code === 'permission-denied') {
              console.error("Permisos insuficientes para leer el propio perfil. Revisa las reglas. UID:", firebaseUser.uid);
            }
            throw getErr;
          }
          
          if (userDoc.exists()) {
            const userData = normalizarUsuario({ ...userDoc.data(), id: firebaseUser.uid });
            console.log("Datos de usuario cargados:", userData.rol);
            setUser(userData);
            localStorage.setItem('usuarioActual', JSON.stringify(userData));
            localStorage.setItem('sesionActiva', 'true');
          } else {
            console.warn("Usuario no encontrado en Firestore. Intentando crear perfil inicial...");
            // Create a default profile if it's missing (e.g., user created in console)
            const isAdminEmail = firebaseUser.email === 'sandraandersoncy@gmail.com' || firebaseUser.email === 'sandracastro626@gmail.com';
            
            const newUserProfile = normalizarUsuario({
              id: firebaseUser.uid,
              nombreCompleto: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              usuario: firebaseUser.email.split('@')[0],
              rol: isAdminEmail ? 'administrador' : 'estudiante',
              estado: 'activo',
              fechaCreacion: new Date().toISOString(),
              emailVerified: firebaseUser.emailVerified
            });
            
            console.log("Guardando nuevo perfil en Firestore...");
            await setDoc(userDocRef, newUserProfile);
            console.log("Perfil creado exitosamente.");
            setUser(newUserProfile);
            localStorage.setItem('usuarioActual', JSON.stringify(newUserProfile));
            localStorage.setItem('sesionActiva', 'true');
          }
        } catch (error) {
          console.error("Error crítico en el flujo de Auth/UserFetch:", error.message);
          setUser(null);
        }
      } else {
        setUser(null);
        localStorage.removeItem('usuarioActual');
        localStorage.removeItem('sesionActiva');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore listeners
  useEffect(() => {
    if (!user) return;

    // Users listener - Scoped by role
    let unsubUsers = () => {};
    if (user.rol === 'administrador') {
      unsubUsers = onSnapshot(collection(db, 'users'), 
        (snapshot) => {
          const usersList = snapshot.docs.map(doc => normalizarUsuario({ ...doc.data(), id: doc.id }));
          setUsuarios(usersList);
        },
        (error) => console.warn("Users list hidden (insufficient permissions)")
      );
    }

    // Preguntas listener - Scoped by role
    const unsubPreguntas = onSnapshot(collection(db, 'preguntas'), 
      (snapshot) => {
        const questionsList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setPreguntas(questionsList);
      },
      (error) => console.warn("Questions list error:", error.message)
    );

    // Simulacros listener
    const unsubSimulacros = onSnapshot(collection(db, 'simulacros'), 
      (snapshot) => {
        const examsList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setSimulacros(examsList);
      },
      (error) => console.warn("Exams list error:", error.message)
    );

    // Intentos listener - Scoped by user if not admin/docente
    let qIntentos;
    if (user.rol === 'administrador' || user.rol === 'docente') {
      qIntentos = collection(db, 'intentos');
    } else {
      qIntentos = query(collection(db, 'intentos'), where('estudianteId', '==', user.id));
    }

    const unsubIntentos = onSnapshot(qIntentos, 
      (snapshot) => {
        const attemptsList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setIntentos(attemptsList);
      },
      (error) => console.warn("Attempts list error:", error.message)
    );

    return () => {
      unsubUsers();
      unsubPreguntas();
      unsubSimulacros();
      unsubIntentos();
    };
  }, [user]);

  const login = async (usuarioOCorreo, contrasenaIngresada) => {
    try {
      console.log("Intentando login para:", usuarioOCorreo);
      
      let res;
      try {
        // Primero intentamos con el valor tal cual
        res = await signInWithEmailAndPassword(auth, usuarioOCorreo, contrasenaIngresada);
      } catch (firstError) {
        // Si falla y no parece un correo, intentamos con el sufijo por defecto
        if (!usuarioOCorreo.includes('@')) {
          const suffixedEmail = `${usuarioOCorreo}@checkicfes.com`;
          console.log("Reintentando con sufijo:", suffixedEmail);
          res = await signInWithEmailAndPassword(auth, suffixedEmail, contrasenaIngresada);
        } else {
          throw firstError;
        }
      }
      
      console.log("Login exitoso en Auth. emailVerified:", res.user.emailVerified);
      
      const email = res.user.email;
      const isAdmin = email === 'sandraandersoncy@gmail.com' || email === 'sandracastro626@gmail.com';
      
      if (!res.user.emailVerified && !isAdmin) {
        await signOut(auth);
        return { success: false, message: "Correo no verificado. Revisa tu bandeja de entrada o spam. Debes verificar el correo antes de ingresar." };
      }

      return { success: true };
    } catch (error) {
      console.error("Login error detallado:", error.code, error.message);
      let message = `Error de autenticación: ${error.code || 'unknown'}.`;
      
      if (error.code === 'auth/operation-not-allowed') {
        message = "El inicio de sesión no está habilitado en Firebase. Actívalo en la consola (Authentication -> Sign-in method).";
      } else if (error.code === 'auth/invalid-credential') {
        message = "Credenciales inválidas. Verifica que el correo y la contraseña sean correctos. Si acabas de registrarte, asegúrate de haber confirmado tu correo.";
      } else if (error.code === 'auth/user-not-found') {
        message = "Usuario no registrado en este proyecto.";
      } else if (error.code === 'auth/wrong-password') {
        message = "Contraseña incorrecta.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Muchos intentos. Intenta más tarde.";
      }
      
      return { success: false, message };
    }
  };

  const resendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        return { success: true };
      } catch (error) {
        console.error("Error resending verification:", error);
        return { success: false, message: error.message };
      }
    }
    return { success: false, message: "No hay usuario autenticado." };
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const registerUser = async (newUser) => {
    try {
      const email = newUser.email || `${newUser.usuario}@checkicfes.com`;
      const password = newUser.contrasena || 'Temp123*';
      
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;

      // Enviar correo de verificación inmediatamente
      await sendEmailVerification(res.user);
      
      const userToSave = normalizarUsuario({
        ...newUser,
        email,
        id: uid,
        fechaCreacion: new Date().toISOString(),
        estado: 'activo',
        emailVerified: false // Flag manual para seguimiento
      });
      
      await setDoc(doc(db, 'users', uid), userToSave);
      
      // Como createUserWithEmailAndPassword hace login automático, hacemos logout
      // para obligar a verificar el correo primero.
      await signOut(auth);

      return { success: true, message: "Usuario creado. Se ha enviado un correo de verificación." };
    } catch (error) {
      console.error("Registration error:", error);
      let message = error.message;
      if (error.code === 'auth/operation-not-allowed') {
        message = "El registro con correo/contraseña no está habilitado en Firebase. Por favor, actívalo en la consola de Firebase (Sección Authentication -> Sign-in method).";
      } else if (error.code === 'auth/invalid-credential') {
        message = "Credenciales inválidas. Por favor verifica que el correo y la contraseña sean correctos para este nuevo proyecto.";
      } else if (error.code === 'auth/user-not-found') {
        message = "Usuario no encontrado. Asegúrate de que tu cuenta esté registrada en este proyecto.";
      } else if (error.code === 'auth/wrong-password') {
        message = "Contraseña incorrecta. Por favor intenta de nuevo.";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "Este correo electrónico ya está en uso.";
      } else if (error.code === 'auth/weak-password') {
        message = "La contraseña es muy débil (mínimo 6 caracteres).";
      } else if (error.code === 'auth/invalid-email') {
        message = "El formato del correo electrónico es inválido.";
      }
      return { success: false, message };
    }
  };

  const updateUsuario = async (userId, updatedData) => {
    try {
      if (updatedData.rol) updatedData.rol = normalizarRol(updatedData.rol);
      
      await updateDoc(doc(db, 'users', userId), {
        ...updatedData,
        fechaActualizacion: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      return { success: false, message: error.message };
    }
  };

  const deleteUsuario = async (userId) => {
    try {
      if (userId === 'admin_001') return { success: false, message: "No se puede eliminar el administrador principal." };
      await deleteDoc(doc(db, 'users', userId));
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
      return { success: false, message: error.message };
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const u = usuarios.find(item => item.id === userId);
      const nuevoEstado = u.estado === 'activo' ? 'inactivo' : 'activo';
      await updateDoc(doc(db, 'users', userId), { estado: nuevoEstado });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      return { success: false, message: error.message };
    }
  };

  const resetPassword = async (userId, newPassword) => {
    try {
      // In Firebase Auth, resetting password requires specific methods.
      // For this demo context, we just update the Firestore record.
      // Real sync would need Firebase Admin or user re-auth.
      await updateDoc(doc(db, 'users', userId), { 
        contrasena: newPassword, 
        debeCambiarContrasena: false 
      });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      return { success: false, message: error.message };
    }
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
        debeCambiarContrasena: false,
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

  const addPregunta = async (p) => {
    try {
      const id = p.id || doc(collection(db, 'preguntas')).id;
      const questionToSave = {
        ...p,
        id,
        fechaCreacion: p.fechaCreacion || new Date().toISOString(),
        estado: p.estado || 'activa'
      };
      await setDoc(doc(db, 'preguntas', id), questionToSave);
      
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
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'preguntas');
    }
  };

  const deletePregunta = async (id) => {
    try {
      const p = preguntas.find(item => item.id === id);
      if (user?.rol === 'docente' && p?.creadoPor !== user?.id) return;
      
      await updateDoc(doc(db, 'preguntas', id), { 
        estado: 'eliminada', 
        fechaEliminacion: new Date().toISOString() 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `preguntas/${id}`);
    }
  };

  const updatePregunta = async (p) => {
    try {
      const oldP = preguntas.find(item => item.id === p.id);
      if (user?.rol === 'docente' && oldP?.creadoPor !== user?.id) return;
      
      await updateDoc(doc(db, 'preguntas', p.id), {
        ...p,
        fechaActualizacion: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `preguntas/${p.id}`);
    }
  };

  const addSimulacro = async (s) => {
    try {
      const id = s.id || doc(collection(db, 'simulacros')).id;
      const simulacroToSave = {
        ...s,
        id,
        fechaCreacion: s.fechaCreacion || new Date().toISOString()
      };
      await setDoc(doc(db, 'simulacros', id), simulacroToSave);

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
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'simulacros');
    }
  };

  const updateSimulacro = async (s) => {
    try {
      const oldSim = simulacros.find(item => item.id === s.id);
      await updateDoc(doc(db, 'simulacros', s.id), {
        ...s,
        fechaActualizacion: new Date().toISOString()
      });

      if (s.estado === 'publicado' || s.estado === 'activo') {
        const asignacionNueva = JSON.stringify(s.asignadoA) !== JSON.stringify(oldSim?.asignadoA);
        if (asignacionNueva) {
          // ... Notification logic ...
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `simulacros/${s.id}`);
    }
  };

  const deleteSimulacro = async (id) => {
    try {
      const s = simulacros.find(item => item.id === id);
      if (user?.rol === 'docente' && s?.creadoPor !== user?.id) return;
      
      await updateDoc(doc(db, 'simulacros', id), { 
        estado: 'eliminado', 
        fechaEliminacion: new Date().toISOString() 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `simulacros/${id}`);
    }
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

  const addIntento = async (intento) => {
    try {
      const id = doc(collection(db, 'intentos')).id;
      await setDoc(doc(db, 'intentos', id), { ...intento, id });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'intentos');
    }
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
      user, loading, login, logout, registerUser, resendVerification,
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
