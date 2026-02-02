import React from 'react';
import { useAutoPrime } from '../context/AutoPrimeContext';
import { AlertTriangle, Users, Car, Wrench, DollarSign, Activity, ArrowRight } from 'lucide-react';

export const Dashboard = () => {
  const { metrics, alerts, currentView, setCurrentView } = useAutoPrime();

  const StatCard = ({ title, value, icon: Icon, color, subtext, onClick, actionText }: any) => (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex flex-col justify-between gap-4 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1 group' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-full ${color} text-white shadow-md`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
      </div>
      
      {actionText && (
        <div className="border-t border-slate-50 pt-3 mt-1">
          <span className="text-sm font-semibold text-slate-600 group-hover:text-brand-600 flex items-center gap-2 transition-colors">
            {actionText} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Visão Geral</h1>
          <p className="text-slate-500">Métricas em tempo real da oficina.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600">
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
          actionText="Histórico de serviços"
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
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" />
            Alertas de Manutenção & Estoque
          </h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {alerts.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p className="text-slate-400">Nenhum alerta crítico. Tudo em ordem!</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-lg border-l-4 shadow-sm flex justify-between items-center transition-all hover:bg-opacity-80 ${
                  alert.severity === 'critical' 
                    ? 'bg-red-50 border-red-500 text-red-700' 
                    : alert.severity === 'warning'
                      ? 'bg-amber-50 border-amber-500 text-amber-700'
                      : 'bg-blue-50 border-blue-500 text-blue-700'
                }`}>
                  <div className="flex-1">
                    <span className="font-bold text-xs uppercase tracking-wider block mb-1 opacity-70">
                      {alert.type} • {alert.severity}
                    </span>
                    <p className="font-semibold text-sm md:text-base">{alert.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Serviços */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="text-indigo-500" />
            Serviços Populares
          </h2>
          <div className="space-y-4">
            {metrics.topServicos.length === 0 ? (
               <p className="text-slate-400 text-center py-4">Sem dados suficientes.</p>
            ) : (
              metrics.topServicos.map((serv, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-700">{serv.nome}</span>
                  <span className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full text-xs font-bold">
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