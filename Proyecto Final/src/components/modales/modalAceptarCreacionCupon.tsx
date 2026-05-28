import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalAceptarCreacionCuponProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ModalAceptarCreacionCupon({
  isOpen,
  onClose,
  onConfirm,
}: ModalAceptarCreacionCuponProps) {
  const [inputValue, setInputValue] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setInputValue("");
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const isButtonDisabled = inputValue !== "ACEPTO";

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out] pointer-events-auto">
      <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl transform transition-all animate-[slideInUp_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Confirmar Creación</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors font-bold"
          >
            ✕
          </button>
        </div>
        
        <p className="text-slate-600 font-medium mb-6 leading-relaxed">
          Una vez creado no puede eliminarse, asegúrate que todos los datos sean correctos.
        </p>
        
        <div className="mb-8">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Escribe "ACEPTO" para confirmar
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="ACEPTO"
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:bg-white focus:border-slate-400 outline-none transition-colors"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-4 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isButtonDisabled}
            className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-95 disabled:active:scale-100"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root") || document.body
  );
}
