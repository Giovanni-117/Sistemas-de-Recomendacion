import type { ProductoPublicoItem } from "../../lib/api/tiposApi/productos";
import ProductoElementoReducido from "./productoElementoReducido";

interface CatalogoNegocioProps {
  productos: ProductoPublicoItem[];
  urlWhatsapp: string;
}

export default function CatalogoNegocio({
  productos,
  urlWhatsapp,
}: CatalogoNegocioProps) {
  return (
    <main className="w-full max-w-lg mx-auto flex flex-col p-4 sm:p-6 pb-32 mt-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          Catálogo
        </h2>
        <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full text-sm">
          {productos.length} productos
        </span>
      </div>

      {productos.length > 0 ? (
        productos.map((producto: ProductoPublicoItem, idx: number) => (
          <ProductoElementoReducido
            key={producto.idProducto}
            producto={producto}
            urlWhatsapp={urlWhatsapp}
            priority={idx === 0}
          />
        ))
      ) : (
        <div className="bg-slate-50 rounded-[2rem] p-8 text-center border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg
              className="w-8 h-8 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            Sin productos
          </h3>
          <p className="text-slate-500 text-sm">
            Este negocio aún no ha publicado productos.
          </p>
        </div>
      )}
    </main>
  );
}
