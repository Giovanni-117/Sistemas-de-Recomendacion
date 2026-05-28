import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  HelpCircle,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

/** Props para el componente ModalConfirmacion.
 * Usado en: modalConfirmacion.tsx
 */
export interface ModalConfirmacionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tipo?: 'danger' | 'warning' | 'info' | 'success';
}

export default function ModalConfirmacion({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  message = "Esta acción requiere confirmación antes de proceder.",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tipo = "info",
}: ModalConfirmacionProps) {
  const [isPending, setIsPending] = useState(false);

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

  const handleConfirm = async () => {
    try {
      setIsPending(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error al ejecutar confirmación:", error);
    } finally {
      setIsPending(false);
    }
  };

  // Configuración de estilo según el tipo (mapeado a clases de DaisyUI)
  const getConfig = () => {
    switch (tipo) {
      case "danger":
        return {
          borderClass: "border-error",
          iconBg: "bg-red-50",
          iconColor: "text-red-500",
          btnConfirmClass:
            "btn-error text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30",
          Icon: AlertTriangle,
        };
      case "warning":
        return {
          borderClass: "border-warning",
          iconBg: "bg-amber-50",
          iconColor: "text-amber-500",
          btnConfirmClass:
            "btn-warning text-slate-800 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30",
          Icon: AlertCircle,
        };
      case "success":
        return {
          borderClass: "border-success",
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-500",
          btnConfirmClass:
            "btn-success text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30",
          Icon: CheckCircle2,
        };
      case "info":
      default:
        return {
          borderClass: "border-info",
          iconBg: "bg-indigo-50",
          iconColor: "text-indigo-500",
          btnConfirmClass:
            "btn-info text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30",
          Icon: HelpCircle,
        };
    }
  };

  const style = getConfig();
  const IconComponent = style.Icon;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="modal modal-open z-[99999]">
      {/* Modal Box */}
      <div
        className={`modal-box max-w-md border-t-8 ${style.borderClass} rounded-3xl p-8 relative flex flex-col items-center text-center shadow-2xl animate-[scaleIn_0.2s_ease-out]`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isPending}
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-all active:scale-90 disabled:opacity-50 disabled:pointer-events-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dynamic Icon with pulse effect */}
        <div
          className={`w-20 h-20 ${style.iconBg} rounded-full flex items-center justify-center mb-6 relative`}
        >
          <div
            className={`absolute inset-0 ${style.iconBg} rounded-full scale-110 opacity-30 animate-ping`}
          />
          <IconComponent
            className={`w-10 h-10 ${style.iconColor} relative z-10 animate-[bounce_2.5s_infinite]`}
          />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3">
          {title}
        </h3>

        {/* Message / Description */}
        <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs mb-8">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="w-full flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="btn btn-neutral btn-outline flex-1 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className={`btn flex-1 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-75 disabled:pointer-events-none flex items-center justify-center gap-2 ${style.btnConfirmClass}`}
          >
            {isPending ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-current"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Procesando...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className="modal-backdrop bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={isPending ? undefined : onClose}
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
