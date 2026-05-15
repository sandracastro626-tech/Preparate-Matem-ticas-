
export const obtenerEstudiantesDelDocente = (usuarios, usuarioActual) => {
  if (!usuarioActual) return [];

  return usuarios.filter((usuario) => {
    const esEstudiante = String(usuario.rol || "").toLowerCase() === "estudiante";

    const asignadoPorId =
      usuario.docenteAsignado === usuarioActual.id;

    const asignadoPorNombre =
      usuario.docenteAsignado === usuarioActual.nombreCompleto;

    const asignadoPorGrupo =
      Array.isArray(usuarioActual.gruposAsignados) &&
      usuarioActual.gruposAsignados.includes(usuario.grupo);

    const asignadoPorInstitucion =
      usuarioActual.institucion &&
      usuario.institucion === usuarioActual.institucion;

    return (
      esEstudiante &&
      (asignadoPorId || asignadoPorNombre || asignadoPorGrupo || asignadoPorInstitucion)
    );
  });
};

export const obtenerResultadosDeEstudiantes = (intentos, estudiantesIds) => {
  return intentos.filter(i => estudiantesIds.includes(i.estudianteId));
};
