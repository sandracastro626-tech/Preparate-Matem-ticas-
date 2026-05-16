import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Save, HelpCircle, CheckCircle2, Plus, Image as ImageIcon, Type, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import ImageUploader from '../shared/ImageUploader';

export default function FormularioPreguntaDocente({ pregunta, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    bloques: [
      { id: Date.now(), type: 'text', content: '' }
    ],
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
    visibilidad: 'compartida',
    visiblePara: ['administrador', 'docente'],
    seleccionable: true,
    estado: 'activa'
  });

  useEffect(() => {
    if (pregunta) {
      // Migración / Compatibilidad
      let initialBloques = pregunta.bloques;
      if (!initialBloques || !Array.isArray(initialBloques)) {
        initialBloques = [];
        if (pregunta.textoInicial || pregunta.enunciado) {
          initialBloques.push({ id: 1, type: 'text', content: pregunta.textoInicial || pregunta.enunciado });
        }
        if (pregunta.imagen) {
          initialBloques.push({ id: 2, type: 'image', content: pregunta.imagen });
        }
        if (pregunta.textoPosterior) {
          initialBloques.push({ id: 3, type: 'text', content: pregunta.textoPosterior });
        }
      }

      setFormData({ 
        ...pregunta,
        bloques: initialBloques.length > 0 ? initialBloques : [{ id: Date.now(), type: 'text', content: '' }]
      });
    }
  }, [pregunta]);

  const addBlock = (type) => {
    setFormData(prev => ({
      ...prev,
      bloques: [...prev.bloques, { 
        id: Date.now(), 
        type, 
        content: '' 
      }]
    }));
  };

  const removeBlock = (id) => {
    setFormData(prev => ({
      ...prev,
      bloques: prev.bloques.filter(b => b.id !== id)
    }));
  };

  const updateBlock = (id, content) => {
    setFormData(prev => ({
      ...prev,
      bloques: prev.bloques.map(b => b.id === id ? { ...b, content } : b)
    }));
  };

  const moveBlock = (index, direction) => {
    const newBloques = [...formData.bloques];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newBloques.length) return;
    
    [newBloques[index], newBloques[targetIndex]] = [newBloques[targetIndex], newBloques[index]];
    setFormData(prev => ({ ...prev, bloques: newBloques }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Extraer un enunciado simplificado para búsquedas rápidas (primer bloque de texto)
    const primerTexto = formData.bloques.find(b => b.type === 'text')?.content || '';
    
    const dataToSave = {
      ...formData,
      enunciado: primerTexto
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
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Estructura Flexible Dinámica</p>
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
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contenido de la Pregunta</label>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => addBlock('text')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                  >
                    <Type size={14} /> Texto
                  </button>
                  <button 
                    type="button" 
                    onClick={() => addBlock('image')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                  >
                    <ImageIcon size={14} /> Imagen
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {formData.bloques.map((block, index) => (
                  <div key={block.id} className="relative group bg-slate-50/50 p-6 rounded-[2rem] border-2 border-transparent hover:border-slate-100 transition-all">
                    {/* Controls */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                      <button type="button" onClick={() => moveBlock(index, -1)} className="p-1.5 bg-white shadow-md rounded-lg text-slate-400 hover:text-indigo-600"><ArrowUp size={14}/></button>
                      <button type="button" onClick={() => moveBlock(index, 1)} className="p-1.5 bg-white shadow-md rounded-lg text-slate-400 hover:text-indigo-600"><ArrowDown size={14}/></button>
                    </div>
                    
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all z-10">
                      <button type="button" onClick={() => removeBlock(block.id)} className="p-2 bg-white shadow-md rounded-full text-rose-400 hover:text-rose-600 hover:scale-110 transition-all"><Trash2 size={16}/></button>
                    </div>

                    {block.type === 'text' ? (
                      <textarea 
                        required
                        className="w-full bg-transparent outline-none font-bold text-slate-700 leading-relaxed resize-none overflow-hidden"
                        placeholder="Escribe el contenido del bloque de texto..."
                        rows={block.content.split('\n').length + 2}
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, e.target.value)}
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageUploader 
                          initialImage={block.content} 
                          onImageChange={(img) => updateBlock(block.id, img.imagen)} 
                          label="Cargar imagen en esta posición"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Options Grid */}
              <div className="space-y-6 pt-10">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Opciones de Respuesta</label>
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
                  {formData.bloques.map((block) => (
                    <div key={block.id} className="mb-4 last:mb-0">
                      {block.type === 'text' ? (
                        <p className="text-base text-slate-900 whitespace-pre-line font-medium">
                          {block.content || '...'}
                        </p>
                      ) : block.content ? (
                        <div className="my-6 flex justify-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <img
                            src={block.content}
                            alt="Vista previa apoyo"
                            className="max-h-52 rounded-lg object-contain"
                          />
                        </div>
                      ) : (
                        <div className="my-6 p-10 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 text-xs font-bold uppercase">
                           Imagen no cargada
                        </div>
                      )}
                    </div>
                  ))}

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
