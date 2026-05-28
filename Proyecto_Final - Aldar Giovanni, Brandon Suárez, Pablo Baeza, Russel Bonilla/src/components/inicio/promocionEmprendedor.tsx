import { useState, useEffect } from "react";
import { useFetchApi } from "@/components/manipularAPI";
import type { PromocionalPrincipalItem } from "@/lib/api/tiposApi/promocionalesInicio";
import FadeImage from "@/components/fadeImage";

export default function PromocionEmprendedor() {
  const {
    data: promocionales,
    loading,
    error,
  } = useFetchApi<PromocionalPrincipalItem[]>(
    "/cliente/inicio/obtenerPromocionalPrincipal",
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  const items = promocionales ?? [];

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  // ─── Loading skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="relative block w-full h-full sm:h-[480px] rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-200 animate-pulse">
        <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end h-full">
          <div className="h-6 w-32 bg-slate-300 rounded-full mb-5" />
          <div className="h-10 w-3/4 bg-slate-300 rounded-lg mb-3" />
          <div className="h-5 w-1/2 bg-slate-300 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || items.length === 0) {
    return null;
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const current = items[currentIndex];

  return (
    <a
      href={current.urlVerMas}
      className="relative block w-full h-full sm:h-[480px] rounded-[2.5rem] overflow-hidden shadow-2xl group cursor-pointer isolate ring-1 ring-slate-200/50 bg-slate-100"
    >
      {/* Background Images with Crossfade */}
      {items.map((item, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Multi-layered Gradient Overlay for UX readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/50 to-slate-900/10 z-20" />

          <FadeImage
            src={item.imagen}
            alt={item.titulo}
            className="w-full h-full object-cover transform transition-transform duration-[12000ms] ease-out scale-105 group-hover:scale-110"
          />
        </div>
      ))}

      {/* Interactive Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-30 flex flex-col justify-end h-full">
        <div className="transform transition-all duration-500 translate-y-2 group-hover:translate-y-0">
          <div className="inline-flex mb-5 relative">
            <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full" />
            <span className="badge badge-primary border-none bg-primary text-primary-content font-bold px-4 py-3.5 uppercase tracking-[0.15em] text-[10px] relative z-10 shadow-lg ring-1 ring-white/20">
              {current.etiqueta}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 leading-tight drop-shadow-md">
            {current.titulo}
          </h2>

          <div className="flex justify-between items-end gap-6">
            <p className="text-sm sm:text-base text-slate-200 line-clamp-2 max-w-[70%] font-medium leading-relaxed opacity-90">
              {current.descripcion}
            </p>

            <div className="btn btn-circle bg-white text-primary border-none hover:bg-slate-100 shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:shadow-[0_0_35px_rgba(255,255,255,0.6)] transition-all duration-300 hover:scale-110 flex-shrink-0 relative overflow-hidden group/btn">
              <span className="absolute inset-0 bg-primary/10 rounded-full scale-0 group-hover/btn:scale-100 transition-transform duration-300" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 relative z-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="absolute top-6 left-0 right-0 flex justify-center gap-2 z-30 px-8">
        {items.map((_, idx) => (
          <div
            key={idx}
            className="h-1.5 flex-1 rounded-full bg-white/20 overflow-hidden backdrop-blur-md shadow-sm"
          >
            <div
              className={`h-full bg-white rounded-full transition-all duration-[6000ms] ease-linear ${
                idx === currentIndex
                  ? "w-full"
                  : idx < currentIndex
                    ? "w-full"
                    : "w-0"
              }`}
              style={{
                transitionDuration: idx === currentIndex ? "6000ms" : "300ms",
                width:
                  idx === currentIndex
                    ? "100%"
                    : idx < currentIndex
                      ? "100%"
                      : "0%",
              }}
            />
          </div>
        ))}
      </div>
    </a>
  );
}
