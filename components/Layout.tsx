import React from 'react';
import { useAutoPrime } from '../context/AutoPrimeContext';
import { LayoutDashboard, Users, Car, Package, Wrench, Settings as SettingsIcon } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentView, setCurrentView, alerts } = useAutoPrime();

  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'vehicles', label: 'Veículos', icon: Car },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'os', label: 'Ordens de Serviço', icon: Wrench },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon },
  ];

  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-slate-100">
      
      {/* Background Blobs para efeito de vidro */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-prime-blue/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-prime-light/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-prime-yellow/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Sidebar Desktop - Glassmorphism Prism */}
      <aside className="w-72 relative z-20 flex-shrink-0 hidden md:flex flex-col shadow-2xl transition-all duration-300">
        
        {/* Camada de vidro */}
        <div className="absolute inset-0 bg-gradient-to-b from-prime-blue/90 to-sky-900/90 backdrop-blur-xl border-r border-white/10"></div>

        {/* Logo Section 3D */}
        <div className="p-6 pb-8 text-center relative z-30 border-b border-white/10 bg-black/5 perspective-1000">
          <div className="flex items-center justify-center gap-1 mb-1 transform scale-110 animate-float preserve-3d">
            <span className="font-black italic text-4xl tracking-tighter text-white drop-shadow-xl" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.3)', transform: 'translateZ(20px)' }}>
              PRIME
            </span>
            <div className="relative mx-1" style={{ transform: 'translateZ(30px)' }}>
                 <Wrench className="text-prime-yellow fill-prime-yellow transform rotate-45 drop-shadow-lg" size={28} strokeWidth={2.5} />
            </div>
            <span className="font-script text-5xl text-prime-yellow drop-shadow-xl" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.3)', transform: 'translateZ(20px)' }}>
              Car
            </span>
          </div>
          <p className="text-white/80 font-bold text-lg tracking-wide mt-2 uppercase text-shadow-sm transform translate-z-10">
            Mecânica do Dênis
          </p>
          <div className="mt-3 text-xs bg-white/10 backdrop-blur-md border border-white/20 text-prime-yellow font-bold py-1 px-4 rounded-full inline-block shadow-lg">
             Oficina Profissional
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-3 mt-2 relative z-30">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-white/15 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white hover:pl-5 border border-transparent'
                }`}
              >
                {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-prime-yellow shadow-[0_0_10px_#FFD700]"></div>}
                
                <Icon size={22} className={`transition-transform duration-300 ${isActive ? 'text-prime-yellow scale-110' : 'text-white/50 group-hover:text-prime-yellow group-hover:rotate-12'}`} />
                <span className="text-base font-medium tracking-wide">{item.label}</span>
                {item.id === 'dashboard' && criticalAlerts > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse border border-white/30 shadow-lg">
                        {criticalAlerts}
                    </span>
                )}
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 relative z-30">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/5 shadow-inner">
                <div className="bg-gradient-to-br from-prime-yellow to-orange-400 p-2 rounded-xl text-prime-blue shadow-lg">
                    <Users size={18} strokeWidth={3} />
                </div>
                <div>
                    <p className="text-sm text-white font-bold">Admin</p>
                    <p className="text-xs text-white/50">Sistema Conectado</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Mobile Header - Glass */}
      <div className="md:hidden fixed top-0 w-full bg-prime-blue/90 backdrop-blur-lg text-white p-3 z-40 flex justify-between items-center shadow-lg border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="font-black italic text-xl">PRIME</span>
            <span className="font-script text-2xl text-prime-yellow">Car</span>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
             {menuItems.map(item => (
                 <button 
                    key={item.id} 
                    onClick={() => setCurrentView(item.id)}
                    className={`p-2 rounded-lg transition-all ${currentView === item.id ? 'bg-white/20 text-prime-yellow shadow-inner' : 'text-white/70'}`}
                 >
                     <item.icon size={20} />
                 </button>
             ))}
          </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0 overflow-y-auto h-screen relative z-10 scroll-smooth">
        <div className="max-w-6xl mx-auto animate-fade-in pb-10">
           {children}
        </div>
      </main>
    </div>
  );
};