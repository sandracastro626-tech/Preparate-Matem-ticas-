import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { obtenerEstudiantesDelDocente } from '../../utils/docenteUtils';
import { FileText, Download, Printer, Users, Building2, LayoutGrid, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function ReportesDocente() {
  const { usuarios, intentos, user } = useApp();
  const [reportType, setReportType] = useState(null); // 'individual', 'grupal', 'institucional'
  const [isGenerating, setIsGenerating] = useState(false);

  const misEstudiantes = obtenerEstudiantesDelDocente(usuarios, user);

  const generateReport = (type) => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
      window.print();
    }, 1500);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Centro de Reportes</h2>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Generación de informes académicos descargables</p>
        </div>
        <FileText className="absolute -bottom-10 -right-10 text-slate-50 opacity-10" size={200} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ReportActionCard 
          title="Reporte Individual" 
          desc="Análisis detallado por estudiante, fortalezas y debilidades."
          icon={Users}
          color="bg-indigo-600"
          onClick={() => generateReport('individual')}
        />
        <ReportActionCard 
          title="Reporte Grupal" 
          desc="Consolidado de grupo, promedios y distribución niveles."
          icon={LayoutGrid}
          color="bg-emerald-600"
          onClick={() => generateReport('grupal')}
        />
        <ReportActionCard 
          title="Reporte Institución" 
          desc="Comparativa entre grupos y rendimiento institucional."
          icon={Building2}
          color="bg-amber-600"
          onClick={() => generateReport('institucional')}
        />
      </div>

      <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-indigo-500 text-[9px] font-black uppercase tracking-widest rounded-full">Automático</span>
            <h3 className="text-2xl font-black">Reporte Semanal de Progreso</h3>
          </div>
          <p className="text-indigo-200 text-sm font-medium max-w-xl">
            Genera un informe rápido con los avances de los últimos 7 días. Incluye alertas de estudiantes en riesgo y cumplimiento de simulacros.
          </p>
        </div>
        <button 
           disabled={isGenerating}
           onClick={() => generateReport('semanal')}
           className="relative z-10 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-xl shadow-black/20"
        >
          {isGenerating ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent" /> : <Download size={18} />}
          {isGenerating ? 'Generando...' : 'Exportar Reporte Semanal'}
        </button>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Actividad de Reportes Recientes</h3>
        </div>
        <div className="divide-y divide-slate-50">
          <RecentReportItem title="Informe Grupal - Matemáticas 11-A" date="Hoy, 10:45 AM" format="PDF" />
          <RecentReportItem title="Seguimiento Individual - Juan Pérez" date="Ayer, 03:20 PM" format="CSV" />
          <RecentReportItem title="Análisis Institucional - Sede Norte" date="14 May 2024" format="PDF" />
        </div>
      </div>
    </div>
  );
}

function ReportActionCard({ title, desc, icon: Icon, color, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group text-left"
    >
      <div className={`w-16 h-16 rounded-2xl ${color} text-white flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-8">{desc}</p>
      <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-2 transition-transform">
        Generar ahora <Download size={14} />
      </div>
    </button>
  );
}

function RecentReportItem({ title, date, format }) {
  return (
    <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center">
          <FileText size={20} />
        </div>
        <div>
          <p className="font-bold text-slate-700 text-sm">{title}</p>
          <p className="text-[9px] font-black text-slate-300 uppercase">{date}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="px-3 py-1 bg-slate-100 text-[9px] font-black text-slate-400 rounded-lg">{format}</span>
        <button className="text-indigo-600 hover:text-indigo-800 transition-colors">
          <Download size={18} />
        </button>
      </div>
    </div>
  );
}
