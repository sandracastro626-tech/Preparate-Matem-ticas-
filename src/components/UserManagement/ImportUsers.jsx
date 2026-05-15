import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export function ImportarUsuarios({ onImport, onCancel }) {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const processFile = () => {
    if (!file) return;
    setLoading(true);

    const reader = new FileReader();
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const importResults = onImport(results.data);
          setSummary(importResults);
          setLoading(false);
        }
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const importResults = onImport(jsonData);
        setSummary(importResults);
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Formato no soportado. Use CSV o Excel.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-teal-600 text-white">
          <h3 className="text-xl font-bold">Importar Usuarios</h3>
          <button onClick={onCancel} className="hover:bg-white/20 p-1 rounded-full">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {!summary ? (
            <>
              <p className="text-gray-600 mb-6">
                Seleccione un archivo CSV o Excel con las columnas: 
                <span className="font-mono text-xs block mt-2 bg-gray-100 p-2 rounded">
                  rol, nombreCompleto, tipoDocumento, numeroDocumento, correo, codigoEstudiante, grado, grupo, institucion, docenteAsignado, usuario, contrasenaTemporal, estado
                </span>
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-teal-500 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="text-gray-400 mb-4" size={48} />
                <p className="font-medium text-gray-700">
                  {file ? file.name : "Haga clic o arrastre un archivo aquí"}
                </p>
                <p className="text-sm text-gray-500 mt-1">Soporta .csv, .xlsx, .xls</p>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 font-semibold">
                <button 
                  onClick={onCancel}
                  className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={processFile}
                  disabled={!file || loading}
                  className="px-6 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : 'Comenzar Importación'}
                </button>
              </div>
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="text-green-500" size={32} />
                <h4 className="text-lg font-bold text-gray-800">Resumen de Importación</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <p className="text-sm text-green-700 font-medium">Importados</p>
                  <p className="text-3xl font-bold text-green-800">{summary.imported}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <p className="text-sm text-red-700 font-medium">Rechazados</p>
                  <p className="text-3xl font-bold text-red-800">{summary.rejectedCount}</p>
                </div>
              </div>
              
              {summary.errors.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <AlertCircle size={16} className="text-red-500" />
                    Detalle de errores:
                  </p>
                  <div className="max-h-40 overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs font-mono text-red-600">
                    {summary.errors.map((err, i) => (
                      <p key={i} className="mb-1">{err}</p>
                    ))}
                  </div>
                </div>
              )}
              
              <button 
                onClick={onCancel}
                className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
