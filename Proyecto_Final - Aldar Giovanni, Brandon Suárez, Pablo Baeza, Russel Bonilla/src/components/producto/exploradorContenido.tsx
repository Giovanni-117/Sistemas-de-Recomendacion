import { useCallback, useEffect, useRef, useState } from "react";
import ProductoElemento from "@/components/producto/productoElemento";
import type {
  ProductoPaginado,
  ProductosPaginadosResponse,
NegocioAleatorioResponse
} from "@/lib/api/tiposApi/explorar";
import { postApi } from "@/components/manipularAPI";

export default function ExploradorContenido() {
  const [searchTerm, setSearchTerm] = useState("");
  const [feedProducts, setFeedProducts] = useState<ProductoPaginado[]>([]);
  const [searchResults, setSearchResults] = useState<ProductoPaginado[]>([]);

  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isSorprendemeLoading, setIsSorprendemeLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const [headerOffset, setHeaderOffset] = useState(96); // Valor por defecto estimado

  useEffect(() => {
    const mainHeader = document.querySelector("header");
    if (mainHeader) {
      setHeaderOffset(mainHeader.getBoundingClientRect().height);
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setHeaderOffset(entry.target.getBoundingClientRect().height);
        }
      });
      observer.observe(mainHeader);
      return () => observer.disconnect();
    }
  }, []);

  // Carga inicial del Feed
  const fetchFeed = useCallback(
    async (cursorToUse: string | null = null, isLoadMore = false) => {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoadingFeed(true);
      }

      try {
        const url = cursorToUse
          ? `/cliente/explorar/obtenerProductosNegociosConRecomendacion?cursor=${encodeURIComponent(cursorToUse)}&limit=1`
          : `/cliente/explorar/obtenerProductosNegociosConRecomendacion?limit=1`;

        const result = await postApi<ProductosPaginadosResponse>(url, {
          method: "GET",
        });
        if (result.success && result.data) {
          const newData = result.data.data || [];
          const nextCursor = result.data.nextCursor || null;

          // Si es una carga inicial, reemplazamos. Si es cargar más, concatenamos asegurando no duplicar (por si acaso).
          setFeedProducts((prev) => {
            if (!isLoadMore) return newData;
            const existingIds = new Set(prev.map((p) => p.id));
            const toAdd = newData.filter((p: ProductoPaginado) => !existingIds.has(p.id));
            return [...prev, ...toAdd];
          });

          setCursor(nextCursor);
          setHasMore(!!nextCursor);
        }
      } catch (e) {
        console.error("Error al obtener feed de productos:", e);
      } finally {
        setIsLoadingFeed(false);
        setIsLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Búsqueda con debouncing (800ms)
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setIsSearchingApi(false);
      return;
    }

    setIsSearchingApi(true);
    const delayDebounceFn = setTimeout(() => {
      performSearch(searchTerm);
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    if (
      searchTerm.trim() !== "" ||
      !hasMore ||
      isLoadingMore ||
      isLoadingFeed
    ) {
      return;
    }

    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (
          searchTerm.trim() === "" &&
          hasMore &&
          !isLoadingMore &&
          !isLoadingFeed
        ) {
          fetchFeed(cursor, true);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [cursor, fetchFeed, hasMore, isLoadingFeed, isLoadingMore, searchTerm]);

  const performSearch = async (query: string) => {
    try {
      const result = await postApi<ProductoPaginado[]>(
        `/cliente/explorar/buscadorProducto?q=${encodeURIComponent(query)}`,
        { method: "GET" },
      );
      if (result.success) {
        setSearchResults(result.data || []);
      }
    } catch (e) {
      console.error("Error al buscar productos:", e);
    } finally {
      setIsSearchingApi(false);
    }
  };

  const handleSorprendeme = async () => {
    setIsSorprendemeLoading(true);
    try {
      const result = await postApi<NegocioAleatorioResponse>(
        "/cliente/explorar/obtenerNegocioAleatorio",
        { method: "GET" },
      );
      if (result.success && result.data?.idNegocio) {
        window.location.href = `/negocio/${result.data.idNegocio}`;
        return;
      }
    } catch (e) {
      console.error("Error al obtener negocio aleatorio:", e);
    }
    setIsSorprendemeLoading(false);
  };

  const currentProducts = searchTerm.trim() ? searchResults : feedProducts;
  const isGlobalLoading =
    isLoadingFeed ||
    (searchTerm.trim() !== "" && isSearchingApi && searchResults.length === 0);

  return (
    <>
      <style>{`
        @keyframes elegantFadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-elegant-entrance {
  opacity: 0;
  animation: elegantFadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-elegant-entrance:nth-child(1) { animation-delay: 0s; }
.animate-elegant-entrance:nth-child(2) { animation-delay: 0.2s; }
.animate-elegant-entrance:nth-child(3) { animation-delay: 0.4s; }
.animate-elegant-entrance:nth-child(4) { animation-delay: 0.6s; }
.animate-elegant-entrance:nth-child(5) { animation-delay: 0.8s; }
.animate-elegant-entrance:nth-child(6) { animation-delay: 1.0s; }
      `}</style>

      {/* Header & Search Bar */}
      <header
        className="pt-4 pb-6 px-6 bg-white/95 backdrop-blur-md sticky z-30 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border-b border-slate-100 transition-all duration-300"
        style={{ top: headerOffset }}
      >
        <div className="flex items-center gap-3">
          {/* Barra de Búsqueda */}
          <div className="flex-1 flex items-center bg-slate-50 rounded-2xl px-4 py-3.5 border-2 border-slate-100 focus-within:border-primary focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(var(--color-primary),0.1)] transition-all">
            <svg
              className="w-6 h-6 text-slate-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Buscar ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full ml-3 text-slate-700 placeholder:text-slate-400 font-bold text-lg"
            />
            {isSearchingApi && (
              <svg
                className="animate-spin h-5 w-5 text-primary ml-2 flex-shrink-0"
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
            )}
            {searchTerm && !isSearchingApi && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Botón Sorpréndeme */}
          <button
            onClick={handleSorprendeme}
            disabled={isSorprendemeLoading}
            className="bg-primary text-white p-4 rounded-2xl shadow-[0_8px_20px_rgba(var(--color-primary),0.3)] active:scale-90 disabled:opacity-50 disabled:pointer-events-none transition-all flex-shrink-0 group flex flex-col items-center justify-center"
            title="Sorpréndeme con un negocio"
          >
            {isSorprendemeLoading ? (
              <svg
                className="animate-spin h-6 w-6 text-white"
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
            ) : (
              <svg
                className="w-6 h-6 group-hover:scale-110 group-active:scale-90 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Listado de Productos */}
      <main className="w-full max-w-lg mx-auto flex flex-col p-4 sm:p-6 pb-40 mt-2">
        {isGlobalLoading ? (
          <>
            <ProductoElemento loading />
            <ProductoElemento loading />
          </>
        ) : currentProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">
              Sin Resultados
            </h3>
            <p className="text-slate-500 font-medium max-w-xs">
              No pudimos encontrar productos o negocios que coincidan con tu
              búsqueda.
            </p>
          </div>
        ) : (
          <>
            {currentProducts.map((producto, idx) => (
              <div
                key={producto.id}
                className="animate-elegant-entrance"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <ProductoElemento producto={producto} priority={idx === 0} />
              </div>
            ))}

            {/* Cargar Más (solo si no estamos buscando) */}
            {!searchTerm.trim() && hasMore && (
              <div
                ref={loadMoreRef}
                className="mt-4 w-full py-6 flex items-center justify-center"
              >
                {isLoadingMore && (
                  <div className="flex items-center gap-2 text-slate-600 font-bold">
                    <svg
                      className="animate-spin h-5 w-5 text-slate-600"
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
                    <span>Cargando...</span>
                  </div>
                )}
              </div>
            )}
            {!searchTerm.trim() &&
              !hasMore &&
              !isLoadingFeed &&
              !isLoadingMore &&
              currentProducts.length > 0 && (
                <div className="mt-6 w-full py-6 flex items-center justify-center">
                  <p className="text-slate-500 font-bold text-center">
                    Ya viste mucho, es hora de comprar
                  </p>
                </div>
              )}
          </>
        )}
      </main>
    </>
  );
}
