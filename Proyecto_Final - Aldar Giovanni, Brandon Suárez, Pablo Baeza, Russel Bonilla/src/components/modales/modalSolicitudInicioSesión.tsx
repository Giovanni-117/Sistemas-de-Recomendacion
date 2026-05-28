import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LogIn, Sparkles, X, ArrowLeft } from "lucide-react";

export interface ModalSolicitudInicioSesionProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function ModalSolicitudInicioSesion({
  isOpen,
  onClose,
  title,
  message,
}: ModalSolicitudInicioSesionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Evitar scroll en el fondo cuando el modal esté abierto
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleGoHome = () => {
    window.location.href = "/inicio";
    onClose();
  };

  const handleLogin = () => {
    window.location.href = "/accesoClientes";
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Premium Backdrop Blur */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300"
        onClick={handleGoHome}
      />

      {/* Elegant Modal Box with unique visual identity */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-indigo-950/95 border border-white/10 rounded-[2.5rem] p-8 text-center shadow-[0_20px_50px_rgba(99,102,241,0.25)] overflow-hidden animate-[scaleIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
        {/* Subtle decorative background gradient circles */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleGoHome}
          className="absolute right-6 top-6 z-10 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all duration-200 hover:rotate-90"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Glowing Brand Icon (Login & Sparkles Combination) */}
        <div className="w-24 h-24 mx-auto mb-6 relative flex items-center justify-center">
          {/* Intense Outer Pulsing Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-full scale-105 opacity-30 animate-pulse blur-md" />
          <div className="absolute inset-0 bg-indigo-500/15 rounded-full scale-120 animate-ping opacity-25" />

          {/* Circle Icon Container */}
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center relative z-10 shadow-lg border border-white/20">
            <LogIn className="w-9 h-9 text-white animate-[bounce_3s_infinite]" />
            <Sparkles className="w-4 h-4 text-amber-300 absolute top-3 right-3 animate-pulse" />
          </div>
        </div>

        {/* Title with Gradient Text */}
        <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-violet-200 tracking-tight mb-4">
          {title}
        </h3>

        {/* Detailed Message */}
        <p className="text-indigo-200/70 font-medium text-sm sm:text-base leading-relaxed max-w-sm mx-auto mb-8">
          {message}
        </p>

        {/* Dynamic Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3 relative z-10">
          {/* Cerrar / Regresar al Inicio Button */}
          <button
            onClick={handleGoHome}
            className="flex-1 order-2 sm:order-1 py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 hover:border-white/20 shadow-inner"
          >
            <ArrowLeft className="w-4 h-4" />
            Regresar al inicio
          </button>

          {/* Entrar / Redirigir a accesoClientes */}
          <button
            onClick={handleLogin}
            className="flex-1 order-1 sm:order-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-600 text-white font-bold shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.6)] border border-violet-400/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Entrar
          </button>
        </div>
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
