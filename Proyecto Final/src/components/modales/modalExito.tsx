import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, X } from "lucide-react";
import type { RespuestaApi } from "@/lib/api/respuestaApi";

/** Props para el componente ModalExito.
 * Usado en: modalExito.tsx
 */
export interface ModalExitoProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  respuesta?: RespuestaApi<unknown>;
  confirmLabel?: string;
  onConfirm?: () => void;
}

export default function ModalExito({
  isOpen,
  onClose,
  title = "¡Operación Exitosa!",
  message,
  respuesta,
  confirmLabel = "Aceptar",
  onConfirm,
}: ModalExitoProps) {
  // Evitar scroll en el fondo cuando el modal esté abierto
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Extraer el mensaje de éxito a mostrar
  const getSuccessMessage = () => {
    if (message) return message;
    if (respuesta?.message) return respuesta.message;
    return "La operación se ha completado con éxito.";
  };

  const successMessage = getSuccessMessage();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="modal modal-open z-[99999]">
      {/* Modal Box */}
      <div className="modal-box max-w-md border-t-8 border-success rounded-3xl p-8 relative flex flex-col items-center text-center shadow-2xl animate-[scaleIn_0.2s_ease-out]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-all active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon with soft green pulse background */}
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 bg-emerald-100 rounded-full scale-110 opacity-30 animate-ping" />
          <CheckCircle2 className="w-10 h-10 text-emerald-500 relative z-10 animate-[bounce_2s_infinite]" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3">
          {title}
        </h3>

        {/* Description / Message */}
        <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs mb-8">
          {successMessage}
        </p>

        {/* Action Button */}
        <button
          onClick={handleConfirm}
          className="btn btn-success w-full rounded-2xl font-bold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-95"
        >
          {confirmLabel}
        </button>
      </div>

      {/* Backdrop */}
      <div
        className="modal-backdrop bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={onClose}
      >
        <button className="cursor-default">close</button>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>,
    document.body,
  );
}
