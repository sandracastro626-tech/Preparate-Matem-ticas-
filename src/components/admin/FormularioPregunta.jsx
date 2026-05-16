import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Save, AlertCircle, Image as ImageIcon, CheckCircle2, Plus, Type, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import ImageUploader from '../shared/ImageUploader';

export default function FormularioPregunta({ pregunta, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    bloques: [
      { id: '1', type: 'text', content: '' }
    ],
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
    visibilidad: 'global',
    visiblePara: ['administrador', 'docente'],
    seleccionable: true,
    estado: 'activa'
  });

  useEffect(() => {
    if (pregunta) {
      const bloques = pregunta.bloques && pregunta.bloques.length > 0 
        ? pregunta.bloques 
        : [
            ...(pregunta.textoInicial || pregunta.enunciado ? [{ id: 't1', type: 'text', content: pregunta.textoInicial || pregunta.enunciado }] : []),
            ...(pregunta.imagen ? [{ id: 'i1', type: 'image', content: pregunta.imagen }] : []),
            ...(pregunta.textoPosterior ? [{ id: 't2', type: 'text', content: pregunta.textoPosterior }] : []),
            ...(pregunta.bloques === undefined && !pregunta.textoInicial && !pregunta.enunciado && !pregunta.imagen ? [{ id: '1', type: 'text', content: '' }] : [])
          ];

      setFormData({
        ...pregunta,
        bloques: bloques.length > 0 ? bloques : [{ id: '1', type: 'text', content: '' }],
        opciones: { ...pregunta.opciones }
      });
    }
  }, [pregunta]);

  const addBloque = (type) => {
    setFormData(prev => ({
      ...prev,
      bloques: [...prev.bloques, { 
        id: Math.random().toString(36).substr(2, 9), 
        type, 
        content: '' 
      }]
    }));
  };

  const removeBloque = (id) => {
    if (formData.bloques.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      bloques: prev.bloques.filter(b => b.id !== id)
    }));
  };

  const updateBloque = (id, content) => {
    setFormData(prev => ({
      ...prev,
      bloques: prev.bloques.map(b => b.id === id ? { ...b, content } : b)
    }));
  };

  const moveBloque = (idx, direction) => {
    const newBloques = [...formData.bloques];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= newBloques.length) return;
    [newBloques[idx], newBloques[targetIdx]] = [newBloques[targetIdx], newBloques[idx]];
    setFormData(prev => ({ ...prev, bloques: newBloques }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const primerTexto = formData.bloques.find(b => b.type === 'text')?.content || '';
    const primeraImagen = formData.bloques.find(b => b.type === 'image')?.content || '';
    
    const dataToSave = {
      ...formData,
      enunciado: primerTexto,
      textoInicial: primerTexto,
      imagen: primeraImagen
    };
    onSave(dataToSave);
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
        className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl my-8 overflow-hidden border border-slate-100"
      >
        <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black">{pregunta ? 'Editar Pregunta' : 'Nueva Pregunta'}</h2>
            <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Estructura flexible de bloques (ICFES)</p>
          </div>
          <button onClick={onCancel} className="p-3 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column: Dynamic Blocks */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Constructor de pregunta</label>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => addBloque('text')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                  >
                    <Type size={14} /> + Texto
                  </button>
                  <button 
                    type="button" 
                    onClick={() => addBloque('image')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                  >
                    <ImageIcon size={14} /> + Imagen
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {formData.bloques.map((bloque, idx) => (
                  <div key={bloque.id} className="relative group bg-slate-50 p-6 rounded-[2rem] border-2 border-transparent hover:border-indigo-100 transition-all">
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button type="button" onClick={() => moveBloque(idx, -1)} className="p-1.5 bg-white shadow-md rounded-full text-slate-400 hover:text-indigo-600"><ArrowUp size={14}/></button>
                      <button type="button" onClick={() => moveBloque(idx, 1)} className="p-1.5 bg-white shadow-md rounded-full text-slate-400 hover:text-indigo-600"><ArrowDown size={14}/></button>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => removeBloque(bloque.id)}
                      className="absolute -right-2 -top-2 w-8 h-8 bg-white text-rose-500 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all z-10"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {bloque.type === 'text' ? 'Bloque de Texto' : 'Bloque de Imagen'}
                      </span>
                    </div>

                    {bloque.type === 'text' ? (
                      <textarea 
                        required
                        rows="3"
                        className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                        placeholder="Escribe el contenido..."
                        value={bloque.content}
                        onChange={(e) => updateBloque(bloque.id, e.target.value)}
                      />
                    ) : (
                      <ImageUploader 
                        initialImage={bloque.content} 
                        onImageChange={(data) => updateBloque(bloque.id, data.imagen)} 
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Opciones de Respuesta</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map(key => (
                    <div key={key} className="flex gap-3 items-center bg-slate-50 p-4 rounded-2xl border-2 border-transparent">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, respuestaCorrecta: key})}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black border-2 transition-all
                          ${formData.respuestaCorrecta === key ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                      >
                        {key}
                      </button>
                      <input 
                        required
                        type="text"
                        className="flex-1 bg-transparent border-b-2 border-slate-200 focus:border-indigo-500 outline-none py-1 font-bold text-slate-700 text-sm"
                        placeholder={`Opción ${key}...`}
                        value={formData.opciones[key]}
                        onChange={(e) => handleOpcionChange(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Metadata & Preview */}
            <div className="space-y-8">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ImageIcon size={14} /> Vista Previa
                </h4>
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar-light">
                  {formData.bloques.map((b) => (
                    <div key={b.id}>
                      {b.type === 'text' ? (
                        <p className="text-sm font-medium leading-relaxed whitespace-pre-line text-slate-200">
                          {b.content || <span className="text-slate-600 block bg-slate-800 p-2 rounded italic">Bloque vacío...</span>}
                        </p>
                      ) : (
                        <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5 flex justify-center p-3">
                          {b.content ? (
                            <img src={b.content} alt="Preview" className="max-h-40 rounded-lg object-contain" />
                          ) : (
                            <div className="py-10 text-slate-600 text-[10px] font-black uppercase">Sin imagen</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                    {Object.entries(formData.opciones).map(([k, v]) => (
                      <div key={k} className="flex gap-2 text-[10px]">
                        <span className={`w-5 h-5 rounded flex items-center justify-center shrink-0 font-black ${formData.respuestaCorrecta === k ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>{k}</span>
                        <span className="text-slate-400 truncate">{v || '...'}</span>
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

              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Explicación Correcta</label>
                <textarea 
                  required
                  rows="2"
                  className="w-full px-6 py-4 bg-emerald-50/30 border-2 border-emerald-50 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
                  value={formData.explicacion}
                  onChange={(e) => setFormData({...formData, explicacion: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1">Feedback Incorrecta</label>
                <textarea 
                  required
                  rows="2"
                  className="w-full px-6 py-4 bg-rose-50/30 border-2 border-rose-50 rounded-2xl focus:border-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
                  value={formData.retroalimentacionIncorrecta}
                  onChange={(e) => setFormData({...formData, retroalimentacionIncorrecta: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="mt-12 flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-5 border-2 border-slate-100 rounded-[2rem] font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-8 py-5 bg-indigo-600 text-white rounded-[2rem] font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
            >
              <Save size={20} />
              Guardar Pregunta
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
