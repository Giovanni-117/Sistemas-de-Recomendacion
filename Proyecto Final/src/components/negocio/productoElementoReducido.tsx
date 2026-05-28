import { useState, useEffect, useRef, useCallback } from 'react';
import type { ProductoPublicoItem }  from "@/lib/api/tiposApi/productos";
import { RegistrarFeedbackRecomendacion } from '@/components/registrarFeedBack';


export function SkeletonProducto() {
  return (
    <div className="w-full rounded-[2rem] bg-slate-200 animate-pulse mb-6 aspect-[4/3] sm:h-72" />
  );
}

export default function NegocioElemento({
  producto,
  loading = false,
  urlWhatsapp,
  priority = false,
}: {
  producto: ProductoPublicoItem;
  loading?: boolean;
  urlWhatsapp: string;
  priority?: boolean;
}) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const carouselImages = producto?.imagenesProducto?.slice(0, 3) ?? [];

  const markLoaded = useCallback((idx: number) => {
    setLoadedImages((prev) => (prev[idx] ? prev : { ...prev, [idx]: true }));
  }, []);

  // ✅ Precarga todas las imágenes en paralelo con new Image()
  useEffect(() => {
    setLoadedImages({});
    setCurrentImageIdx(0);

    carouselImages.forEach((src, idx) => {
      if (!src) { markLoaded(idx); return; }
      const img = new Image();
      img.src = src;
      img.onload = () => markLoaded(idx);
      img.onerror = () => markLoaded(idx);
    });
  }, [producto?.idProducto]);

  // Detectar imágenes ya cargadas (cache del browser / hydration de Astro)
  useEffect(() => {
    imgRefs.current.forEach((img, idx) => {
      if (img && img.complete && img.naturalWidth > 0) {
        markLoaded(idx);
      }
    });
  }, [carouselImages.length, markLoaded]);

  // Carrusel Automático
  useEffect(() => {
    if (carouselImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  if (loading || !producto) {
    return <SkeletonProducto />;
  }

  const isActiveImageLoaded = !!loadedImages[currentImageIdx];

  const registrarCompra = () => {
    RegistrarFeedbackRecomendacion({
      idItem: producto.idProducto,
      categoriaItem: "producto",
      tipo: "purchase",
    });
  };

  return (
    <a href={`${urlWhatsapp}?text=${encodeURIComponent(`Vi en YUCA este ${producto.nombreProducto}`)}`} target="_blank" rel="noopener noreferrer" onClick={registrarCompra}>
      <div className="w-full rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 mb-6 cursor-pointer active:scale-95 transition-transform hover:shadow-lg group relative aspect-[4/3] sm:h-72 bg-slate-100">

        {/* ✅ Skeleton visible mientras la imagen activa no ha cargado */}
        <div
          className={`absolute inset-0 bg-slate-200 transition-opacity duration-500 z-0 ${
            (priority && currentImageIdx === 0) || isActiveImageLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {carouselImages.map((img, idx) => {
          const isActive = idx === currentImageIdx;
          const isLoaded = !!loadedImages[idx];
          const isLcp = priority && idx === 0;

          return (
            <div>
            <h1>Comprar</h1>
            <img
              key={idx}
              ref={(el) => { imgRefs.current[idx] = el; }}
              src={img}
              loading={isLcp ? "eager" : "lazy"}
              fetchPriority={isLcp ? "high" : "auto"}
              decoding="async"
              onLoad={() => markLoaded(idx)}
              onError={() => markLoaded(idx)}
              alt={`${producto.nombreProducto} - Imagen ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                isLcp
                  ? isActive ? 'opacity-100 scale-105 blur-0 z-10' : 'opacity-0 scale-105 blur-sm z-10'
                  : isActive && isLoaded
                  ? 'opacity-100 scale-105 blur-0 z-10'
                  : isActive
                  ? 'opacity-0 scale-105 blur-sm z-10'
                  : 'opacity-0 scale-100 blur-0 z-0'
              }`}
              
            />
            </div>
          );
        })}

        {/* Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 pointer-events-none z-10" />

        {/* Indicadores del carrusel */}
        {carouselImages.length > 1 && (
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 z-20">
            {carouselImages.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentImageIdx ? 'w-5 bg-white shadow-md' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* Pie de tarjeta */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20 flex items-center justify-between gap-3">
          <div className="pb-0.5 overflow-hidden text-right ml-auto">
            <h3 className="text-white font-bold text-lg tracking-tight leading-tight truncate drop-shadow-md">
              {producto.nombreProducto}
            </h3>
            {producto.precioProducto > 0 && (
              <p className="text-white/80 text-sm font-medium drop-shadow-md">
                ${producto.precioProducto}
              </p>
            )}
          </div>
        </div>

      </div>
    </a>
  );
}