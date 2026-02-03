import React, { useState, useMemo } from 'react';
import { useAutoPrime } from '../context/AutoPrimeContext';
import { Modal } from './ui/Modal';
import { Plus, Trash2, FileText, CheckCircle, Printer, Wrench } from 'lucide-react';
import { UsedPart, ServiceItem } from '../types';

export const ServiceOrders = () => {
  const { 
    serviceOrders, clients, vehicles, inventory, 
    addServiceOrder, deleteServiceOrder, generateOSPDF 
  } = useAutoPrime();

  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
  const [tempServiceName, setTempServiceName] = useState('');
  const [tempServiceValue, setTempServiceValue] = useState(0);

  const availableVehicles = useMemo(() => 
    vehicles.filter(v => v.clienteId === selectedClientId),
  [selectedClientId, vehicles]);

  const resetForm = () => {
    setSelectedClientId('');
    setSelectedVehicleId('');
    setKmNoServico(0);
    setTempNotes('');
    setSelectedParts([]);
    setSelectedServices([]);
    setTempPartId('');
    setTempQty(1);
    setTempServiceName('');
    setTempServiceValue(0);
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
        valorUnitarioSnapshot: part.valorUnitario
    }]);
    setTempPartId('');
    setTempQty(1);
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

  const getClientName = (id: string) => clients.find(c => c.id === id)?.nome || '---';
  const getVehicleInfo = (id: string) => {
      const v = vehicles.find(v => v.id === id);
      return v ? `${v.modelo} (${v.placa})` : '---';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Ordens de Serviço</h1>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }} 
          disabled={clients.length === 0 || vehicles.length === 0}
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Nova OS
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {serviceOrders.length === 0 ? (
             <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                Nenhuma Ordem de Serviço registrada.
            </div>
        ) : (
            serviceOrders.slice().reverse().map(os => (
                <div key={os.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 pb-4 border-b border-slate-100">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                                    {os.status}
                                </span>
                                <span className="text-xs text-slate-500 font-mono">#{os.id.slice(0,8)}</span>
                                <span className="text-xs text-slate-400">
                                    {new Date(os.data).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">
                                {getVehicleInfo(os.veiculoId)} <span className="font-normal text-slate-500">de</span> {getClientName(os.clienteId)}
                            </h3>
                        </div>
                        <div className="mt-4 md:mt-0 text-right">
                             <p className="text-xs text-slate-400">Valor Total</p>
                             <p className="text-2xl font-bold text-brand-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(os.valorTotal)}
                             </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Serviços</p>
                            <ul className="text-sm text-slate-600 space-y-1">
                                {os.servicos.map((s, idx) => (
                                    <li key={idx} className="flex justify-between border-b border-slate-50 py-1">
                                        <span>{s.nome}</span>
                                        <span>R$ {s.valor.toFixed(2)}</span>
                                    </li>
                                ))}
                                {os.servicos.length === 0 && <li className="italic text-slate-400">Nenhum serviço registrado</li>}
                            </ul>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Peças</p>
                            <ul className="text-sm text-slate-600 space-y-1">
                                {os.pecasUsadas.map((p, idx) => (
                                    <li key={idx} className="flex justify-between border-b border-slate-50 py-1">
                                        <span>{p.quantidade}x {p.nomePeca}</span>
                                        <span>R$ {(p.quantidade * p.valorUnitarioSnapshot).toFixed(2)}</span>
                                    </li>
                                ))}
                                {os.pecasUsadas.length === 0 && <li className="italic text-slate-400">Nenhuma peça utilizada</li>}
                            </ul>
                        </div>
                    </div>

                    {os.notas && (
                        <div className="mb-4 p-3 bg-amber-50 rounded border border-amber-100">
                            <p className="text-xs font-bold text-amber-800 uppercase mb-1">Observações</p>
                            <p className="text-sm text-slate-700 italic">{os.notas}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button 
                            onClick={() => generateOSPDF(os.id)}
                            className="text-brand-600 hover:text-brand-800 text-sm flex items-center gap-1 bg-brand-50 px-3 py-1 rounded"
                        >
                            <Printer size={16} /> Imprimir OS
                        </button>
                        <button 
                            onClick={() => {
                                if(window.confirm('Excluir este registro? O estoque NÃO será reposto.')) {
                                    deleteServiceOrder(os.id);
                                }
                            }}
                            className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 px-3 py-1"
                        >
                            <Trash2 size={16} /> Excluir
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>

      {/* NEW OS MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Ordem de Serviço">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                <select required className="w-full p-2 border border-slate-300 rounded bg-white"
                    value={selectedClientId} onChange={e => { setSelectedClientId(e.target.value); setSelectedVehicleId(''); }}>
                    <option value="">Selecione...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Veículo</label>
                <select required disabled={!selectedClientId} className="w-full p-2 border border-slate-300 rounded bg-white disabled:bg-slate-100"
                    value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)}>
                    <option value="">Selecione...</option>
                    {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.modelo} - {v.placa}</option>)}
                </select>
            </div>
            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">KM Atual do Veículo</label>
                <input required type="number" min="0" className="w-full p-2 border border-slate-300 rounded"
                    value={kmNoServico} onChange={e => setKmNoServico(Number(e.target.value))} />
            </div>
          </div>

          {/* Serviços */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2"><Wrench size={16}/> Serviços</h4>
            <div className="flex gap-2 mb-2">
                <input type="text" placeholder="Nome do Serviço" className="flex-1 p-2 border rounded text-sm"
                    value={tempServiceName} onChange={e => setTempServiceName(e.target.value)} />
                <input type="number" placeholder="R$" className="w-24 p-2 border rounded text-sm"
                    value={tempServiceValue} onChange={e => setTempServiceValue(Number(e.target.value))} />
                <button type="button" onClick={handleAddService} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Add</button>
            </div>
            <ul className="text-sm space-y-1">
                {selectedServices.map((s, i) => (
                    <li key={i} className="flex justify-between bg-white p-1 px-2 rounded border border-blue-100">
                        <span>{s.nome}</span><span>R$ {s.valor}</span>
                    </li>
                ))}
            </ul>
          </div>

          {/* Peças */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><FileText size={16}/> Peças</h4>
            <div className="flex gap-2 mb-2">
                <select className="flex-1 p-2 border rounded text-sm" value={tempPartId} onChange={e => setTempPartId(e.target.value)}>
                    <option value="">Escolher peça...</option>
                    {inventory.map(p => <option key={p.id} value={p.id} disabled={p.quantidadeAtual===0}>{p.nomePeca} (R${p.valorUnitario})</option>)}
                </select>
                <input type="number" min="1" className="w-16 p-2 border rounded text-sm" value={tempQty} onChange={e => setTempQty(Number(e.target.value))} />
                <button type="button" onClick={handleAddPart} className="bg-slate-600 text-white px-3 py-1 rounded text-sm">Add</button>
            </div>
            <ul className="text-sm space-y-1">
                {selectedParts.map((p, i) => (
                    <li key={i} className="flex justify-between bg-white p-1 px-2 rounded border border-slate-200">
                        <span>{p.quantidade}x {p.nomePeca}</span><span>R$ {p.valorUnitarioSnapshot * p.quantidade}</span>
                    </li>
                ))}
            </ul>
          </div>

          <div className="border-t border-slate-100 pt-2">
             <label className="block text-sm font-medium text-slate-700 mb-1">Observações / Descrição</label>
             <textarea 
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                rows={3}
                placeholder="Detalhes adicionais, problemas relatados pelo cliente, etc..."
                value={tempNotes}
                onChange={e => setTempNotes(e.target.value)}
             />
          </div>

          <div className="flex items-center justify-between border-t pt-4">
             <div><p className="text-sm text-slate-500">Total</p><p className="text-2xl font-bold text-brand-600">R$ {calculateTempTotal().toFixed(2)}</p></div>
             <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
                <button type="submit" disabled={!selectedClientId || !selectedVehicleId} className="px-6 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 flex items-center gap-2">
                    <CheckCircle size={18} /> Finalizar
                </button>
             </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};