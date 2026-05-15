import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Target, Trophy, BarChart3, Clock, 
  ArrowUpRight, AlertCircle, TrendingUp,
  Brain, Zap, CheckCircle2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export default function InicioEstudiante({ user, resultados }) {
  const stats = useMemo(() => {
    if (!resultados || resultados.length === 0) return null;
    
    const ultimo = resultados[0]; // Assuming sorted by date desc
    const mejor = [...resultados].sort((a,b) => b.puntajeGlobal - a.puntajeGlobal)[0];
    
    // Promedio por competencias (de todos los resultados o del último)
    // El usuario pide que tome los datos del más reciente o promedio histórico. 
    // Usaremos el más reciente para las gráficas y promedio para stats generales
    
    const count = resultados.length;
    
    // Calcular competencia más fuerte y por reforzar del último resultado
    const comps = ultimo.competencias;
    const sortedComps = Object.entries(comps).sort(([,a], [,b]) => b - a);
    const fuerteComp = sortedComps[0];
    const debilComp = sortedComps[sortedComps.length - 1];

    const components = ultimo.componentes;
    const sortedComponents = Object.entries(components).sort(([,a], [,b]) => b - a);
    const fuerteComponent = sortedComponents[0];
    const debilComponent = sortedComponents[sortedComponents.length - 1];

    return {
      ultimo,
      mejor,
      count,
      fuerteComp,
      debilComp,
      fuerteComponent,
      debilComponent
    };
  }, [resultados]);

  const dataCompetencias = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.ultimo.competencias).map(([name, value]) => ({ name, value }));
  }, [stats]);

  const dataComponentes = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.ultimo.componentes).map(([name, value]) => ({ name, value }));
  }, [stats]);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
        <AlertCircle size={64} className="text-slate-200 mb-6" />
        <h3 className="text-2xl font-black text-slate-800 mb-2">Aún no tienes resultados</h3>
        <p className="text-slate-500 font-medium">Presenta un simulacro para visualizar tu progreso y obtener recomendaciones.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Saludo y Stats Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-2 tracking-tight">¡Hola, {user.nombreCompleto.split(' ')[0]}!</h2>
            <p className="text-slate-400 font-medium max-w-xs leading-relaxed">
              Tu desempeño actual en Matemáticas es de nivel <span className="text-red-400 font-black">{stats.ultimo.nivel?.label || 'Básico'}</span>.
            </p>
          </div>
          <div className="flex gap-4 mt-8 relative z-10">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Institución</p>
              <p className="text-sm font-bold truncate max-w-[150px]">{user.institucion || 'Tu Colegio'}</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Grupo</p>
              <p className="text-sm font-bold">{user.grado || '11°'}</p>
            </div>
          </div>
          <Zap className="absolute top-[-20px] right-[-20px] text-slate-800/50 w-48 h-48 pointer-events-none" />
        </div>

        <StatCard 
          label="Mejor Puntaje" 
          value={`${stats.mejor.puntajeGlobal}/100`} 
          icon={Trophy} 
          color="text-amber-500" 
          bg="bg-amber-50"
          trend="Top Rank"
        />
        
        <StatCard 
          label="Simulacros" 
          value={stats.count} 
          icon={CheckCircle2} 
          color="text-emerald-500" 
          bg="bg-emerald-50"
          trend="Completados"
        />
      </div>

      {/* Grid de Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gráfica por Competencias */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <Brain className="text-red-600" size={24} />
                Desempeño por Competencias
              </h3>
              <p className="text-sm text-slate-400 font-medium mt-1">Análisis de habilidades matemáticas</p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">{stats.fuerteComp[0]}</p>
                <p className="text-xs text-slate-400 font-bold">Fortaleza Principal</p>
              </div>
            </div>
          </div>
          
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataCompetencias} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={150}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                  {dataCompetencias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#dc2626' : '#b91c1c'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica por Componentes */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <BarChart3 className="text-emerald-600" size={24} />
                Desempeño por Componentes
              </h3>
              <p className="text-sm text-slate-400 font-medium mt-1">Dominios temáticos evaluados</p>
            </div>
          </div>
          
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dataComponentes}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                />
                <Radar
                  name="Puntaje"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fortalezas y Retroalimentación Breve */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-red-50 p-10 rounded-[2.5rem] border border-red-100">
          <h3 className="text-xl font-black text-red-900 mb-6 flex items-center gap-3">
            <TrendingUp className="text-red-600" />
            Retroalimentación Automática
          </h3>
          <p className="text-red-900/70 font-medium leading-relaxed">
            Tu competencia más fuerte es <span className="font-black text-red-950">{stats.fuerteComp[0]}</span> ({stats.fuerteComp[1]}%), lo que indica que {stats.fuerteComp[0] === 'Interpretación y representación' ? 'comprendes de manera excelente la información presentada en diversos formatos.' : stats.fuerteComp[0] === 'Formulación y ejecución' ? 'puedes aplicar procedimientos matemáticos para resolver problemas de manera efectiva.' : 'tienes una gran capacidad para validar afirmaciones y justificar rutas de solución.'}
          </p>
          <div className="h-px bg-red-200 my-6" />
          <p className="text-red-900/70 font-medium leading-relaxed">
            La competencia que más debes reforzar es <span className="font-black text-red-950">{stats.debilComp[0]}</span>. Se recomienda practicar ejercicios donde debas {stats.debilComp[0] === 'Interpretación y representación' ? 'identificar datos relevantes y transformar información gráfica a tabular.' : stats.debilComp[0] === 'Formulación y ejecución' ? 'plantear estrategias de solución y verificar procedimientos paso a paso.' : 'explicar por qué una respuesta es correcta o incorrecta y validar afirmaciones lógicas.'}
          </p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-slate-800 mb-8 items-center gap-3">Resumen Rápido</h3>
          <div className="space-y-6">
            <SummaryItem 
              label="Por Reforzar" 
              value={stats.debilComponent[0]} 
              color="text-rose-600" 
              bg="bg-rose-50" 
              icon={AlertCircle}
            />
            <SummaryItem 
              label="Competencia Clave" 
              value={stats.fuerteComp[0]} 
              color="text-red-600" 
              bg="bg-red-50" 
              icon={Brain}
            />
            <SummaryItem 
              label="Último Puntaje" 
              value={`${stats.ultimo.puntajeGlobal}/100`} 
              color="text-slate-800" 
              bg="bg-slate-100" 
              icon={Target}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
          <Icon size={28} />
        </div>
        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
          {trend}
        </span>
      </div>
      <div>
        <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{label}</h3>
        <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function SummaryItem({ label, value, color, bg, icon: Icon }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center`}>
        <Icon size={20} />
      </div>
      <div className="overflow-hidden">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-black text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}
