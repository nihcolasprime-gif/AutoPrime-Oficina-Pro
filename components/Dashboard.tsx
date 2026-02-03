import React from 'react';
import { useAutoPrime } from '../context/AutoPrimeContext';
import { AlertTriangle, Users, Car, Wrench, DollarSign, Activity, ArrowRight, User, Phone } from 'lucide-react';

export const Dashboard = () => {
  const { metrics, alerts, currentView, setCurrentView } = useAutoPrime();

  const StatCard = ({ title, value, icon: Icon, color, subtext, onClick, actionText }: any) => (
    <div className="perspective-1000 h-full">
      <div 
        onClick={onClick}
        className={`
          glass-panel h-full p-6 rounded-2xl flex flex-col justify-between gap-4 
          transition-all duration-500 transform-style-3d 
          ${onClick ? 'cursor-pointer glass-card-hover' : ''}
          bg-gradient-to-br from-white/80 to-white/40
        `}
      >
        <div className="flex items-center gap-4 transform translate-z-10">
          <div className={`p-4 rounded-2xl ${color} text-white shadow-lg shadow-${color.replace('bg-', '')}/30`}>
            <Icon size={24} className="drop-shadow-md" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-black text-slate-800 tracking-tight drop-shadow-sm">{value}</p>
            {subtext && <p className="text-xs text-slate-500 mt-1 font-medium">{subtext}</p>}
          </div>
        </div>
        
        {actionText && (
          <div className="border-t border-slate-200/50 pt-3 mt-1 transform translate-z-10">
            <span className="text-sm font-bold text-slate-600 group-hover:text-brand-600 flex items-center gap-2 transition-colors">
              {actionText} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center relative z-10">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-prime-blue to-prime-light mb-2 drop-shadow-sm">
            Visão Geral
          </h1>
          <p className="text-slate-500 font-medium">Métricas em tempo real da oficina.</p>
        </div>
        <div className="glass-panel px-6 py-2 rounded-xl text-sm text-prime-blue font-bold shadow-sm">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturamento Mês" 
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.faturamentoMes)} 
          icon={DollarSign} 
          color="bg-emerald-500" 
          subtext={`Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(metrics.faturamentoTotal)}`}
          onClick={() => setCurrentView('os')}
          actionText="Ver financeiro"
        />
        <StatCard 
          title="OS Concluídas" 
          value={metrics.osConcluidas} 
          icon={Wrench} 
          color="bg-blue-500" 
          subtext={`Ticket Médio: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.ticketMedio)}`}
          onClick={() => setCurrentView('os')}
          actionText="Histórico"
        />
        <StatCard 
          title="Serviços Abertos" 
          value={metrics.osAbertas} 
          icon={Activity} 
          color="bg-orange-500" 
          onClick={() => setCurrentView('os')}
          actionText="Gerenciar agora"
        />
        <StatCard 
          title="Alertas Ativos" 
          value={alerts.length} 
          icon={AlertTriangle} 
          color={alerts.length > 0 ? "bg-red-500" : "bg-slate-400"} 
          onClick={() => setCurrentView('settings')}
          actionText="Ajustar regras"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alertas */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl shadow-xl bg-white/60">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
               <AlertTriangle size={20} />
            </div>
            Alertas de Manutenção & Estoque
          </h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-400 font-medium">Nenhum alerta crítico. Tudo em ordem!</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-xl border-l-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center transition-all hover:scale-[1.01] hover:shadow-md backdrop-blur-sm ${
                  alert.severity === 'critical' 
                    ? 'bg-red-50/80 border-red-500 text-red-800' 
                    : alert.severity === 'warning'
                      ? 'bg-amber-50/80 border-amber-500 text-amber-800'
                      : 'bg-blue-50/80 border-blue-500 text-blue-800'
                }`}>
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start mb-1">
                         <span className="font-bold text-xs uppercase tracking-wider opacity-70 flex items-center gap-1">
                            {alert.type === 'MANUTENCAO' && <User size={12} />}
                            {alert.type === 'MANUTENCAO' && alert.clientName ? alert.clientName : alert.type} • {alert.severity}
                        </span>
                        {alert.clientPhone && (
                             <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                                <Phone size={10} /> {alert.clientPhone}
                             </span>
                        )}
                    </div>
                    
                    <p className="font-semibold text-sm md:text-base">{alert.message}</p>
                    
                    {alert.clientName && alert.type === 'MANUTENCAO' && (
                        <div className="mt-2 pt-2 border-t border-black/5 text-xs flex gap-3 text-black/60">
                             <span className="font-bold text-black/80">Ligar para cliente</span>
                             <span>•</span>
                             <span>Agendar Manutenção</span>
                        </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Serviços */}
        <div className="glass-panel p-6 rounded-2xl shadow-xl bg-white/60">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <Activity size={20} />
            </div>
            Serviços Populares
          </h2>
          <div className="space-y-4">
            {metrics.topServicos.length === 0 ? (
               <p className="text-slate-400 text-center py-4">Sem dados suficientes.</p>
            ) : (
              metrics.topServicos.map((serv, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-shadow">
                  <span className="font-medium text-slate-700">{serv.nome}</span>
                  <span className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-1 px-3 rounded-full text-xs font-bold shadow-md">
                    {serv.qtd}x
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};