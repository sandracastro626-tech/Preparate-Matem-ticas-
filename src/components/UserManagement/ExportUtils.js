import * as XLSX from 'xlsx';

export const exportToCSV = (data, filename) => {
  const csvContent = "data:text/csv;charset=utf-8," 
    + data.map(row => Object.values(row).join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const formatUsersForExport = (users) => {
  return users.map(user => ({
    "Nombre completo": user.nombreCompleto || "",
    "Rol": user.rol || "",
    "Tipo Documento": user.tipoDocumento || "",
    "Documento": user.numeroDocumento || "",
    "Correo": user.email || "",
    "Código estudiante": user.codigoEstudiante || "",
    "Grado": user.grado || "",
    "Grupo": user.grupo || (user.gruposAsignados ? user.gruposAsignados.join(", ") : ""),
    "Institución": user.institucion || "",
    "Docente asignado": user.docenteAsignado || "",
    "Usuario": user.usuario || "",
    "Estado": user.estado || "",
    "Fecha de creación": user.fechaCreacion || ""
  }));
};
