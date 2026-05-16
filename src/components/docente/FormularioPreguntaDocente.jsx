import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Save, HelpCircle, CheckCircle2 } from 'lucide-react';
import ImageUploader from '../shared/ImageUploader';

export default function FormularioPreguntaDocente({ pregunta, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    textoInicial: '',
    textoPosterior: '',
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
      setFormData({ 
        ...pregunta,
        textoInicial: pregunta.textoInicial || pregunta.enunciado || '',
        textoPosterior: pregunta.textoPosterior || ''
      });
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
    const dataToSave = {
      ...formData,
      enunciado: formData.textoInicial
    };
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl my-8 overflow-hidden border border-slate-100 flex flex-col max-h-[95vh]"
      >
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <HelpCircle size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black">{pregunta ? 'Editar Pregunta' : 'Crear Pregunta'}</h2>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Estructura Flexible tipo ICFES</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-3 hover:bg-white/10 rounded-full transition-colors font-black">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column: Form content */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Texto inicial de la pregunta (Contexto)</label>
                <textarea 
                  required
                  rows="4"
                  className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 leading-relaxed"
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
                  className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 leading-relaxed"
                  placeholder="Escribe aquí la pregunta final o instrucción después de la imagen..."
                  value={formData.textoPosterior}
                  onChange={(e) => setFormData({...formData, textoPosterior: e.target.value})}
                />
              </div>

              {/* Options Grid */}
              <div className="space-y-6 pt-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">4. Opciones de Respuesta</label>
                 <div className="grid grid-cols-1 gap-4">
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
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, respuestaCorrecta: opt})}
                          className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full transition-all
                            ${formData.respuestaCorrecta === opt ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400 hover:bg-emerald-500 hover:text-white'}`}
                        >
                          Correcta
                        </button>
                        {formData.respuestaCorrecta === opt && <CheckCircle2 className="absolute -top-2 -right-2 text-emerald-500 bg-white rounded-full shadow-sm" size={20} />}
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Right Column: Metadata & Preview */}
            <div className="space-y-8">
              {/* Preview Section */}
              <div className="bg-slate-50 rounded-[2.5rem] p-8 border-2 border-dashed border-slate-200">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Vista Previa</h4>
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

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Explicación Respuesta Correcta</label>
                <textarea 
                  required
                  rows="2"
                  className="w-full px-8 py-4 bg-emerald-50/30 border-2 border-emerald-50 rounded-[2rem] focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
                  placeholder="Explica el porqué de la respuesta correcta..."
                  value={formData.explicacion}
                  onChange={(e) => setFormData({...formData, explicacion: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-rose-600">Retroalimentación Incorrecta</label>
                <textarea 
                  required
                  rows="2"
                  className="w-full px-8 py-4 bg-rose-50/30 border-2 border-rose-50 rounded-[2rem] focus:border-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
                  placeholder="Tips para mejorar si el estudiante falla..."
                  value={formData.retroalimentacionIncorrecta}
                  onChange={(e) => setFormData({...formData, retroalimentacionIncorrecta: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-10 flex gap-4">
             <button type="button" onClick={onCancel} className="flex-1 px-8 py-5 border-2 border-slate-100 rounded-[2rem] font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">Cancelar</button>
             <button type="submit" className="flex-[2] px-8 py-5 bg-indigo-600 text-white rounded-[2rem] font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 uppercase tracking-widest text-xs transition-all">
                <Save size={20} />
                {pregunta ? 'Actualizar Pregunta' : 'Guardar en el Banco'}
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
