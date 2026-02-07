import React, { useState, useMemo } from 'react';
import { useAutoPrime } from '../context/AutoPrimeContext';
import { Modal } from './ui/Modal';
import { 
  TrendingUp, TrendingDown, Wallet, Calendar, Plus, Trash2, Edit2, 
  ArrowUpRight, ArrowDownRight, DollarSign, PieChart, Tag, Zap, Home, 
  ShoppingBag, Briefcase, Wrench, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import { Transaction } from '../types';

export const Financial = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useAutoPrime();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Controle de Mês/Ano para Filtro
  const [currentDate, setCurrentDate] = useState(new Date());

  // Form State
  const initialFormState = {
    descricao: '',
    tipo: 'DESPESA' as 'RECEITA' | 'DESPESA',
    valor: 0,
    categoria: 'OUTROS' as Transaction['categoria'],
    data: new Date().toISOString().split('T')[0]
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- Logic ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Ajuste para garantir que a data seja comparada corretamente (string vs object)
      const tDate = new Date(t.data);
      // Usando UTC para evitar problemas de fuso horário voltando 1 dia
      const tMonth = tDate.getUTCMonth(); 
      const tYear = tDate.getUTCFullYear();
      
      return tMonth === currentDate.getMonth() && 
             tYear === currentDate.getFullYear();
    }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [transactions, currentDate]);

  const summary = useMemo(() => {
    const income = filteredTransactions
        .filter(t => t.tipo === 'RECEITA')
        .reduce((acc, t) => acc + t.valor, 0);
    
    const expense = filteredTransactions
        .filter(t => t.tipo === 'DESPESA')
        .reduce((acc, t) => acc + t.valor, 0);

    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));

  const handleOpenModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        descricao: transaction.descricao,
        tipo: transaction.tipo,
        valor: transaction.valor,
        categoria: transaction.categoria,
        data: transaction.data.split('T')[0]
      });
    } else {
      setEditingTransaction(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.valor <= 0 || !formData.descricao) return;

    // Garante que salvamos a data mantendo o dia selecionado
    const payload = {
        ...formData,
        // Adiciona hora fixa meio-dia UTC para evitar bug de fuso -3h virar dia anterior
        data: new Date(formData.data + 'T12:00:00Z').toISOString()
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, payload);
    } else {
      addTransaction(payload);
    }
    
    setIsModalOpen(false);
    setFormData(initialFormState);
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  
  // Função auxiliar para exibir dia corretamente
  const getDay = (isoDate: string) => {
      const d = new Date(isoDate);
      return d.getUTCDate().toString().padStart(2, '0');
  };

  // Visual Helpers
  const getCategoryConfig = (cat: string) => {
    switch(cat) {
        case 'ALUGUEL': return { icon: Home, color: 'bg-purple-100 text-purple-700 border-purple-200' };
        case 'CONTAS': return { icon: Zap, color: 'bg-orange-100 text-orange-700 border-orange-200' };
        case 'ESTOQUE': return { icon: ShoppingBag, color: 'bg-blue-100 text-blue-700 border-blue-200' };
        case 'OS': return { icon: Wrench, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
        case 'PESSOAL': return { icon: Briefcase, color: 'bg-pink-100 text-pink-700 border-pink-200' };
        default: return { icon: Tag, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
      
      {/* Header & Date Navigation - Melhorado para Mobile */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
        <div className="w-full xl:w-auto text-center xl:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center justify-center xl:justify-start gap-3">
                <PieChart className="text-brand-600" size={32} />
                Gestão Financeira
            </h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">Fluxo de caixa e lucratividade.</p>
        </div>
        
        <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-3">
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between flex-1 sm:flex-none">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-brand-600 transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <div className="px-4 py-1 text-center min-w-[140px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Período</p>
                    <p className="text-base font-black text-slate-800 capitalize flex items-center justify-center gap-2">
                        <Calendar size={14} className="text-brand-500 mb-0.5" />
                        {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-brand-600 transition-colors">
                    <ChevronRight size={20} />
                </button>
            </div>

            <button 
                onClick={() => handleOpenModal()}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/20 active:scale-95 w-full sm:w-auto"
            >
                <Plus size={18} /> <span className="sm:hidden xl:inline">Novo</span> Lançamento
            </button>
        </div>
      </div>

      {/* Cards Dashboard - Preservado cores e estilo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Income */}
        <div className="relative overflow-hidden rounded-2xl p-5 md:p-6 text-white shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-700">
            <div className="absolute top-0 right-0 p-4 opacity-20"><TrendingUp size={80} /></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 mb-3">
                    <ArrowUpRight size={14} />
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Entradas</span>
                </div>
                <p className="text-3xl md:text-4xl font-black tracking-tight">{formatMoney(summary.income)}</p>
            </div>
        </div>

        {/* Expense */}
        <div className="relative overflow-hidden rounded-2xl p-5 md:p-6 text-white shadow-lg bg-gradient-to-br from-rose-500 to-rose-700">
            <div className="absolute top-0 right-0 p-4 opacity-20"><TrendingDown size={80} /></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 mb-3">
                    <ArrowDownRight size={14} />
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Saídas</span>
                </div>
                <p className="text-3xl md:text-4xl font-black tracking-tight">{formatMoney(summary.expense)}</p>
            </div>
        </div>

        {/* Balance */}
        <div className={`relative overflow-hidden rounded-2xl p-5 md:p-6 text-white shadow-lg bg-gradient-to-br ${summary.balance >= 0 ? 'from-indigo-500 to-blue-700' : 'from-orange-500 to-red-600'}`}>
            <div className="absolute top-0 right-0 p-4 opacity-20"><Wallet size={80} /></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 mb-3">
                    <DollarSign size={14} />
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Resultado Mês</span>
                </div>
                <p className="text-3xl md:text-4xl font-black tracking-tight">{formatMoney(summary.balance)}</p>
            </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-lg md:text-xl text-slate-800 flex items-center gap-2">
                Extrato Detalhado
            </h2>
        </div>

        {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                <div className="p-4 bg-slate-100 rounded-full"><Wallet size={32} className="opacity-50" /></div>
                <p className="font-medium">Nenhuma movimentação neste mês.</p>
            </div>
        ) : (
            <>
                {/* --- MODO DESKTOP (TABELA) --- */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Dia</th>
                                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Descrição</th>
                                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Categoria</th>
                                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">Valor</th>
                                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTransactions.map(t => {
                                const CatConfig = getCategoryConfig(t.categoria);
                                const CatIcon = CatConfig.icon;
                                return (
                                    <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-bold text-slate-700 text-lg">{getDay(t.data)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${t.tipo === 'RECEITA' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {t.tipo === 'RECEITA' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{t.descricao}</p>
                                                    {t.referenciaId && <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">AUTO</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${CatConfig.color}`}>
                                                <CatIcon size={12} /> {t.categoria}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-black text-base ${t.tipo === 'RECEITA' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {t.tipo === 'RECEITA' ? '+' : '-'} {formatMoney(t.valor)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(t)} className="p-2 text-slate-400 hover:text-brand-600 rounded-lg"><Edit2 size={16} /></button>
                                                <button onClick={() => { if (confirm('Excluir?')) deleteTransaction(t.id); }} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* --- MODO MOBILE (CARDS) --- */}
                <div className="md:hidden divide-y divide-slate-100">
                    {filteredTransactions.map(t => {
                        const CatConfig = getCategoryConfig(t.categoria);
                        const CatIcon = CatConfig.icon;
                        return (
                            <div key={t.id} className="p-4 flex flex-col gap-3 active:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.tipo === 'RECEITA' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                            <span className="font-bold text-sm">{getDay(t.data)}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 leading-tight line-clamp-1">{t.descricao}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${CatConfig.color}`}>
                                                    <CatIcon size={10} /> {t.categoria}
                                                </span>
                                                {t.referenciaId && <span className="text-[10px] text-slate-400 font-mono">AUTO</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-black text-base ${t.tipo === 'RECEITA' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {t.tipo === 'RECEITA' ? '+' : '-'} {formatMoney(t.valor)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end gap-3 pt-2 border-t border-slate-50">
                                    <button onClick={() => handleOpenModal(t)} className="text-xs font-bold text-slate-400 hover:text-brand-600 flex items-center gap-1 px-2 py-1">
                                        <Edit2 size={14} /> Editar
                                    </button>
                                    <button onClick={() => { if (confirm('Excluir lançamento?')) deleteTransaction(t.id); }} className="text-xs font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1 px-2 py-1">
                                        <Trash2 size={14} /> Excluir
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>
        )}
      </div>

      {/* Modal - Ajustes Mobile */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingTransaction ? "Editar Lançamento" : "Novo Lançamento"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, tipo: 'RECEITA'})}
                        className={`p-3 md:p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.tipo === 'RECEITA' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'}`}
                    >
                        <ArrowUpRight size={24} />
                        <span className="font-bold text-sm">Entrada</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, tipo: 'DESPESA'})}
                        className={`p-3 md:p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.tipo === 'DESPESA' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-white border-slate-200 text-slate-400'}`}
                    >
                        <ArrowDownRight size={24} />
                        <span className="font-bold text-sm">Saída</span>
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input 
                    required
                    type="text"
                    placeholder="Ex: Conta de Luz..." 
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.descricao}
                    onChange={e => setFormData({...formData, descricao: e.target.value})}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                        <input 
                            required
                            type="number"
                            min="0.01"
                            step="0.01" 
                            className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-800"
                            value={formData.valor}
                            onChange={e => setFormData({...formData, valor: Number(e.target.value)})}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                    <input 
                        required
                        type="date" 
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        value={formData.data}
                        onChange={e => setFormData({...formData, data: e.target.value})}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                        className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white appearance-none"
                        value={formData.categoria}
                        onChange={e => setFormData({...formData, categoria: e.target.value as any})}
                    >
                        <option value="OUTROS">Outros</option>
                        <option value="ALUGUEL">Aluguel / Estrutura</option>
                        <option value="CONTAS">Contas (Luz/Água/Net)</option>
                        <option value="PESSOAL">Pagamento Pessoal/Salário</option>
                        <option value="ESTOQUE">Compra de Estoque</option>
                        <option value="OS">Serviço Extra</option>
                    </select>
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-bold">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold shadow-lg shadow-slate-900/20">
                    {editingTransaction ? 'Salvar' : 'Confirmar'}
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};
