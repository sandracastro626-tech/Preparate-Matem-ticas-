import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Save, HelpCircle, CheckCircle2 } from 'lucide-react';
import ImageUploader from '../shared/ImageUploader';

export default function FormularioPreguntaDocente({ pregunta, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    enunciado: '',
    competencia: 'Interpretación y representación',
    componente: 'Numérico-variacional',
    dificultad: 'Media',
    afirmacion: '',
    evidencia: '',
    contexto: '',
    opciones: {
       A: '', B: '', C: '', D: ''
    },
    respuestaCorrecta: 'A',
    explicacion: '',
    retroalimentacionIncorrecta: '',
    imagen: '',
    imagenNombre: '',
    imagenTipo: '',
    imagenFuente: '',
    visibilidad: 'compartida',
    visiblePara: ['administrador', 'docente'],
    seleccionable: true,
    estado: 'activa'
  });

  useEffect(() => {
    if (pregunta) {
      setFormData({ ...pregunta });
    }
  }, [pregunta]);

  const handleImageChange = (imageData) => {
    setFormData(prev => ({
      ...prev,
      ...imageData
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl my-8 overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
      >
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <HelpCircle size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black">{pregunta ? 'Editar Pregunta' : 'Crear Pregunta'}</h2>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Módulo de Evaluación Matemáticas</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-3 hover:bg-white/10 rounded-full transition-colors font-black">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10">
          {/* Enunciado Section */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enunciado / Pregunta</label>
            <textarea 
              required
              rows="4"
              className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 leading-relaxed"
              placeholder="Escribe aquí el planteamiento de la pregunta..."
              value={formData.enunciado}
              onChange={(e) => setFormData({...formData, enunciado: e.target.value})}
            />
          </div>

          <ImageUploader 
            initialImage={formData.imagen} 
            onImageChange={handleImageChange} 
          />

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Competencia</label>
              <select 
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500"
                value={formData.competencia}
                onChange={(e) => setFormData({...formData, competencia: e.target.value})}
              >
                <option value="Interpretación y representación">Interpretación y representación</option>
                <option value="Formulación y ejecución">Formulación y ejecución</option>
                <option value="Argumentación">Argumentación</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Componente</label>
              <select 
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500"
                value={formData.componente}
                onChange={(e) => setFormData({...formData, componente: e.target.value})}
              >
                <option value="Numérico-variacional">Numérico-variacional</option>
                <option value="Geométrico-métrico">Geométrico-métrico</option>
                <option value="Aleatorio">Aleatorio</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dificultad</label>
              <select 
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500"
                value={formData.dificultad}
                onChange={(e) => setFormData({...formData, dificultad: e.target.value})}
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          </div>

          {/* Options Grid */}
          <div className="space-y-6">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Opciones de Respuesta</label>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div key={opt} className={`relative flex items-center p-2 rounded-2xl border-2 transition-all ${formData.respuestaCorrecta === opt ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${formData.respuestaCorrecta === opt ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white text-slate-400'}`}>
                      {opt}
                    </div>
                    <input 
                      required
                      className="flex-1 px-4 py-3 bg-transparent outline-none font-bold text-slate-700"
                      placeholder={`Opción ${opt}`}
                      value={formData.opciones[opt]}
                      onChange={(e) => setFormData({
                        ...formData, 
                        opciones: { ...formData.opciones, [opt]: e.target.value }
                      })}
                    />
                    <input 
                      type="radio" 
                      name="respuestaCorrecta"
                      className="hidden"
                      checked={formData.respuestaCorrecta === opt}
                      onChange={() => setFormData({...formData, respuestaCorrecta: opt})}
                    />
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, respuestaCorrecta: opt})}
                      className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full transition-all
                        ${formData.respuestaCorrecta === opt ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-emerald-500 hover:text-white'}`}
                    >
                      Correcta
                    </button>
                    {formData.respuestaCorrecta === opt && <CheckCircle2 className="absolute -top-2 -right-2 text-emerald-500 bg-white rounded-full" size={20} />}
                  </div>
                ))}
             </div>
          </div>

          {/* Explicación (was Justificación) */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Explicación Respuesta Correcta</label>
            <textarea 
              required
              rows="3"
              className="w-full px-8 py-4 bg-emerald-50/30 border-2 border-emerald-50 rounded-[2rem] focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
              placeholder="Explica el porqué de la respuesta correcta..."
              value={formData.explicacion}
              onChange={(e) => setFormData({...formData, explicacion: e.target.value})}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-rose-600">Retroalimentación Respuesta Incorrecta</label>
            <textarea 
              required
              rows="3"
              className="w-full px-8 py-4 bg-rose-50/30 border-2 border-rose-50 rounded-[2rem] focus:border-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
              placeholder="Tips para mejorar si el estudiante falla..."
              value={formData.retroalimentacionIncorrecta}
              onChange={(e) => setFormData({...formData, retroalimentacionIncorrecta: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Afirmación</label>
              <input 
                type="text"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-700"
                value={formData.afirmacion || ''}
                onChange={(e) => setFormData({...formData, afirmacion: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evidencia</label>
              <input 
                type="text"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-700"
                value={formData.evidencia || ''}
                onChange={(e) => setFormData({...formData, evidencia: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-10 flex gap-4">
             <button type="button" onClick={onCancel} className="flex-1 px-8 py-5 border-2 border-slate-100 rounded-[2rem] font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">Cancelar</button>
             <button type="submit" className="flex-2 px-8 py-5 bg-indigo-600 text-white rounded-[2rem] font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 uppercase tracking-widest text-xs transition-all">
                <Save size={20} />
                {pregunta ? 'Actualizar Pregunta' : 'Guardar en el Banco'}
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
