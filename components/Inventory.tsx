import React, { useState, useMemo } from 'react';
import { useAutoPrime } from '../context/AutoPrimeContext';
import { Modal } from './ui/Modal';
import { Plus, Edit2, Trash2, Package, AlertTriangle, Search, TrendingUp, AlertCircle, Box } from 'lucide-react';
import { Part } from '../types';

export const Inventory = () => {
  const { inventory, addPart, updatePart, deletePart } = useAutoPrime();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const initialForm = { nomePeca: '', quantidadeAtual: 0, quantidadeMinima: 5, valorUnitario: 0 };
  const [formData, setFormData] = useState(initialForm);

  // Metrics & Filtering
  const filteredInventory = useMemo(() => {
    return inventory.filter(p => p.nomePeca.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [inventory, searchTerm]);

  const metrics = useMemo(() => {
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((acc, item) => acc + (item.quantidadeAtual * item.valorUnitario), 0);
    const lowStock = inventory.filter(i => i.quantidadeAtual < i.quantidadeMinima).length;
    return { totalItems, totalValue, lowStock };
  }, [inventory]);

  const handleOpenModal = (part?: Part) => {
    if (part) {
      setEditingPart(part);
      setFormData({
          nomePeca: part.nomePeca,
          quantidadeAtual: part.quantidadeAtual,
          quantidadeMinima: part.quantidadeMinima,
          valorUnitario: part.valorUnitario
      });
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

  const handleDelete = (id: string, nome: string) => {
      if (window.confirm(`Tem certeza que deseja excluir a peça "${nome}" do estoque?`)) {
          deletePart(id);
      }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Package className="text-brand-600" size={32} />
              Estoque de Peças
           </h1>
           <p className="text-slate-500 mt-1">Gerencie seu inventário e preços.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-brand-500/30 font-bold"
        >
          <Plus size={20} /> Nova Peça
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-brand-600 rounded-lg">
                  <Box size={24} />
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Total de Itens</p>
                  <p className="text-2xl font-black text-slate-800">{metrics.totalItems}</p>
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <TrendingUp size={24} />
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Valor em Estoque</p>
                  <p className="text-2xl font-black text-slate-800">{formatCurrency(metrics.totalValue)}</p>
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${metrics.lowStock > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                  <AlertCircle size={24} />
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Estoque Baixo</p>
                  <p className={`text-2xl font-black ${metrics.lowStock > 0 ? 'text-red-600' : 'text-slate-800'}`}>{metrics.lowStock}</p>
              </div>
          </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar peça por nome..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                <th className="p-5 font-bold text-xs text-slate-500 uppercase tracking-wider">Peça / Produto</th>
                <th className="p-5 font-bold text-xs text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="p-5 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">Valor Unit.</th>
                <th className="p-5 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">Valor Total</th>
                <th className="p-5 font-bold text-xs text-slate-500 uppercase tracking-wider text-center">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredInventory.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="p-10 text-center text-slate-400">
                            <div className="flex flex-col items-center gap-2">
                                <Package size={40} strokeWidth={1.5} className="opacity-50"/>
                                <p className="font-medium">Nenhum item encontrado no estoque.</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    filteredInventory.map(part => {
                        const isLow = part.quantidadeAtual < part.quantidadeMinima;
                        const stockPercentage = Math.min(100, (part.quantidadeAtual / (part.quantidadeMinima * 2)) * 100);
                        
                        return (
                            <tr key={part.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isLow ? 'bg-red-100 text-red-600' : 'bg-brand-50 text-brand-600'}`}>
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{part.nomePeca}</p>
                                            <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {part.id.slice(0,6)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-lg font-bold ${isLow ? 'text-red-600' : 'text-slate-700'}`}>
                                                {part.quantidadeAtual}
                                            </span>
                                            <span className="text-xs text-slate-400">unid.</span>
                                        </div>
                                        
                                        {/* Stock Visual Bar */}
                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-brand-500'}`} 
                                                style={{ width: `${stockPercentage}%` }}
                                            ></div>
                                        </div>
                                        
                                        {isLow ? (
                                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full mt-1 flex items-center gap-1">
                                                <AlertTriangle size={10} /> Mín: {part.quantidadeMinima}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 mt-1">
                                                Mín: {part.quantidadeMinima}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-5 text-right">
                                    <span className="font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded text-sm">
                                        {formatCurrency(part.valorUnitario)}
                                    </span>
                                </td>
                                <td className="p-5 text-right font-bold text-slate-800">
                                    {formatCurrency(part.quantidadeAtual * part.valorUnitario)}
                                </td>
                                <td className="p-5 text-right">
                                    <div className="flex justify-center gap-2">
                                        <button 
                                            onClick={() => handleOpenModal(part)} 
                                            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm rounded-lg transition-all"
                                            title="Editar"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(part.id, part.nomePeca)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm rounded-lg transition-all"
                                            title="Excluir"
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
      </div>

      {/* Modal - same as before but ensured layout */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPart ? "Editar Item do Estoque" : "Cadastrar Nova Peça"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Informações da Peça</label>
             <input 
              required
              type="text" 
              placeholder="Nome da Peça (ex: Pastilha de Freio)"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              value={formData.nomePeca}
              onChange={e => setFormData({...formData, nomePeca: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade em Estoque</label>
                <div className="relative">
                    <input 
                    required
                    type="number" 
                    min="0"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-800"
                    value={formData.quantidadeAtual}
                    onChange={e => setFormData({...formData, quantidadeAtual: Number(e.target.value)})}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">UN</div>
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estoque Mínimo <span className="text-xs text-slate-400 font-normal">(Alerta)</span></label>
                <div className="relative">
                    <input 
                    required
                    type="number" 
                    min="0"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.quantidadeMinima}
                    onChange={e => setFormData({...formData, quantidadeMinima: Number(e.target.value)})}
                    />
                </div>
             </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Valor Unitário de Venda</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold">R$</span>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  min="0"
                  className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-800"
                  value={formData.valorUnitario}
                  onChange={e => setFormData({...formData, valorUnitario: Number(e.target.value)})}
                />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 bg-blue-50 p-2 rounded text-blue-800 border border-blue-100 flex items-center gap-2">
                <TrendingUp size={12}/>
                Este valor será sugerido automaticamente ao criar uma Ordem de Serviço.
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancelar</button>
            <button type="submit" className="px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-bold shadow-lg shadow-brand-500/20 transition-all transform active:scale-95">
                {editingPart ? 'Salvar Alterações' : 'Cadastrar Peça'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};