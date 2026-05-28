import { useEffect, useState } from 'react';
import { Home, Ticket, Trophy, Compass } from 'lucide-react';

export default function Navbar() {
  const [pathname, setPathname] = useState('/inicio');

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  const navItems = [
    { name: 'GANAR', icon: Trophy, path: '/ganar' },
    { name: 'EXPLORAR', icon: Compass, path: '/explorar' },
    { name: 'INICIO', icon: Home, path: '/inicio', isCenter: true },
    { name: 'CUPONES', icon: Ticket, path: '/cupones' },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[22rem] px-3 z-50 pointer-events-none">
      <div className="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[1.75rem] flex justify-between items-center px-5 py-2 relative pointer-events-auto">
        {/* Decorative inner glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-[2rem] pointer-events-none" />

        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path === '/inicio' && pathname === '/');
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <a
                key={item.name}
                href={item.path}
                className="relative group flex flex-col items-center justify-center -mt-6"
              >
                {/* Pulsing ring behind the central button */}
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60 animate-[pulse_3s_ease-in-out_infinite]" />

                <div className={`relative flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg shadow-primary/30 transition-transform duration-300 active:scale-95 border-[3px] border-white backdrop-blur-sm ${isActive ? 'bg-gradient-to-br from-primary to-teal-400' : 'bg-slate-700'}`}>
                  <Icon className={`w-5 h-5 drop-shadow-md stroke-[2.5] transition-transform duration-300 ${isActive ? 'scale-100 group-hover:scale-110' : 'scale-90 group-hover:scale-100'}`} />
                </div>
                <span className={`text-[9px] font-black tracking-widest mt-1.5 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary/70'}`}>
                  {item.name}
                </span>
              </a>
            );
          }

          return (
            <a
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center justify-center w-16 transition-all duration-300 active:scale-90 group ${isActive ? 'text-primary' : 'text-slate-400 hover:text-primary/80'}`}
            >
              <div className="relative mb-1">
                {isActive && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                )}
                <Icon className={`w-[22px] h-[22px] stroke-[2.5] transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:-translate-y-1'}`} />
              </div>
              <span className={`text-[9px] font-bold tracking-wider transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0 text-primary' : 'opacity-80 group-hover:opacity-100 group-hover:-translate-y-0.5'}`}>
                {item.name}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
