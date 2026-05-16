import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Save, AlertCircle, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import ImageUploader from '../shared/ImageUploader';

export default function FormularioPregunta({ pregunta, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    textoInicial: '',
    textoPosterior: '',
    enunciado: '',
    opciones: { A: '', B: '', C: '', D: '' },
    respuestaCorrecta: 'A',
    competencia: 'Interpretación y representación',
    componente: 'Estadística',
    dificultad: 'Media',
    explicacion: '',
    retroalimentacionIncorrecta: '',
    afirmacion: '',
    evidencia: '',
    contexto: '',
    imagen: '',
    imagenNombre: '',
    imagenTipo: '',
    imagenFuente: '',
    imagenUrl: '',
    visibilidad: 'global',
    visiblePara: ['administrador', 'docente'],
    seleccionable: true,
    estado: 'activa'
  });

  useEffect(() => {
    if (pregunta) {
      setFormData({
        ...pregunta,
        textoInicial: pregunta.textoInicial || pregunta.enunciado || '',
        textoPosterior: pregunta.textoPosterior || '',
        opciones: { ...pregunta.opciones }
      });
    }
  }, [pregunta]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Maintain compatibility: set enunciado to textoInicial
    const dataToSave = {
      ...formData,
      enunciado: formData.textoInicial
    };
    onSave(dataToSave);
  };

  const handleImageChange = (imageData) => {
    setFormData(prev => ({
      ...prev,
      ...imageData
    }));
  };

  const handleOpcionChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      opciones: { ...prev.opciones, [key]: value }
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl my-8 overflow-hidden border border-slate-100"
      >
        <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black">{pregunta ? 'Editar Pregunta' : 'Nueva Pregunta'}</h2>
            <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Estructura flexible tipo ICFES</p>
          </div>
          <button onClick={onCancel} className="p-3 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column: Form content */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Texto inicial de la pregunta (Contexto)</label>
                <textarea 
                  required
                  rows="4"
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  placeholder="Escribe aquí el contexto inicial de la pregunta..."
                  value={formData.textoInicial}
                  onChange={(e) => setFormData({...formData, textoInicial: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Imagen, tabla o gráfico de apoyo</label>
                <ImageUploader 
                  initialImage={formData.imagen} 
                  onImageChange={handleImageChange} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">3. Texto posterior a la imagen (Pregunta final)</label>
                <textarea 
                  rows="3"
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  placeholder="Escribe aquí la pregunta final o instrucción después de la imagen..."
                  value={formData.textoPosterior}
                  onChange={(e) => setFormData({...formData, textoPosterior: e.target.value})}
                />
              </div>

              <div className="space-y-4 pt-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">4. Opciones de Respuesta</label>
                {['A', 'B', 'C', 'D'].map(key => (
                  <div key={key} className="flex gap-4 items-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black border-2 transition-all
                      ${formData.respuestaCorrecta === key ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 border-slate-50 text-slate-400'}`}>
                      {key}
                    </div>
                    <input 
                      required
                      type="text"
                      className="flex-1 px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                      placeholder={`Opción ${key}...`}
                      value={formData.opciones[key]}
                      onChange={(e) => handleOpcionChange(key, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, respuestaCorrecta: key})}
                      className={`p-3 rounded-xl transition-all ${formData.respuestaCorrecta === key ? 'text-emerald-500' : 'text-slate-200 hover:text-slate-400'}`}
                    >
                      <CheckCircle2 size={24} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contexto adicional (Opcional)</label>
                <textarea 
                  rows="2"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-600"
                  placeholder="Situación o planteamiento inicial adicional..."
                  value={formData.contexto}
                  onChange={(e) => setFormData({...formData, contexto: e.target.value})}
                />
              </div>
            </div>

            {/* Right Column: Metadata & Explanations */}
            <div className="space-y-8">
              {/* Preview Section */}
              <div className="bg-slate-50 rounded-[2.5rem] p-8 border-2 border-dashed border-slate-200">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Vista Previa del Ítem</h4>
                <div className="bg-white rounded-3xl p-8 shadow-sm min-h-[300px]">
                  <p className="text-base text-slate-900 whitespace-pre-line font-medium mb-6">
                    {formData.textoInicial || 'Sin texto inicial...'}
                  </p>

                  {formData.imagen && (
                    <div className="my-6 flex justify-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <img
                        src={formData.imagen}
                        alt="Vista previa apoyo"
                        className="max-h-52 rounded-lg object-contain"
                      />
                    </div>
                  )}

                  {formData.textoPosterior && (
                    <p className="mt-6 text-base text-slate-900 whitespace-pre-line font-medium mb-6">
                      {formData.textoPosterior}
                    </p>
                  )}

                  <div className="mt-8 space-y-3">
                    {Object.entries(formData.opciones).map(([k, v]) => (
                      <div key={k} className="flex gap-3 text-sm">
                        <strong className="text-slate-900 w-6">{k}.</strong> 
                        <span className="text-slate-600">{v || 'Sin contenido...'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Competencia</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                    value={formData.competencia}
                    onChange={(e) => setFormData({...formData, competencia: e.target.value})}
                  >
                    <option>Interpretación y representación</option>
                    <option>Formulación y ejecución</option>
                    <option>Argumentación</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dificultad</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                    value={formData.dificultad}
                    onChange={(e) => setFormData({...formData, dificultad: e.target.value})}
                  >
                    <option>Baja</option>
                    <option>Media</option>
                    <option>Alta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Componente</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                    value={formData.componente}
                    onChange={(e) => setFormData({...formData, componente: e.target.value})}
                  >
                    <option>Estadística</option>
                    <option>Geometría</option>
                    <option>Álgebra y cálculo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Imagen URL (Opcional)</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                      placeholder="https://..."
                      value={formData.imagenUrl}
                      onChange={(e) => setFormData({...formData, imagenUrl: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-emerald-600">Explicación Respuesta Correcta</label>
                <textarea 
                  required
                  rows="3"
                  className="w-full px-6 py-4 bg-emerald-50/30 border-2 border-emerald-50 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                  placeholder="¿Por qué esta es la respuesta correcta?..."
                  value={formData.explicacion}
                  onChange={(e) => setFormData({...formData, explicacion: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-rose-600">Retroalimentación Respuesta Incorrecta</label>
                <textarea 
                  required
                  rows="3"
                  className="w-full px-6 py-4 bg-rose-50/30 border-2 border-rose-50 rounded-2xl focus:border-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                  placeholder="Tips para mejorar si el estudiante falla..."
                  value={formData.retroalimentacionIncorrecta}
                  onChange={(e) => setFormData({...formData, retroalimentacionIncorrecta: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Afirmación</label>
                  <input 
                    type="text"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-700"
                    placeholder="..."
                    value={formData.afirmacion}
                    onChange={(e) => setFormData({...formData, afirmacion: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evidencia</label>
                  <input 
                    type="text"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-700"
                    placeholder="..."
                    value={formData.evidencia}
                    onChange={(e) => setFormData({...formData, evidencia: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-8 py-5 border-2 border-slate-100 rounded-[2rem] font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-[2] px-8 py-5 bg-indigo-600 text-white rounded-[2rem] font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 uppercase tracking-[0.2em]"
            >
              <Save size={24} />
              Guardar Ítem
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
