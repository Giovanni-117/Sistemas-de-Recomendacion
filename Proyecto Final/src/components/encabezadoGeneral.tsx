export default function EncabezadoGeneral() {
  return (
    <>
      <header className="pt-8 pb-4 px-6 flex justify-between items-center sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b-2 border-primary/10 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden">
        {/* Patrón de Bordado Yucateco Sutil (Henequén y Flores) */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none select-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5L35 15L45 20L35 25L30 35L25 25L15 20L25 15Z' fill='%232D5A27' /%3E%3C/svg%3E")`,
            backgroundSize: "30px 30px",
          }}
        ></div>

        <div className="flex flex-col relative z-10">
          <div className="flex items-center gap-3 group cursor-pointer">
            {/* SVG Realista de Sillas Confidentes (Tú y Yo) */}
            <div className="w-12 h-12 text-primary drop-shadow-sm transition-transform group-hover:rotate-12 duration-500">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M25 45C25 35 35 30 45 30C55 30 60 40 60 50C60 60 55 70 45 70C35 70 25 65 25 55"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M75 55C75 65 65 70 55 70C45 70 40 60 40 50C40 40 45 30 55 30C65 30 75 35 75 45"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M30 80H70"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="4"
                  fill="#E4007C"
                  className="animate-pulse"
                />{" "}
                {/* Acento Rosa Mexicano */}
              </svg>
            </div>

            <div className="flex flex-col">
              <h1 className="font-black text-3xl tracking-[-0.05em] text-slate-900 flex items-center leading-none">
                YUCA
                <span className="text-primary ml-0.5 italic">!</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full bg-red-100 border-y border-red-300 py-1 text-center">
        <p className="text-red-700 font-bold tracking-wide">
          En pruebas: Todavía no disponible para el publico general.
        </p>
      </div>
    </>
  );
}
