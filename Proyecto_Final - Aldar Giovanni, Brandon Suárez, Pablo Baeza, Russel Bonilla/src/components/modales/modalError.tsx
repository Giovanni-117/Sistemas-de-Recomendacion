import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, X } from "lucide-react";
import type { RespuestaApi } from "@/lib/api/respuestaApi";

/** Props para el componente ModalError.
 * Usado en: modalError.tsx
 */
export interface ModalErrorProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  respuesta?: RespuestaApi<unknown>;
  retryLabel?: string;
  onRetry?: () => void;
}

export default function ModalError({
  isOpen,
  onClose,
  title = "¡UAY! Algo salió mal",
  message,
  respuesta,
  retryLabel = "Reintentar",
  onRetry,
}: ModalErrorProps) {
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

  // Extraer el mensaje a mostrar
  const getErrorMessage = () => {
    if (message) return message;
    if (respuesta) {
      if (respuesta.error) return respuesta.error;
      if (respuesta.message) return respuesta.message;
    }
    return "Ha ocurrido un error inesperado al procesar la solicitud. Por favor, inténtalo de nuevo.";
  };

  const errorMessage = getErrorMessage();

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="modal modal-open z-[99999]">
      {/* Modal Box */}
      <div className="modal-box max-w-md border-t-8 border-error rounded-3xl p-8 relative flex flex-col items-center text-center shadow-2xl animate-[scaleIn_0.2s_ease-out]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-all active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Danger/Alert Icon with soft red pulse background */}
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 bg-red-100 rounded-full scale-110 opacity-30 animate-ping" />
          <AlertCircle className="w-10 h-10 text-red-500 relative z-10 animate-[bounce_2s_infinite]" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3">
          {title}
        </h3>

        {/* Description / Message */}
        <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs mb-8">
          {errorMessage}
        </p>

        {/* Action Buttons */}
        <div className="w-full flex gap-3">
          {onRetry ? (
            <>
              <button
                onClick={onClose}
                className="btn btn-neutral btn-outline flex-1 rounded-2xl font-bold transition-all active:scale-95"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  onRetry();
                  onClose();
                }}
                className="btn btn-error flex-1 rounded-2xl font-bold text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {retryLabel}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="btn btn-error w-full rounded-2xl font-bold text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all active:scale-95"
            >
              Entendido
            </button>
          )}
        </div>
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
