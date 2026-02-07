import React, { useState, useMemo } from 'react';
import { useAutoPrime } from '../context/AutoPrimeContext';
import { Modal } from './ui/Modal';
import { Plus, Edit2, Trash2, Calendar, User, Clock, Search, Car, AlertTriangle, CheckCircle, Gauge } from 'lucide-react';
import { Vehicle } from '../types';

export const Vehicles = () => {
  const { vehicles, clients, addVehicle, updateVehicle, deleteVehicle } = useAutoPrime();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const initialFormState = { 
    placa: '', 
    modelo: '', 
    clienteId: '', 
    kmEntrada: 0, 
    dataUltimaManutencao: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- Logic ---
  const getClientName = (id: string) => clients.find(c => c.id === id)?.nome || 'Desconhecido';

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
        const search = searchTerm.toLowerCase();
        const clientName = getClientName(v.clienteId).toLowerCase();
        return v.placa.toLowerCase().includes(search) || 
               v.modelo.toLowerCase().includes(search) ||
               clientName.includes(search);
    });
  }, [vehicles, searchTerm, clients]);

  const metrics = useMemo(() => {
    const today = new Date();
    let overdue = 0;
    let warning = 0;
    
    vehicles.forEach(v => {
        if (!v.dataProximaManutencao) return;
        const due = new Date(v.dataProximaManutencao);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) overdue++;
        else if (diffDays <= 30) warning++;
    });

    return { total: vehicles.length, overdue, warning };
  }, [vehicles]);

  const getStatusInfo = (dateStr?: string) => {
      if (!dateStr) return { color: 'bg-slate-100 text-slate-500', icon: Clock, text: 'Sem previsão' };
      const due = new Date(dateStr);
      const today = new Date();
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return { color: 'bg-red-50 text-red-600 border-red-100', icon: AlertTriangle, text: 'Vencido' };
      if (diffDays < 30) return { color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Clock, text: 'Revisão Próxima' };
      return { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle, text: 'Em dia' };
  };

  // --- Handlers ---
  const handleOpenModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        placa: vehicle.placa,
        modelo: vehicle.modelo,
        clienteId: vehicle.clienteId,
        kmEntrada: vehicle.kmEntrada,
        dataUltimaManutencao: vehicle.dataUltimaManutencao ? new Date(vehicle.dataUltimaManutencao).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingVehicle(null);
      setFormData({ ...initialFormState, clienteId: clients.length > 0 ? clients[0].id : '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, kmEntrada: Number(formData.kmEntrada), placa: formData.placa.toUpperCase() };
    if (editingVehicle) updateVehicle(editingVehicle.id, payload);
    else addVehicle(payload);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <Car className="text-brand-600" size={32} />
                Frota de Veículos
            </h1>
            <p className="text-slate-500 mt-1">Gerencie os carros e histórico de revisões.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          disabled={clients.length === 0}
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-brand-500/30 font-bold"
        >
          <Plus size={20} /> Adicionar Veículo
        </button>
      </div>

      {clients.length === 0 && (
         <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> Cadastre um cliente antes de adicionar veículos.
         </div>
      )}

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
             <div>
                 <p className="text-xs font-bold text-slate-400 uppercase">Total na Frota</p>
                 <p className="text-2xl font-black text-slate-800">{metrics.total}</p>
             </div>
             <div className="bg-brand-50 p-3 rounded-lg text-brand-600"><Car size={24}/></div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
             <div>
                 <p className="text-xs font-bold text-slate-400 uppercase">Manutenção Vencida</p>
                 <p className={`text-2xl font-black ${metrics.overdue > 0 ? 'text-red-600' : 'text-slate-800'}`}>{metrics.overdue}</p>
             </div>
             <div className={`p-3 rounded-lg ${metrics.overdue > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}><AlertTriangle size={24}/></div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
             <div>
                 <p className="text-xs font-bold text-slate-400 uppercase">Atenção Necessária</p>
                 <p className={`text-2xl font-black ${metrics.warning > 0 ? 'text-amber-600' : 'text-slate-800'}`}>{metrics.warning}</p>
             </div>
             <div className={`p-3 rounded-lg ${metrics.warning > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}><Clock size={24}/></div>
         </div>
      </div>

      {/* Search */}
      <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por Placa, Modelo ou Cliente..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.length === 0 ? (
             <div className="col-span-full py-12 text-center text-slate-400 flex flex-col items-center">
                 <Car size={48} strokeWidth={1} className="mb-2 opacity-50"/>
                 <p>Nenhum veículo encontrado.</p>
             </div>
        ) : (
            filteredVehicles.map(vehicle => {
                const status = getStatusInfo(vehicle.dataProximaManutencao);
                const StatusIcon = status.icon;

                return (
                  <div key={vehicle.id} className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-brand-200 transition-all duration-300 overflow-hidden relative">
                    {/* Top Bar Decoration */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 group-hover:from-brand-500 group-hover:to-brand-400 transition-all"></div>
                    
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 leading-tight">{vehicle.modelo}</h3>
                                {/* Placa Style */}
                                <div className="mt-1 inline-flex flex-col items-center bg-white border-2 border-slate-800 rounded px-2 py-0.5 shadow-sm min-w-[80px]">
                                    <div className="w-full h-1.5 bg-blue-700 mb-0.5"></div>
                                    <span className="font-mono font-bold text-sm text-slate-900 tracking-wider leading-none">{vehicle.placa}</span>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(vehicle)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-lg"><Edit2 size={16} /></button>
                                <button onClick={() => { if(confirm('Excluir veículo?')) deleteVehicle(vehicle.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <div className="p-1.5 bg-white rounded-md shadow-sm text-slate-400"><User size={14} /></div>
                                <span className="font-medium truncate">{getClientName(vehicle.clienteId)}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">KM Atual</span>
                                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                                        <Gauge size={14} className="text-slate-400"/> {vehicle.kmAtual}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Última Revisão</span>
                                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                                        <Calendar size={14} className="text-slate-400"/> 
                                        {vehicle.dataUltimaManutencao ? new Date(vehicle.dataUltimaManutencao).toLocaleDateString('pt-BR') : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Footer */}
                    <div className={`px-5 py-2.5 border-t border-slate-100 flex items-center justify-between ${status.color.replace('text', 'bg').replace('50', '50/50')}`}>
                         <span className="text-[10px] uppercase font-bold text-slate-500">Status Manutenção</span>
                         <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                             <StatusIcon size={12} /> {status.text}
                         </div>
                    </div>
                  </div>
                );
            })
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingVehicle ? "Editar Veículo" : "Novo Veículo"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dono do Veículo</label>
            <select 
                required
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white transition-all"
                value={formData.clienteId}
                onChange={e => setFormData({...formData, clienteId: e.target.value})}
                disabled={!!editingVehicle}
            >
                {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 grid grid-cols-2 gap-4">
             <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
                <input required type="text" placeholder="Ex: Fiat Uno Way"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} />
             </div>
             <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Placa</label>
                <input required type="text" placeholder="ABC-1234"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none uppercase font-mono font-bold tracking-widest"
                value={formData.placa} onChange={e => setFormData({...formData, placa: e.target.value})} />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quilometragem Inicial</label>
                <div className="relative">
                    <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="number" min="0"
                    className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.kmEntrada} onChange={e => setFormData({...formData, kmEntrada: Number(e.target.value)})} />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data Última Revisão</label>
                <input required type="date" 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.dataUltimaManutencao} onChange={e => setFormData({...formData, dataUltimaManutencao: e.target.value})} />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-bold shadow-lg shadow-brand-500/20">Salvar Veículo</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};