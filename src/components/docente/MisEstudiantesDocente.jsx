import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { obtenerEstudiantesDelDocente } from '../../utils/docenteUtils';
import { Users, Search, MoreVertical, FileText, ChevronRight, BarChart2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AnalisisEstudiante from './AnalisisEstudiante';

export default function MisEstudiantesDocente() {
  const { usuarios, intentos, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const misEstudiantes = obtenerEstudiantesDelDocente(usuarios, user);

  const filteredEstudiantes = misEstudiantes.filter(e => 
    e.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.codigoEstudiante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.grupo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvergeScore = (estudianteId) => {
    const misIntentos = intentos.filter(i => i.estudianteId === estudianteId);
    if (misIntentos.length === 0) return 0;
    return Math.round(misIntentos.reduce((a, b) => a + (b.resultados?.puntajeGlobal || 0), 0) / misIntentos.length);
  };

  if (selectedStudent) {
    return (
      <AnalisisEstudiante 
        estudiante={selectedStudent} 
        intentos={intentos} 
        onBack={() => setSelectedStudent(null)} 
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Directorio de Estudiantes</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Control académico individual</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, código o grupo..."
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
        {filteredEstudiantes.length > 0 ? (
          filteredEstudiantes.map(e => {
            const prom = getAvergeScore(e.id);
            const numSim = intentos.filter(i => i.estudianteId === e.id).length;
            
            return (
              <motion.div 
                key={e.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all group"
              >
                <div className="p-8 flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 text-slate-400 font-black text-3xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl shadow-slate-50 group-hover:shadow-indigo-100">
                    {e.nombreCompleto?.charAt(0)}
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{e.nombreCompleto}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Grupo {e.grupo}</p>
                  
                  <div className="grid grid-cols-2 gap-4 w-full mb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Promedio</p>
                      <p className="text-sm font-black text-slate-700">{prom}%</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Simulacros</p>
                      <p className="text-sm font-black text-slate-700">{numSim}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full">
                    <button 
                      onClick={() => setSelectedStudent(e)}
                      className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                    >
                      <BarChart2 size={16} /> Detalle
                    </button>
                    <button 
                      className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <Users size={64} className="mx-auto text-slate-100 mb-6" />
            <p className="text-slate-300 font-black uppercase text-xl tracking-widest">No se encontraron estudiantes</p>
          </div>
        )}
      </div>
    </div>
  );
}
