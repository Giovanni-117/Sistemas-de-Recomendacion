import { useState, useEffect } from 'react';
import GachaDeCupones from '@/components/ganar/gachaDeCupones';
import { postApi } from '@/components/manipularAPI';
import type { RecompensaDiariaStatusResponse } from '@/lib/api/tiposApi/promocionalesInicio';
import ModalSolicitudInicioSesion from '@/components/modales/modalSolicitudInicioSesión';

export default function BotonReclamarCuponDelDia() {
    const [isGachaOpen, setIsGachaOpen] = useState(false);
    const [reclaimed, setReclaimed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [autenticado, setAutenticado] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const sesionResult = await postApi<{ autenticado: boolean }>(
                    '/cliente/sesionCliente/verificarSesionActiva',
                    { method: 'GET', credentials: 'include' }
                );

                if (!sesionResult.success || !sesionResult.data?.autenticado) {
                    setLoading(false);
                    return;
                }

                setAutenticado(true);

                const result = await postApi<RecompensaDiariaStatusResponse>(
                    '/cliente/ganar/recompensaDiaria/verificarSiLaRecompensaDiariaFueReclamada',
                    { method: 'GET' }
                );
                if (result.success && result.data) {
                    setReclaimed(result.data.reclamado);
                }
            } catch (e) {
                console.error('Error al verificar estado de recompensa:', e);
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, []);

    const handleClick = () => {
        if (!autenticado) {
            setModalTitle('¡Casi la tienes! ✨');
            setModalMessage(
                '¡Has atrapado el cupón del día! Para ver tu cupón de regalo sorpresa y guardarlo en tu cuenta, ingresa con tu número de celular de forma rápida y sencilla.'
            );
            setErrorModalOpen(true);
            return;
        }
        if (reclaimed) return;
        setIsGachaOpen(true);
    };

    const handleGachaClose = (wasClaimed?: boolean) => {
        setIsGachaOpen(false);
        if (wasClaimed) {
            setReclaimed(true);
        }
    };

    if (loading) {
        return (
            <div className="relative w-full flex justify-end">
                <div className="w-36 h-14 bg-slate-800/40 rounded-full animate-pulse border border-white/5 shadow-inner" />
            </div>
        );
    }

    return (
        <>
            <div className="relative w-full flex justify-end">
                <div
                    className={`relative cursor-pointer perspective-1000 ${reclaimed ? 'pointer-events-none' : 'group'}`}
                    onClick={handleClick}
                >
                    {/* Gacha Base Intense Glow */}
                    <div className={reclaimed
                        ? "absolute -inset-1 bg-emerald-500/20 rounded-full blur-lg opacity-40 pointer-events-none"
                        : "absolute -inset-2 bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-600 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition duration-700 animate-[pulse_4s_ease-in-out_infinite]"
                    } />

                    {/* Compact Pill Button Container */}
                    <div className={`relative flex items-center gap-3 rounded-full p-1.5 pr-5 border z-10 overflow-hidden ${
                        reclaimed 
                            ? "bg-slate-900/80 border-emerald-500/30 text-slate-400 cursor-not-allowed opacity-90 shadow-lg" 
                            : "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-white/10 cursor-pointer shadow-2xl transform transition-all duration-300 group-hover:scale-[1.05] group-hover:-translate-y-1 group-active:scale-95"
                    }`}>

                        {/* Shimmering Glass Overlay */}
                        {!reclaimed && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                            </>
                        )}

                        {/* Gacha Animated Icon Area */}
                        <div className={`relative w-12 h-12 rounded-full p-0.5 flex-shrink-0 ${
                            reclaimed 
                                ? "bg-gradient-to-br from-emerald-500/30 via-emerald-600/20 to-teal-900/40 border border-emerald-500/30 shadow-[inset_0_0_10px_rgba(16,185,129,0.3)]" 
                                : "bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 shadow-[inset_0_0_15px_rgba(255,255,255,0.6)]"
                        }`}>
                            <div className="absolute inset-0 rounded-full overflow-hidden">
                                {!reclaimed && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] h-[250%] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNNTAgMEw1NSAzNUg5MEw2NSA1NUw3NSA5MEw1MCA3MEwyNSA5MEwzNSA1NUwxMCAzNUg0NVoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC40KSIvPjwvc3ZnPg==')] bg-center bg-cover animate-[spin_6s_linear_infinite]" />
                                )}
                            </div>

                            <div className={`relative h-full w-full rounded-full border flex items-center justify-center backdrop-blur-sm overflow-hidden ${
                                reclaimed 
                                    ? "bg-transparent border-emerald-500/20" 
                                    : "bg-gradient-to-b from-yellow-100/40 to-transparent border-yellow-50/50"
                            }`}>
                                {reclaimed ? (
                                    <svg className="w-5 h-5 text-emerald-400 drop-shadow-[0_2px_4px_rgba(16,185,129,0.4)] animate-[pulse_2s_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <>
                                        <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full animate-ping opacity-60"></div>
                                        <svg className="w-6 h-6 text-amber-900 drop-shadow-md animate-[bounce_2s_infinite] transform transition-transform group-hover:rotate-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                        </svg>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Compact Text */}
                        <div className="flex flex-col justify-center relative z-10">
                            <span className={`font-black text-sm tracking-wider ${reclaimed ? "text-emerald-400" : "text-amber-400"}`}>
                                {reclaimed ? "RECLAMADO" : "CUPÓN"}
                            </span>
                            <span className={`font-bold text-[10px] uppercase tracking-widest ${reclaimed ? "text-emerald-500/80" : "text-white/70 group-hover:text-white transition-colors"}`}>
                                {reclaimed ? "¡Mañana más!" : "¡Gratis!"}
                            </span>
                        </div>

                        {/* Floating background sparkles */}
                        {!reclaimed && <div className="absolute -top-1 -right-1 text-yellow-300 animate-bounce opacity-70 text-sm">✨</div>}
                    </div>

                    <style>{`
                        @keyframes shimmer {
                            0% { transform: translateX(-150%) skewX(12deg); }
                            100% { transform: translateX(150%) skewX(12deg); }
                        }
                    `}</style>
                </div>
            </div>

            {/* Gacha Machine Overlay */}
            <GachaDeCupones
                isOpen={isGachaOpen}
                onClose={handleGachaClose}
                urlReclamacion="/cliente/ganar/recompensaDiaria/obtenerRecompensaDiaria"
            />

            <ModalSolicitudInicioSesion
                isOpen={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                title={modalTitle}
                message={modalMessage}
            />
        </>
    );
}
