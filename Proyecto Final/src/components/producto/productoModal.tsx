import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ProductoPaginado } from "@/lib/api/tiposApi/explorar";
import FadeImage from "@/components/fadeImage";
import { RegistrarFeedbackRecomendacion } from "@/components/registrarFeedBack";

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default function ProductoModalNegocio({
  producto,
  onClose,
}: {
  producto: ProductoPaginado;
  onClose: () => void;
}) {
  // Prevent scrolling on the body when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const registrarCompra = () => {
    RegistrarFeedbackRecomendacion({
      idItem: producto.id,
      categoriaItem: "producto",
      tipo: "purchase",
    });
  };

  // Carousel logic for the modal
  const carouselImages = producto.imagenesProducto.slice(0, 3);

  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    if (carouselImages.length <= 1) return;
    const timer = setTimeout(() => {
      setCurrentImageIdx((prev) => (prev + 1) % carouselImages.length);
    }, 6000); // 6 seconds per image
    return () => clearTimeout(timer);
  }, [carouselImages.length, currentImageIdx]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 overflow-y-auto animate-[slideInUp_0.3s_ease-out] h-[100dvh]">
      {/* Full-Bleed Carousel Section */}
      <div className="relative w-full h-[80dvh] sm:h-[85dvh] flex-shrink-0 bg-black rounded-b-[2.5rem] sm:rounded-b-[3.5rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
        {/* Carousel Background Images */}
        {carouselImages.map((img, idx) => {
          return (
            <div
              key={idx}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${idx === currentImageIdx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
            >
              <FadeImage
                src={img}
                alt={`Carousel image ${idx}`}
                className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-linear ${idx === currentImageIdx ? "scale-105" : "scale-100"}`}
              />

              {/* Overlays (Text at Top, Price/Button at Bottom) */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 flex flex-col justify-between px-6 pt-16 pb-10">
                {/* Texto arriba de la imagen */}
                <div className="animate-[slideInUp_0.5s_ease-out]">
                  <h3 className="text-white font-black text-4xl sm:text-5xl drop-shadow-xl tracking-tight leading-none mb-3">
                    {producto.nombreProducto}
                  </h3>
                </div>

                {/* Precio y Botón dentro de la imagen */}
                <div className="flex items-end justify-between mt-auto">
                  {/* Etiqueta de Precio (Clothing Tag Style) */}
                  {producto.precio && (
                    <div className="relative bg-[#fdfaf3] border-2 border-dashed border-[#dcd1b3] px-5 py-2.5 rounded-sm transform -rotate-3 shadow-2xl flex flex-col items-center justify-center">
                      {/* Agujero de la etiqueta */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black/60 rounded-full border border-[#dcd1b3] shadow-inner backdrop-blur-md"></div>
                      {/* Hilo imaginario */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-6 border-l-2 border-dotted border-white/60 drop-shadow-md"></div>

                      <span className="text-[#a59468] font-black text-[10px] uppercase tracking-widest leading-none mt-1">
                        Precio
                      </span>
                      <div className="text-slate-800 font-black text-2xl leading-none tracking-tighter mt-1">
                        ${producto.precio}
                      </div>
                    </div>
                  )}

                  {/* Botón Comprar */}
                  <a
                    href={
                      producto.socials.whatsapp
                        ? `${producto.socials.whatsapp}?text=${encodeURIComponent(`Vi en YUCA este ${producto.nombreProducto}`)}`
                        : "#"
                    }
                    target="_blank"
                    rel="noreferrer"
                    onClick={registrarCompra}
                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-4 px-6 sm:px-8 rounded-full shadow-[0_8px_25px_rgba(37,211,102,0.4)] transition-transform active:scale-95 flex items-center gap-2 text-xl ml-auto"
                  >
                    Comprar
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-colors z-50 shadow-lg"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>

        {/* Navigation Arrows */}
        {carouselImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIdx(
                  (prev) =>
                    (prev - 1 + carouselImages.length) % carouselImages.length,
                );
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/20 hover:bg-black/50 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-colors z-50"
            >
              <ChevronLeftIcon className="w-8 h-8 -ml-1" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIdx(
                  (prev) => (prev + 1) % carouselImages.length,
                );
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/20 hover:bg-black/50 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-colors z-50"
            >
              <ChevronRightIcon className="w-8 h-8 ml-1" />
            </button>
          </>
        )}

        {/* Carousel Indicators */}
        {carouselImages.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-50">
            {carouselImages.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIdx ? "w-8 bg-white shadow-md" : "w-2 bg-white/40"}`}
              ></div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Section (Business Info & Description) */}
      <div className="flex-1 px-6 pt-8 pb-12 max-w-lg w-full mx-auto relative z-20 flex flex-col gap-6">
        {/* Tarjeta Unificada: Info del Negocio + Descripción */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-6 relative">
          {/* Descripción */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {producto.descripcion}
          </p>
          {/* Info del Negocio */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full p-1 shadow-md flex-shrink-0 border border-slate-100">
              <FadeImage
                src={producto.imagenNegocio}
                alt={producto.nombreNegocio}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none truncate">
                {producto.nombreNegocio}
              </h2>
            </div>
          </div>
        </div>

        {/* Botón para ver más productos */}
        <div className="mt-auto">
          <a
            href={`/negocio/${producto.idNegocio}`}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-6 rounded-[1.25rem] transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Ver todos los productos del negocio</span>
            <ChevronRightIcon className="w-5 h-5" />
          </a>
        </div>
      </div>

      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>,
    document.body,
  );
}
