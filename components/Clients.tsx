import React, { useState, useMemo } from 'react';
import { useAutoPrime } from '../context/AutoPrimeContext';
import { Modal } from './ui/Modal';
import { Plus, Edit2, Trash2, Search, Phone, Mail, Users, Car, Calendar, User, ShieldCheck } from 'lucide-react';
import { Client } from '../types';

export const Clients = () => {
  const { clients, vehicles, addClient, updateClient, deleteClient } = useAutoPrime();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ nome: '', telefone: '', email: '' });

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telefone.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  const metrics = useMemo(() => {
      const total = clients.length;
      const newThisMonth = clients.filter(c => {
          const d = new Date(c.createdAt);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;
      return { total, newThisMonth };
  }, [clients]);

  const getClientVehiclesCount = (clientId: string) => {
      return vehicles.filter(v => v.clienteId === clientId).length;
  };

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({ nome: client.nome, telefone: client.telefone, email: client.email });
    } else {
      setEditingClient(null);
      setFormData({ nome: '', telefone: '', email: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      addClient(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir ${name}? \nATENÇÃO: Isso excluirá todos os veículos e ordens de serviço deste cliente!`)) {
      deleteClient(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Users className="text-brand-600" size={32} />
              Carteira de Clientes
           </h1>
           <p className="text-slate-500 mt-1">Gerencie contatos e histórico dos proprietários.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-brand-500/30 font-bold"
        >
          <Plus size={20} /> Novo Cliente
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-brand-600 rounded-lg">
                  <ShieldCheck size={24} />
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Total de Clientes</p>
                  <p className="text-2xl font-black text-slate-800">{metrics.total}</p>
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <User size={24} />
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Novos este Mês</p>
                  <p className="text-2xl font-black text-slate-800">+{metrics.newThisMonth}</p>
              </div>
          </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome, email ou telefone..." 
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-shadow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => {
            const vehicleCount = getClientVehiclesCount(client.id);
            const initials = client.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

            return (
              <div key={client.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-brand-200 transition-all duration-300 group flex flex-col">
                <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-lg border border-brand-100">
                                {initials}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 leading-tight">{client.nome}</h3>
                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Calendar size={10} /> Desde {new Date(client.createdAt).getFullYear()}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(client)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(client.id, client.nome)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                    </div>

                    <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-3 text-sm text-slate-600 p-2 rounded-lg bg-slate-50 border border-slate-100/50">
                            <div className="bg-white p-1.5 rounded-md text-emerald-500 shadow-sm"><Phone size={14} /></div>
                            <span className="font-medium select-all">{client.telefone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 p-2 rounded-lg bg-slate-50 border border-slate-100/50">
                            <div className="bg-white p-1.5 rounded-md text-blue-500 shadow-sm"><Mail size={14} /></div>
                            <span className="truncate select-all">{client.email}</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex items-center justify-between">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frota</span>
                     <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${vehicleCount > 0 ? 'bg-white border-slate-200 text-brand-700' : 'bg-slate-100 text-slate-400 border-transparent'}`}>
                         <Car size={14} /> 
                         {vehicleCount} {vehicleCount === 1 ? 'Veículo' : 'Veículos'}
                     </div>
                </div>
              </div>
            );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center">
          <Users size={48} strokeWidth={1} className="mb-3 opacity-50" />
          <p className="font-medium">Nenhum cliente encontrado.</p>
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingClient ? "Editar Cliente" : "Cadastrar Cliente"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
            <input 
              required
              type="text" 
              placeholder="Ex: João da Silva"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              value={formData.nome}
              onChange={e => setFormData({...formData, nome: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
            <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                required
                type="tel" 
                placeholder="(00) 00000-0000"
                className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                value={formData.telefone}
                onChange={e => setFormData({...formData, telefone: e.target.value})}
                />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                required
                type="email" 
                placeholder="cliente@email.com"
                className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-bold shadow-lg shadow-brand-500/20"
            >
              Salvar Cliente
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};