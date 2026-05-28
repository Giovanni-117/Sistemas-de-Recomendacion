import type { DatosNegocioPublicoResponse } from "../../lib/api/tiposApi/perfilNegocio";

interface EncabezadoNegocioProps {
  negocioData: DatosNegocioPublicoResponse;
}

export default function EncabezadoNegocio({ negocioData }: EncabezadoNegocioProps) {
  return (
    <header className="relative w-full bg-gradient-to-b from-slate-50 to-white border-b border-slate-200/60 shadow-sm z-40 overflow-hidden">
      {/* Elementos decorativos de fondo (opcional, para dar más vida) */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-slate-200/50 via-slate-100/30 to-transparent -z-10"></div>
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-8 sm:pt-10 sm:pb-12">
        {/* Superior: Botón de Regreso y Redes Sociales */}
        <div className="flex items-start justify-between mb-4 sm:mb-8">
          <a
            href="/explorar"
            className="group flex w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-95"
            aria-label="Volver"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </a>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            {negocioData.redesSociales?.urlInstagram && (
              <a
                href={negocioData.redesSociales.urlInstagram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 shadow-sm hover:text-white hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:border-transparent hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            )}
            {negocioData.redesSociales?.urlFacebook && (
              <a
                href={negocioData.redesSociales.urlFacebook}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 shadow-sm hover:text-white hover:bg-[#1877F2] hover:border-transparent hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            )}
            {negocioData.redesSociales?.urlWhatsapp && (
              <a
                href={negocioData.redesSociales.urlWhatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 shadow-sm hover:text-white hover:bg-[#25D366] hover:border-transparent hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-1 transition-all duration-300"
                aria-label="WhatsApp"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Centro: Foto de Perfil Grande, Nombre y Descripción */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="relative group cursor-pointer">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full sm:rounded-[2.5rem] overflow-hidden border-4 border-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-slate-100 transform transition-transform duration-500 group-hover:scale-105 group-hover:shadow-[0_15px_40px_rgb(0,0,0,0.12)]">
              <img
                
                src={negocioData.urlFotoDePerfil || "https://images.unsplash.com/photo-1559925393-8be0a5ae7efa?auto=format&fit=crop&w=300&q=80"}
                alt={negocioData.nombreNegocio}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h1 className="mt-6 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {negocioData.nombreNegocio}
          </h1>
          
          {negocioData.descripcionNegocio && (
            <p className="mt-4 text-base sm:text-lg text-slate-500 max-w-xl font-medium leading-relaxed px-2">
              {negocioData.descripcionNegocio}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
