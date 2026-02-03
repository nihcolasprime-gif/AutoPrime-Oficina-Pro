import React, { useState, useMemo } from 'react';
import { useAutoPrime } from '../context/AutoPrimeContext';
import { Modal } from './ui/Modal';
import { TrendingUp, TrendingDown, Wallet, Calendar, Plus, Trash2, Filter } from 'lucide-react';
import { Transaction } from '../types';

export const Financial = () => {
  const { transactions, addTransaction, deleteTransaction } = useAutoPrime();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  // --- Lógica de Filtro e Resumo ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.data);
      return tDate.getMonth() === currentDate.getMonth() && 
             tDate.getFullYear() === currentDate.getFullYear();
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

  // --- Handlers ---
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.valor <= 0 || !formData.descricao) return;

    addTransaction({
        ...formData,
        data: new Date(formData.data).toISOString() // Garante ISO para o contexto
    });
    setIsModalOpen(false);
    setFormData(initialFormState);
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <Wallet className="text-prime-blue" />
                Gestão Financeira
            </h1>
            <p className="text-slate-500 mt-1">Controle de entradas, saídas e lucratividade.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 font-bold">&lt;</button>
            <div className="flex items-center gap-2 px-2 text-slate-800 font-bold min-w-[140px] justify-center">
                <Calendar size={18} className="text-brand-500" />
                <span className="uppercase">
                    {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </span>
            </div>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 font-bold">&gt;</button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp size={80} className="text-emerald-600" />
            </div>
            <p className="text-emerald-700 font-bold uppercase text-xs tracking-widest mb-2">Entradas (Mês)</p>
            <p className="text-3xl font-black text-emerald-800">{formatMoney(summary.income)}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-red-100 bg-red-50/50 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingDown size={80} className="text-red-600" />
            </div>
            <p className="text-red-700 font-bold uppercase text-xs tracking-widest mb-2">Saídas (Mês)</p>
            <p className="text-3xl font-black text-red-800">{formatMoney(summary.expense)}</p>
        </div>

        <div className={`glass-panel p-6 rounded-2xl border flex flex-col justify-between relative overflow-hidden group ${summary.balance >= 0 ? 'bg-blue-50/50 border-blue-100' : 'bg-orange-50/50 border-orange-100'}`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Wallet size={80} className={summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'} />
            </div>
            <p className={`${summary.balance >= 0 ? 'text-blue-700' : 'text-orange-700'} font-bold uppercase text-xs tracking-widest mb-2`}>
                Balanço Líquido
            </p>
            <p className={`text-3xl font-black ${summary.balance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                {formatMoney(summary.balance)}
            </p>
        </div>
      </div>

      {/* Área de Ações e Lista */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                Histórico de Lançamentos
            </h2>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
                <Plus size={16} /> Lançar Manualmente
            </button>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-500 uppercase font-bold text-xs">
                    <tr>
                        <th className="p-4">Data</th>
                        <th className="p-4">Descrição</th>
                        <th className="p-4">Categoria</th>
                        <th className="p-4 text-right">Valor</th>
                        <th className="p-4 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                                Nenhuma movimentação registrada neste mês.
                            </td>
                        </tr>
                    ) : (
                        filteredTransactions.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 text-slate-600">
                                    {new Date(t.data).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="p-4 font-medium text-slate-800">
                                    {t.descricao}
                                    {t.referenciaId && (
                                        <span className="ml-2 text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-normal">Auto</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-full text-slate-600 font-medium">
                                        {t.categoria}
                                    </span>
                                </td>
                                <td className={`p-4 text-right font-bold ${t.tipo === 'RECEITA' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {t.tipo === 'RECEITA' ? '+' : '-'} {formatMoney(t.valor)}
                                </td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => {
                                            if (confirm('Deseja excluir este lançamento?')) deleteTransaction(t.id);
                                        }}
                                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                        title="Excluir Lançamento"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal de Lançamento Manual */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Lançamento Financeiro">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Movimentação</label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, tipo: 'RECEITA'})}
                        className={`p-3 rounded-lg border text-center font-bold transition-all ${formData.tipo === 'RECEITA' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'}`}
                    >
                        Entrada (Receita)
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, tipo: 'DESPESA'})}
                        className={`p-3 rounded-lg border text-center font-bold transition-all ${formData.tipo === 'DESPESA' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-200 text-slate-500'}`}
                    >
                        Saída (Despesa)
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input 
                    required
                    type="text"
                    placeholder="Ex: Conta de Luz, Aluguel, Venda de Sucata..." 
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.descricao}
                    onChange={e => setFormData({...formData, descricao: e.target.value})}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                    <input 
                        required
                        type="number"
                        min="0.01"
                        step="0.01" 
                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
                        value={formData.valor}
                        onChange={e => setFormData({...formData, valor: Number(e.target.value)})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                    <input 
                        required
                        type="date" 
                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
                        value={formData.data}
                        onChange={e => setFormData({...formData, data: e.target.value})}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <select 
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                    value={formData.categoria}
                    onChange={e => setFormData({...formData, categoria: e.target.value as any})}
                >
                    <option value="OUTROS">Outros</option>
                    <option value="ALUGUEL">Aluguel / Estrutura</option>
                    <option value="CONTAS">Contas (Luz/Água/Net)</option>
                    <option value="PESSOAL">Pagamento Pessoal/Salário</option>
                    <option value="ESTOQUE">Compra de Estoque (Manual)</option>
                    <option value="OS">Serviço Extra</option>
                </select>
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 font-bold">Lançar</button>
            </div>
        </form>
      </Modal>
    </div>
  );
};