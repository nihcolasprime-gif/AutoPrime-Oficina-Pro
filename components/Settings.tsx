import React, { useState, useMemo } from 'react';
import { useAutoPrime } from '../context/AutoPrimeContext';
import { BellRing, Calendar, Save, Car, AlertTriangle, CheckCircle, Clock, Search, ArrowRight } from 'lucide-react';

export const Settings = () => {
  const { vehicles, clients, updateVehicle } = useAutoPrime();
  
  // State for the "Create Alert" form
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [note, setNote] = useState('');
  const [searchFleet, setSearchFleet] = useState('');

  // Helpers
  const getClientName = (id: string) => clients.find(c => c.id === id)?.nome || 'Cliente Removido';

  const sortedVehicles = useMemo(() => {
    return vehicles
      .filter(v => 
          v.placa.toLowerCase().includes(searchFleet.toLowerCase()) || 
          v.modelo.toLowerCase().includes(searchFleet.toLowerCase())
      )
      .sort((a, b) => {
        // Sort by date urgency. If no date, put at bottom.
        if (!a.dataProximaManutencao) return 1;
        if (!b.dataProximaManutencao) return -1;
        return new Date(a.dataProximaManutencao).getTime() - new Date(b.dataProximaManutencao).getTime();
      });
  }, [vehicles, searchFleet]);

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !nextDate) return;

    updateVehicle(selectedVehicleId, {
        dataProximaManutencao: nextDate,
        notas: note ? note : undefined
    });

    // Reset form but keep simple UX
    setNextDate('');
    setNote('');
    setSelectedVehicleId('');
    alert('Alerta de manutenção agendado com sucesso!');
  };

  const getStatus = (dateStr?: string) => {
      if (!dateStr) return { label: 'Sem Agendamento', color: 'text-slate-400 bg-slate-100', icon: Clock };
      const due = new Date(dateStr);
      const today = new Date();
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return { label: `Vencido há ${Math.abs(diffDays)} dias`, color: 'text-red-700 bg-red-100 border-red-200', icon: AlertTriangle };
      if (diffDays <= 30) return { label: `Vence em ${diffDays} dias`, color: 'text-amber-700 bg-amber-100 border-amber-200', icon: Clock };
      return { label: `Em dia (${new Date(dateStr).toLocaleDateString('pt-BR')})`, color: 'text-emerald-700 bg-emerald-100 border-emerald-200', icon: CheckCircle };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <BellRing className="text-brand-600" size={32} />
              Alertas de Manutenção
           </h1>
           <p className="text-slate-500 mt-1">
             Controle proativo da frota. Agende a próxima visita para cada veículo.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Painel de Agendamento (Esquerda) */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-brand-100 overflow-hidden sticky top-4">
                <div className="bg-brand-600 p-4">
                    <h2 className="text-white font-bold text-lg flex items-center gap-2">
                        <Calendar size={20} /> Agendar Manutenção
                    </h2>
                    <p className="text-brand-100 text-xs mt-1">Crie um alerta vinculado ao veículo.</p>
                </div>
                
                <form onSubmit={handleCreateAlert} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">1. Selecione o Veículo</label>
                        <div className="relative">
                            <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select 
                                required
                                className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white transition-all appearance-none"
                                value={selectedVehicleId}
                                onChange={e => {
                                    setSelectedVehicleId(e.target.value);
                                    // Optional: Load existing note/date if needed, but keeping it simple for 'New Alert' feel
                                }}
                            >
                                <option value="">Escolha na lista...</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.placa} - {v.modelo}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">2. Data da Próxima Manutenção</label>
                        <input 
                            required
                            type="date"
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                            value={nextDate}
                            onChange={e => setNextDate(e.target.value)}
                        />
                        <p className="text-xs text-slate-500 mt-1">O sistema alertará quando esta data estiver próxima.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">3. Motivo / Observação</label>
                        <textarea 
                            rows={3}
                            placeholder="Ex: Troca de óleo, Revisão de 50k, Correia..."
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={!selectedVehicleId || !nextDate}
                        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 group"
                    >
                        <Save size={18} /> Definir Alerta
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            </div>
        </div>

        {/* Lista de Status da Frota (Direita) */}
        <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="text-slate-500" /> Cronograma da Frota
                </h2>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Filtrar veículo..." 
                        className="w-full pl-9 p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                        value={searchFleet}
                        onChange={e => setSearchFleet(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-3">
                {sortedVehicles.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                        Nenhum veículo encontrado.
                    </div>
                ) : (
                    sortedVehicles.map(vehicle => {
                        const status = getStatus(vehicle.dataProximaManutencao);
                        const StatusIcon = status.icon;

                        return (
                            <div key={vehicle.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase shadow-inner">
                                        {vehicle.placa.slice(-1)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg leading-none">{vehicle.modelo}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="bg-slate-800 text-white text-[10px] px-1.5 rounded font-mono font-bold tracking-wider">{vehicle.placa}</span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Car size={10} /> {getClientName(vehicle.clienteId)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:items-end gap-1 w-full md:w-auto pl-16 md:pl-0">
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                                        <StatusIcon size={12} /> {status.label}
                                    </div>
                                    {vehicle.notas && (
                                        <p className="text-xs text-slate-500 italic max-w-[200px] truncate">
                                            obs: {vehicle.notas}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Quick Action to Edit Date via the main form logic contextually could be added, but selecting from dropdown is explicit enough */}
                            </div>
                        );
                    })
                )}
            </div>
        </div>

      </div>
    </div>
  );
};