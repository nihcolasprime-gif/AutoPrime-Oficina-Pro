import React, { useState } from 'react';
import { useAutoPrime } from '../context/AutoPrimeContext';
import { Modal } from './ui/Modal';
import { Plus, Edit2, Trash2, Search, Phone, Mail } from 'lucide-react';
import { Client } from '../types';

export const Clients = () => {
  const { clients, addClient, updateClient, deleteClient } = useAutoPrime();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ nome: '', telefone: '', email: '' });

  const filteredClients = clients.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Gerenciar Clientes</h1>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Novo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou email..." 
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-slate-800 truncate">{client.nome}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(client)} className="text-slate-400 hover:text-brand-600 p-1">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(client.id, client.nome)} className="text-slate-400 hover:text-red-600 p-1">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Phone size={16} /> <span>{client.telefone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} /> <span>{client.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          Nenhum cliente encontrado.
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingClient ? "Editar Cliente" : "Novo Cliente"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
            <input 
              required
              type="text" 
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
              value={formData.nome}
              onChange={e => setFormData({...formData, nome: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
            <input 
              required
              type="tel" 
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
              value={formData.telefone}
              onChange={e => setFormData({...formData, telefone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              required
              type="email" 
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};