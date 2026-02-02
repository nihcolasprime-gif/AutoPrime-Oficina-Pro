import React from 'react';
import { useAutoPrime } from '../context/AutoPrimeContext';
import { AlertTriangle, Users, Car, Wrench, Package, Info } from 'lucide-react';

export const Dashboard = () => {
  const { clients, vehicles, serviceOrders, inventory, alerts } = useAutoPrime();

  const totalRevenue = serviceOrders.reduce((acc, os) => acc + os.valorTotal, 0);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`p-3 rounded-full ${color} text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Painel de Controle</h1>
        <p className="text-slate-500">Visão geral da oficina AutoPrime.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Clientes" value={clients.length} icon={Users} color="bg-blue-500" />
        <StatCard title="Veículos" value={vehicles.length} icon={Car} color="bg-green-500" />
        <StatCard title="Ordens de Serviço" value={serviceOrders.length} icon={Wrench} color="bg-purple-500" />
        <StatCard title="Itens em Estoque" value={inventory.length} icon={Package} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alerts Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" />
            Alertas do Sistema
          </h2>
          
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>Nenhum alerta no momento. Tudo operando normalmente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-md border-l-4 flex justify-between items-start ${
                  alert.severity === 'critical' 
                    ? 'bg-red-50 border-red-500 text-red-700' 
                    : 'bg-amber-50 border-amber-500 text-amber-700'
                }`}>
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider block mb-1">
                      {alert.type}
                    </span>
                    <p className="font-medium">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financial / Quick Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Info className="text-blue-500" />
            Resumo Financeiro
          </h2>
          <div className="p-6 bg-slate-50 rounded-lg text-center">
             <p className="text-slate-500 mb-2">Faturamento Total (OS)</p>
             <p className="text-4xl font-bold text-brand-600">
               {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
             </p>
          </div>
          <div className="mt-4">
             <p className="text-sm text-slate-500">
               * O valor total reflete a soma de todas as Ordens de Serviço concluídas ou abertas.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};