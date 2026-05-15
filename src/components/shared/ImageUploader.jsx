import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Clipboard, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ImageUploader({ 
  initialImage, 
  onImageChange, 
  maxSizeMB = 2,
  label = "Imagen de apoyo de la pregunta"
}) {
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFiles = (file) => {
    if (!file) return;

    // Validate type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("El archivo seleccionado no es una imagen válida (PNG, JPG, WEBP).");
      return;
    }

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`La imagen supera el tamaño máximo permitido de ${maxSizeMB} MB. Intenta usar una imagen más liviana.`);
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      onImageChange({
        imagen: reader.result,
        imagenNombre: file.name,
        imagenTipo: file.type,
        imagenFuente: "base64"
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFiles(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        handleFiles(file);
        return;
      }
    }
  };

  const handleUrlSubmit = (e) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;

    if (!/^https?:\/\/.+/i.test(urlInput)) {
      setError("Ingrese una URL válida que comience con http:// o https://");
      return;
    }

    setError(null);
    onImageChange({
      imagen: urlInput,
      imagenNombre: "imagen-url",
      imagenTipo: "url",
      imagenFuente: "url"
    });
    setUrlInput('');
    setShowUrlInput(false);
  };

  const removeImage = () => {
    onImageChange({
      imagen: "",
      imagenNombre: "",
      imagenTipo: "",
      imagenFuente: ""
    });
    setError(null);
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      
      {!initialImage ? (
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onPaste={handlePaste}
          tabIndex={0}
          className={`relative border-2 border-dashed rounded-[2rem] transition-all flex flex-col items-center justify-center p-10 cursor-pointer outline-none focus:border-indigo-500
            ${dragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50'}
            ${error ? 'border-rose-300 bg-rose-50/10' : ''}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
          />
          
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 mb-4">
            <Upload size={32} />
          </div>
          
          <p className="text-sm font-black text-slate-700 text-center mb-1">
            Arrastra, carga o pega aquí una imagen de apoyo
          </p>
          <p className="text-xs text-slate-400 font-medium text-center">
            Formatos permitidos: PNG, JPG, WEBP (Máx. 2MB)
          </p>
          
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Upload size={14} /> Seleccionar equipo
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowUrlInput(!showUrlInput);
              }}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <LinkIcon size={14} /> Usar URL
            </button>
          </div>

          <div className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <Clipboard size={12} /> Puedes pegar con Ctrl + V
          </div>

          <AnimatePresence>
            {showUrlInput && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Escribe o pega la URL de la imagen..."
                    className="w-full pl-10 pr-12 py-3 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold focus:border-indigo-500 outline-none transition-all"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  />
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <button 
                    type="button"
                    onClick={handleUrlSubmit}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 relative overflow-hidden group">
          <div className="flex flex-col items-center">
            <img 
              src={initialImage} 
              alt="Vista previa" 
              className="max-h-64 object-contain rounded-xl border border-slate-50 shadow-sm mb-4"
            />
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-slate-50 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-2"
              >
                <RefreshCw size={14} /> Cambiar imagen
              </button>
              <button 
                type="button"
                onClick={removeImage}
                className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center gap-2"
              >
                <X size={14} /> Eliminar
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />
          </div>
        </div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-rose-500 bg-rose-50/50 p-4 rounded-2xl border border-rose-100"
        >
          <AlertCircle size={16} />
          <span className="text-xs font-bold leading-tight">{error}</span>
        </motion.div>
      )}
    </div>
  );
}
