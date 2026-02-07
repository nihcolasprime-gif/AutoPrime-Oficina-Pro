import React, { useState, useMemo } from 'react';
import { useAutoPrime } from '../context/AutoPrimeContext';
import { Modal } from './ui/Modal';
import { Plus, Trash2, FileText, CheckCircle, Printer, Wrench, X, Search, DollarSign, Calendar, Car, User, ClipboardList } from 'lucide-react';
import { UsedPart, ServiceItem, ServiceOrder } from '../types';

export const ServiceOrders = () => {
  const { 
    serviceOrders, clients, vehicles, inventory, 
    addServiceOrder, deleteServiceOrder, generateOSPDF 
  } = useAutoPrime();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // OS Creation Form State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [kmNoServico, setKmNoServico] = useState(0);
  const [tempNotes, setTempNotes] = useState('');
  
  // Lists
  const [selectedParts, setSelectedParts] = useState<UsedPart[]>([]);
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  
  // Temp inputs
  const [tempPartId, setTempPartId] = useState('');
  const [tempQty, setTempQty] = useState(1);
  const [tempPartPrice, setTempPartPrice] = useState(0);

  const [tempServiceName, setTempServiceName] = useState('');
  const [tempServiceValue, setTempServiceValue] = useState(0);

  // --- Logic & Memos ---

  const availableVehicles = useMemo(() => 
    vehicles.filter(v => v.clienteId === selectedClientId),
  [selectedClientId, vehicles]);

  const getClientName = (id: string) => clients.find(c => c.id === id)?.nome || 'Cliente Removido';
  const getVehicleData = (id: string) => vehicles.find(v => v.id === id);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return serviceOrders.filter(os => {
        const client = getClientName(os.clienteId).toLowerCase();
        const vehicle = getVehicleData(os.veiculoId);
        const plate = vehicle?.placa.toLowerCase() || '';
        const model = vehicle?.modelo.toLowerCase() || '';
        const osId = os.id.toLowerCase();
        
        return client.includes(term) || plate.includes(term) || model.includes(term) || osId.includes(term);
    }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [serviceOrders, searchTerm, clients, vehicles]);

  const metrics = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthOrders = serviceOrders.filter(os => {
        const d = new Date(os.data);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalRevenue = thisMonthOrders.reduce((acc, os) => acc + os.valorTotal, 0);
    const count = thisMonthOrders.length;
    const avgTicket = count > 0 ? totalRevenue / count : 0;

    return { totalRevenue, count, avgTicket };
  }, [serviceOrders]);

  // --- Handlers ---

  const resetForm = () => {
    setSelectedClientId('');
    setSelectedVehicleId('');
    setKmNoServico(0);
    setTempNotes('');
    setSelectedParts([]);
    setSelectedServices([]);
    setTempPartId('');
    setTempQty(1);
    setTempPartPrice(0);
    setTempServiceName('');
    setTempServiceValue(0);
  };

  const handlePartSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const pId = e.target.value;
      setTempPartId(pId);
      const part = inventory.find(p => p.id === pId);
      if (part) {
          setTempPartPrice(part.valorUnitario);
      } else {
          setTempPartPrice(0);
      }
  };

  const handleAddPart = () => {
    if (!tempPartId || tempQty <= 0) return;
    const part = inventory.find(p => p.id === tempPartId);
    if (!part) return;
    if (part.quantidadeAtual < tempQty) { alert(`Estoque insuficiente! Disp: ${part.quantidadeAtual}`); return; }

    setSelectedParts([...selectedParts, {
        partId: part.id,
        nomePeca: part.nomePeca,
        quantidade: tempQty,
        valorUnitarioSnapshot: tempPartPrice
    }]);
    
    setTempPartId('');
    setTempQty(1);
    setTempPartPrice(0);
  };

  const handleRemovePart = (index: number) => {
      setSelectedParts(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddService = () => {
    if (!tempServiceName || tempServiceValue < 0) return;
    setSelectedServices([...selectedServices, {
        id: Date.now().toString(),
        nome: tempServiceName,
        valor: tempServiceValue
    }]);
    setTempServiceName('');
    setTempServiceValue(0);
  };

  const handleRemoveService = (index: number) => {
      setSelectedServices(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !selectedVehicleId) return;

    addServiceOrder({
        clienteId: selectedClientId,
        veiculoId: selectedVehicleId,
        kmNoServico,
        pecasUsadas: selectedParts,
        servicos: selectedServices,
        data: new Date().toISOString(),
        notas: tempNotes
    });

    setIsModalOpen(false);
    resetForm();
  };

  const calculateTempTotal = () => {
      const partsTotal = selectedParts.reduce((acc, p) => acc + (p.quantidade * p.valorUnitarioSnapshot), 0);
      const servicesTotal = selectedServices.reduce((acc, s) => acc + s.valor, 0);
      return partsTotal + servicesTotal;
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <ClipboardList className="text-brand-600" size={32} />
              Ordens de Serviço
           </h1>
           <p className="text-slate-500 mt-1">Histórico de manutenções e faturamento.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }} 
          disabled={clients.length === 0 || vehicles.length === 0}
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-brand-500/30 font-bold"
        >
          <Plus size={20} /> Nova OS
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <DollarSign size={24} />
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Receita (Mês)</p>
                  <p className="text-2xl font-black text-slate-800">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-brand-600 rounded-lg">
                  <FileText size={24} />
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Total OS (Mês)</p>
                  <p className="text-2xl font-black text-slate-800">{metrics.count}</p>
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Wrench size={24} />
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Ticket Médio</p>
                  <p className="text-2xl font-black text-slate-800">{formatCurrency(metrics.avgTicket)}</p>
              </div>
          </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por cliente, placa, modelo ou ID da OS..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      {/* OS Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.length === 0 ? (
             <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center">
                <ClipboardList size={48} strokeWidth={1} className="mb-3 opacity-50"/>
                <p className="font-medium">Nenhuma Ordem de Serviço encontrada.</p>
            </div>
        ) : (
            filteredOrders.map(os => {
                const vehicle = getVehicleData(os.veiculoId);
                return (
                    <div key={os.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                        {/* Card Header */}
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${os.status === 'CONCLUIDA' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                    {os.status}
                                </span>
                                <span className="text-xs text-slate-500 font-mono font-medium tracking-wide">#{os.id.split('-')[0].toUpperCase()}</span>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(os.data).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-black text-slate-800">{formatCurrency(os.valorTotal)}</span>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                            
                            {/* Client & Vehicle */}
                            <div className="md:col-span-1 space-y-3">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Cliente</p>
                                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                                        <User size={16} className="text-brand-500" />
                                        {getClientName(os.clienteId)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Veículo</p>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                                            {vehicle?.placa || '---'}
                                        </div>
                                        <span className="text-slate-700 font-medium text-sm">{vehicle?.modelo || 'Veículo N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Services & Parts Summary */}
                            <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1"><Wrench size={10}/> Serviços ({os.servicos.length})</p>
                                    <ul className="text-xs text-slate-600 space-y-1">
                                        {os.servicos.slice(0, 3).map((s, i) => (
                                            <li key={i} className="truncate">• {s.nome}</li>
                                        ))}
                                        {os.servicos.length > 3 && <li className="text-slate-400 italic">+{os.servicos.length - 3} outros...</li>}
                                        {os.servicos.length === 0 && <li className="text-slate-400 italic">Nenhum serviço</li>}
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1"><FileText size={10}/> Peças ({os.pecasUsadas.length})</p>
                                    <ul className="text-xs text-slate-600 space-y-1">
                                        {os.pecasUsadas.slice(0, 3).map((p, i) => (
                                            <li key={i} className="truncate">• {p.nomePeca} ({p.quantidade})</li>
                                        ))}
                                        {os.pecasUsadas.length > 3 && <li className="text-slate-400 italic">+{os.pecasUsadas.length - 3} outras...</li>}
                                        {os.pecasUsadas.length === 0 && <li className="text-slate-400 italic">Nenhuma peça</li>}
                                    </ul>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-1 flex flex-col justify-center gap-2 border-l border-slate-100 pl-4 md:pl-6">
                                <button 
                                    onClick={() => generateOSPDF(os.id)}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm py-2 rounded-lg font-bold transition-colors"
                                >
                                    <Printer size={16} /> Imprimir
                                </button>
                                <button 
                                    onClick={() => {
                                        if(window.confirm('Excluir este registro? O valor será removido do financeiro e o estoque NÃO será reposto.')) {
                                            deleteServiceOrder(os.id);
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm py-2 rounded-lg font-bold transition-colors"
                                >
                                    <Trash2 size={16} /> Excluir
                                </button>
                            </div>
                        </div>

                        {os.notas && (
                            <div className="px-6 pb-4 pt-0">
                                <p className="text-xs text-slate-500 italic bg-amber-50 p-2 rounded border border-amber-100">
                                    <span className="font-bold not-italic text-amber-700">Nota:</span> {os.notas}
                                </p>
                            </div>
                        )}
                    </div>
                );
            })
        )}
      </div>

      {/* NEW OS MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Ordem de Serviço">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section: Client & Vehicle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select required className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-brand-500"
                        value={selectedClientId} onChange={e => { setSelectedClientId(e.target.value); setSelectedVehicleId(''); }}>
                        <option value="">Selecione o Cliente...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Veículo</label>
                <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select required disabled={!selectedClientId} className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg bg-white disabled:bg-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                        value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)}>
                        <option value="">Selecione o Veículo...</option>
                        {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.modelo} - {v.placa}</option>)}
                    </select>
                </div>
            </div>
            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Quilometragem Atual (KM)</label>
                <input required type="number" min="0" className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Ex: 50000"
                    value={kmNoServico} onChange={e => setKmNoServico(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Serviços */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h4 className="text-sm font-black text-blue-800 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <Wrench size={16}/> Serviços
                </h4>
                <div className="flex flex-col gap-2 mb-3">
                    <input type="text" placeholder="Nome do Serviço (ex: Mão de Obra)" 
                        className="w-full p-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                        value={tempServiceName} onChange={e => setTempServiceName(e.target.value)} />
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                            <input type="number" placeholder="0,00" min="0" step="0.01" 
                                className="w-full pl-8 p-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none font-bold text-slate-700"
                                value={tempServiceValue} onChange={e => setTempServiceValue(Number(e.target.value))} />
                        </div>
                        <button type="button" onClick={handleAddService} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 font-bold shadow-md shadow-blue-200">
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {selectedServices.map((s, i) => (
                        <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm group">
                            <span className="font-medium text-slate-700 text-sm truncate">{s.nome}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-blue-700 text-sm">R$ {s.valor.toFixed(2)}</span>
                                <button type="button" onClick={() => handleRemoveService(i)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {selectedServices.length === 0 && <p className="text-xs text-blue-400 text-center py-2 italic">Nenhum serviço adicionado.</p>}
                </div>
            </div>

            {/* Peças */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <FileText size={16}/> Peças
                </h4>
                <div className="flex flex-col gap-2 mb-3">
                    <select className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-400 outline-none" 
                        value={tempPartId} onChange={handlePartSelectChange}>
                        <option value="">Escolher peça do estoque...</option>
                        {inventory.map(p => <option key={p.id} value={p.id} disabled={p.quantidadeAtual===0}>{p.nomePeca} (Disp: {p.quantidadeAtual})</option>)}
                    </select>
                    <div className="flex gap-2">
                        <div className="w-20">
                            <input type="number" min="1" className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none text-center font-bold" 
                                placeholder="Qtd" value={tempQty} onChange={e => setTempQty(Number(e.target.value))} />
                        </div>
                        <div className="relative flex-1">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                            <input 
                                type="number" min="0" step="0.01" 
                                className="w-full pl-8 p-2 border border-slate-300 rounded-lg text-sm outline-none font-bold text-slate-700" 
                                value={tempPartPrice} onChange={e => setTempPartPrice(Number(e.target.value))} 
                                placeholder="Preço"
                            />
                        </div>
                        <button type="button" onClick={handleAddPart} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800 font-bold shadow-md shadow-slate-300">
                             <Plus size={16} />
                        </button>
                    </div>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {selectedParts.map((p, i) => (
                        <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm group">
                            <span className="font-medium text-slate-700 text-sm truncate">{p.quantidade}x {p.nomePeca}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-700 text-sm">R$ {(p.valorUnitarioSnapshot * p.quantidade).toFixed(2)}</span>
                                <button type="button" onClick={() => handleRemovePart(i)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {selectedParts.length === 0 && <p className="text-xs text-slate-400 text-center py-2 italic">Nenhuma peça adicionada.</p>}
                </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-2">
             <label className="block text-sm font-medium text-slate-700 mb-1">Observações / Descrição</label>
             <textarea 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm bg-amber-50/30"
                rows={2}
                placeholder="Detalhes adicionais, problemas relatados pelo cliente, etc..."
                value={tempNotes}
                onChange={e => setTempNotes(e.target.value)}
             />
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
             <div>
                 <p className="text-xs font-bold text-slate-400 uppercase">Valor Total</p>
                 <p className="text-3xl font-black text-brand-600 tracking-tight">{formatCurrency(calculateTempTotal())}</p>
             </div>
             <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">Cancelar</button>
                <button type="submit" disabled={!selectedClientId || !selectedVehicleId} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 flex items-center gap-2 shadow-lg shadow-brand-500/30 font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:shadow-none">
                    <CheckCircle size={20} /> Finalizar OS
                </button>
             </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};