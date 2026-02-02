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
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-white tracking-tight">AutoPrime<span className="text-brand-500">.Pro</span></h1>
          <p className="text-xs text-slate-500 mt-1">Gestão de Oficina</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {item.id === 'dashboard' && criticalAlerts > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {criticalAlerts}
                    </span>
                )}
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 p-2 bg-slate-800 rounded-lg">
                <div className="bg-slate-700 p-2 rounded-full">
                    <Users size={16} />
                </div>
                <div>
                    <p className="text-sm text-white font-medium">Admin</p>
                    <p className="text-xs text-slate-500">Local Mode</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Mobile Header (visible only on small screens) */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white p-4 z-40 flex justify-between items-center">
          <span className="font-bold">AutoPrime</span>
          <div className="flex gap-4 overflow-x-auto">
             {menuItems.map(item => (
                 <button 
                    key={item.id} 
                    onClick={() => setCurrentView(item.id)}
                    className={`${currentView === item.id ? 'text-brand-400' : 'text-slate-400'}`}
                 >
                     <item.icon size={24} />
                 </button>
             ))}
          </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 mt-14 md:mt-0 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto animate-fade-in">
           {children}
        </div>
      </main>
    </div>
  );
};