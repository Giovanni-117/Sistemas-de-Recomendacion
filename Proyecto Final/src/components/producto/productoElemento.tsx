import { useState, useEffect, useRef } from "react";
import ProductoModalNegocio from "@/components/producto/productoModal";
import type { ProductoPaginado } from "@/lib/api/tiposApi/explorar";

export function SkeletonProducto() {
  return (
    <div className="w-full rounded-[2rem] bg-slate-200 animate-pulse mb-6 aspect-[4/3] sm:h-72" />
  );
}

export default function ProductoElementoNegocio({
  producto,
  loading = false,
  priority = false,
}: {
  producto?: ProductoPaginado;
  loading?: boolean;
  priority?: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const carouselImages = producto?.imagenesProducto.slice(0, 3) ?? [];

  // ✅ Precarga todas las imágenes con el objeto Image nativo
  useEffect(() => {
    if (!carouselImages.length) return;

    setLoadedImages({});
    setCurrentImageIdx(0);

    carouselImages.forEach((src, idx) => {
      if (!src) {
        setLoadedImages((prev) => ({ ...prev, [idx]: true }));
        return;
      }
      const img = new Image();
      img.src = src;
      img.onload = () => setLoadedImages((prev) => ({ ...prev, [idx]: true }));
      img.onerror = () => setLoadedImages((prev) => ({ ...prev, [idx]: true }));
    });
  }, [producto?.id]);

  // ✅ El carrusel solo avanza si la siguiente imagen ya cargó
  useEffect(() => {
    if (carouselImages.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentImageIdx((prev) => {
        const next = (prev + 1) % carouselImages.length;
        // Si la siguiente imagen no cargó aún, espera el próximo tick
        if (!loadedImages[next]) return prev;
        return next;
      });
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [carouselImages.length, loadedImages]);

  if (loading || !producto) {
    return <SkeletonProducto />;
  }

  const isActiveImageLoaded = !!loadedImages[currentImageIdx];

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="w-full rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 mb-6 cursor-pointer active:scale-95 transition-transform hover:shadow-lg group relative aspect-[4/3] sm:h-72 bg-slate-100"
      >
        {/* Skeleton mientras carga la imagen activa */}
        <div
          className={`absolute inset-0 bg-slate-200 transition-opacity duration-500 ${
            (priority && currentImageIdx === 0) || isActiveImageLoaded ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* ✅ Todas las imágenes en el DOM, el navegador las carga en paralelo */}
        {carouselImages.map((img, idx) => {
          const isActive = idx === currentImageIdx;
          const isLoaded = !!loadedImages[idx];
          const isLcp = priority && idx === 0;

          return (
            <img
              key={`${producto.id}-${idx}`}
              src={img || undefined}
              loading={isLcp ? "eager" : "lazy"} 
              fetchPriority={isLcp ? "high" : "auto"}
              decoding="async"
              onLoad={() => setLoadedImages((prev) => ({ ...prev, [idx]: true }))}
              onError={() => setLoadedImages((prev) => ({ ...prev, [idx]: true }))}
              alt={`${producto.nombreProducto} - Imagen ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                isLcp
                  ? isActive ? "opacity-100 scale-105 blur-0 z-10" : "opacity-0 scale-105 blur-sm z-10"
                  : isActive && isLoaded
                    ? "opacity-100 scale-105 blur-0 z-10"
                    : isActive
                      ? "opacity-0 scale-105 blur-sm z-10"
                      : "opacity-0 scale-100 blur-0 z-0"
              }`}
            />
          );
        })}

        {/* Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 pointer-events-none z-10" />

        {/* Indicadores */}
        {carouselImages.length > 1 && (
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 z-20">
            {carouselImages.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentImageIdx
                    ? "w-5 bg-white shadow-md"
                    : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}

        {/* Pie de tarjeta */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20 flex items-center justify-between gap-3">
          <div className="w-12 h-12 bg-white rounded-full p-0.5 shadow-md flex-shrink-0">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-50">
              <img
                src={producto.imagenNegocio || undefined}
                alt={producto.nombreNegocio}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="pb-0.5 overflow-hidden text-right ml-auto">
            <h3 className="text-white font-bold text-lg tracking-tight leading-tight truncate drop-shadow-md">
              {producto.nombreProducto}
            </h3>
            <p className="text-white/80 text-sm truncate font-medium drop-shadow-md">
              {producto.nombreNegocio}
            </p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ProductoModalNegocio
          producto={producto}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
