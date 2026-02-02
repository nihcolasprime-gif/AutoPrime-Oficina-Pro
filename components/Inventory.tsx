import React, { useState } from 'react';
import { useAutoPrime } from '../context/AutoPrimeContext';
import { Modal } from './ui/Modal';
import { Plus, Edit2, Trash2, Package, AlertTriangle } from 'lucide-react';
import { Part } from '../types';

export const Inventory = () => {
  const { inventory, addPart, updatePart, deletePart } = useAutoPrime();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  
  const initialForm = { nomePeca: '', quantidadeAtual: 0, quantidadeMinima: 5, valorUnitario: 0 };
  const [formData, setFormData] = useState(initialForm);

  const handleOpenModal = (part?: Part) => {
    if (part) {
      setEditingPart(part);
      setFormData(part);
    } else {
      setEditingPart(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
        ...formData,
        quantidadeAtual: Number(formData.quantidadeAtual),
        quantidadeMinima: Number(formData.quantidadeMinima),
        valorUnitario: Number(formData.valorUnitario)
    };

    if (editingPart) {
      updatePart(editingPart.id, data);
    } else {
      addPart(data);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Estoque de Peças</h1>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Nova Peça
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Peça</th>
              <th className="p-4 font-semibold text-slate-600 text-center">Qtd. Atual</th>
              <th className="p-4 font-semibold text-slate-600 text-center">Mínimo</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Valor Un.</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.length === 0 ? (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">Nenhuma peça cadastrada.</td>
                </tr>
            ) : (
                inventory.map(part => {
                    const isLow = part.quantidadeAtual < part.quantidadeMinima;
                    return (
                        <tr key={part.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isLow ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-brand-600'}`}>
                                        <Package size={20} />
                                    </div>
                                    <span className="font-medium text-slate-800">{part.nomePeca}</span>
                                    {isLow && (
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <AlertTriangle size={12} /> Baixo
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="p-4 text-center font-mono">{part.quantidadeAtual}</td>
                            <td className="p-4 text-center text-slate-500 text-sm">{part.quantidadeMinima}</td>
                            <td className="p-4 text-right font-medium text-slate-700">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(part.valorUnitario)}
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleOpenModal(part)} className="p-1 text-slate-400 hover:text-brand-600">
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (window.confirm('Excluir peça do estoque?')) deletePart(part.id);
                                        }}
                                        className="p-1 text-slate-400 hover:text-red-600"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPart ? "Editar Peça" : "Nova Peça"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Peça</label>
            <input 
              required
              type="text" 
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
              value={formData.nomePeca}
              onChange={e => setFormData({...formData, nomePeca: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade Atual</label>
                <input 
                required
                type="number" 
                min="0"
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.quantidadeAtual}
                onChange={e => setFormData({...formData, quantidadeAtual: Number(e.target.value)})}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Qtd. Mínima</label>
                <input 
                required
                type="number" 
                min="0"
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.quantidadeMinima}
                onChange={e => setFormData({...formData, quantidadeMinima: Number(e.target.value)})}
                />
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Valor Unitário (R$)</label>
            <input 
              required
              type="number" 
              step="0.01"
              min="0"
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
              value={formData.valorUnitario}
              onChange={e => setFormData({...formData, valorUnitario: Number(e.target.value)})}
            />
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