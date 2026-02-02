import React, { useState } from 'react';
import { useAutoPrime } from '../context/AutoPrimeContext';
import { Modal } from './ui/Modal';
import { Plus, Edit2, Trash2, Car, Calendar, User } from 'lucide-react';
import { Vehicle } from '../types';

export const Vehicles = () => {
  const { vehicles, clients, addVehicle, updateVehicle, deleteVehicle } = useAutoPrime();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  const initialFormState = { 
    placa: '', 
    modelo: '', 
    clienteId: '', 
    kmEntrada: 0, 
    dataUltimaManutencao: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState(initialFormState);

  const getClientName = (id: string) => clients.find(c => c.id === id)?.nome || 'Desconhecido';

  const handleOpenModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        placa: vehicle.placa,
        modelo: vehicle.modelo,
        clienteId: vehicle.clienteId,
        kmEntrada: vehicle.kmEntrada,
        dataUltimaManutencao: vehicle.dataUltimaManutencao
      });
    } else {
      setEditingVehicle(null);
      // If there are clients, select the first one by default to avoid empty selects
      setFormData({ ...initialFormState, clienteId: clients.length > 0 ? clients[0].id : '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, {
          ...formData,
          kmEntrada: Number(formData.kmEntrada)
      });
    } else {
      addVehicle({
          ...formData,
          kmEntrada: Number(formData.kmEntrada)
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Frota de Veículos</h1>
        <button 
          onClick={() => handleOpenModal()} 
          disabled={clients.length === 0}
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Novo Veículo
        </button>
      </div>

      {clients.length === 0 && (
         <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg text-sm">
            Cadastre um cliente antes de adicionar veículos.
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{vehicle.modelo}</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 font-mono">
                    {vehicle.placa}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(vehicle)} className="text-slate-400 hover:text-brand-600 p-1">
                  <Edit2 size={18} />
                </button>
                <button 
                    onClick={() => {
                        if(window.confirm('Excluir veículo? Ordens de serviço associadas também serão apagadas.')) {
                            deleteVehicle(vehicle.id);
                        }
                    }} 
                    className="text-slate-400 hover:text-red-600 p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-slate-600 border-t pt-3 border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <User size={16} className="text-brand-500" /> 
                    <span>{getClientName(vehicle.clienteId)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2 bg-slate-50 p-2 rounded">
                <div>
                    <p className="text-xs text-slate-400">KM Atual</p>
                    <p className="font-medium text-slate-700">{vehicle.kmEntrada} km</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400">Próx. Manutenção</p>
                    <p className={`font-medium ${vehicle.kmProximaManutencao - vehicle.kmEntrada <= 500 ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                        {vehicle.kmProximaManutencao} km
                    </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                <Calendar size={14} /> 
                <span>Última revisão: {new Date(vehicle.dataUltimaManutencao).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingVehicle ? "Editar Veículo" : "Novo Veículo"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dono (Cliente)</label>
            <select 
                required
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                value={formData.clienteId}
                onChange={e => setFormData({...formData, clienteId: e.target.value})}
                disabled={!!editingVehicle} // Lock owner on edit or allow change? Usually lock.
            >
                {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
                <input 
                required
                type="text" 
                placeholder="Ex: Fiat Uno"
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.modelo}
                onChange={e => setFormData({...formData, modelo: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Placa</label>
                <input 
                required
                type="text" 
                placeholder="ABC-1234"
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none uppercase"
                value={formData.placa}
                onChange={e => setFormData({...formData, placa: e.target.value})}
                />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">KM Entrada</label>
                <input 
                required
                type="number" 
                min="0"
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.kmEntrada}
                onChange={e => setFormData({...formData, kmEntrada: Number(e.target.value)})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data Última Rev.</label>
                <input 
                required
                type="date" 
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.dataUltimaManutencao}
                onChange={e => setFormData({...formData, dataUltimaManutencao: e.target.value})}
                />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};