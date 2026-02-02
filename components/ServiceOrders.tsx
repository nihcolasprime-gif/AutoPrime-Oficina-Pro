import React, { useState, useMemo } from 'react';
import { useAutoPrime } from '../context/AutoPrimeContext';
import { Modal } from './ui/Modal';
import { Plus, Trash2, FileText, CheckCircle } from 'lucide-react';
import { UsedPart } from '../types';

export const ServiceOrders = () => {
  const { 
    serviceOrders, clients, vehicles, inventory, 
    addServiceOrder, deleteServiceOrder 
  } = useAutoPrime();

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // OS Creation Form State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedParts, setSelectedParts] = useState<UsedPart[]>([]);
  
  // Temporary part selection in form
  const [tempPartId, setTempPartId] = useState('');
  const [tempQty, setTempQty] = useState(1);

  // Derived state for the form
  const availableVehicles = useMemo(() => 
    vehicles.filter(v => v.clienteId === selectedClientId),
  [selectedClientId, vehicles]);

  const resetForm = () => {
    setSelectedClientId('');
    setSelectedVehicleId('');
    setSelectedParts([]);
    setTempPartId('');
    setTempQty(1);
  };

  const handleAddPart = () => {
    if (!tempPartId || tempQty <= 0) return;
    
    const partInInventory = inventory.find(p => p.id === tempPartId);
    if (!partInInventory) return;

    if (partInInventory.quantidadeAtual < tempQty) {
        alert(`Estoque insuficiente! Disponível: ${partInInventory.quantidadeAtual}`);
        return;
    }

    const newUsedPart: UsedPart = {
        partId: partInInventory.id,
        nomePeca: partInInventory.nomePeca,
        quantidade: tempQty,
        valorUnitarioSnapshot: partInInventory.valorUnitario
    };

    setSelectedParts([...selectedParts, newUsedPart]);
    setTempPartId('');
    setTempQty(1);
  };

  const handleRemovePart = (index: number) => {
    setSelectedParts(selectedParts.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !selectedVehicleId) return;

    addServiceOrder({
        clienteId: selectedClientId,
        veiculoId: selectedVehicleId,
        pecasUsadas: selectedParts,
        data: new Date().toISOString(),
        status: 'CONCLUIDA' // Simplified logic: OS created is immediately done/logged
    });

    setIsModalOpen(false);
    resetForm();
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.nome || '---';
  const getVehicleModel = (id: string) => vehicles.find(v => v.id === id)?.modelo || '---';

  const calculateTempTotal = () => {
      return selectedParts.reduce((acc, p) => acc + (p.quantidade * p.valorUnitarioSnapshot), 0);
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
            serviceOrders.map(os => (
                <div key={os.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 pb-4 border-b border-slate-100">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                                    {os.status}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {new Date(os.data).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">
                                {getVehicleModel(os.veiculoId)} <span className="font-normal text-slate-500">de</span> {getClientName(os.clienteId)}
                            </h3>
                        </div>
                        <div className="mt-4 md:mt-0 text-right">
                             <p className="text-xs text-slate-400">Valor Total</p>
                             <p className="text-2xl font-bold text-brand-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(os.valorTotal)}
                             </p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm font-medium text-slate-700 mb-2">Peças Utilizadas:</p>
                        <ul className="text-sm text-slate-600 space-y-1">
                            {os.pecasUsadas.length > 0 ? os.pecasUsadas.map((part, idx) => (
                                <li key={idx} className="flex justify-between border-b border-slate-50 py-1 last:border-0">
                                    <span>{part.quantidade}x {part.nomePeca}</span>
                                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(part.valorUnitarioSnapshot * part.quantidade)}</span>
                                </li>
                            )) : (
                                <li className="italic text-slate-400">Apenas mão de obra (ou sem peças registradas)</li>
                            )}
                        </ul>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button 
                            onClick={() => {
                                if(window.confirm('Excluir este registro? O estoque NÃO será reposto.')) {
                                    deleteServiceOrder(os.id);
                                }
                            }}
                            className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                        >
                            <Trash2 size={16} /> Excluir Registro
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>

      {/* NEW OS MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Nova Ordem de Serviço"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SELECTION STEP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                <select 
                    required
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 bg-white"
                    value={selectedClientId}
                    onChange={e => {
                        setSelectedClientId(e.target.value);
                        setSelectedVehicleId(''); // Reset vehicle when client changes
                    }}
                >
                    <option value="">Selecione...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Veículo</label>
                <select 
                    required
                    disabled={!selectedClientId}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 bg-white disabled:bg-slate-100"
                    value={selectedVehicleId}
                    onChange={e => setSelectedVehicleId(e.target.value)}
                >
                    <option value="">Selecione...</option>
                    {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.modelo} - {v.placa}</option>)}
                </select>
            </div>
          </div>

          {/* PARTS SELECTION */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <FileText size={16} /> Adicionar Peças
            </h4>
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <select 
                    className="flex-1 p-2 border border-slate-300 rounded text-sm"
                    value={tempPartId}
                    onChange={e => setTempPartId(e.target.value)}
                >
                    <option value="">Escolher peça...</option>
                    {inventory.map(p => (
                        <option key={p.id} value={p.id} disabled={p.quantidadeAtual === 0}>
                            {p.nomePeca} (R$ {p.valorUnitario}) - Disp: {p.quantidadeAtual}
                        </option>
                    ))}
                </select>
                <input 
                    type="number" 
                    min="1" 
                    className="w-20 p-2 border border-slate-300 rounded text-sm"
                    value={tempQty}
                    onChange={e => setTempQty(Number(e.target.value))}
                />
                <button 
                    type="button" 
                    onClick={handleAddPart}
                    className="bg-brand-600 text-white px-3 py-2 rounded text-sm hover:bg-brand-700"
                >
                    Adicionar
                </button>
            </div>

            {/* Selected Parts List */}
            {selectedParts.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedParts.map((part, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200 text-sm">
                            <span>{part.quantidade}x {part.nomePeca}</span>
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-slate-600">
                                    R$ {(part.valorUnitarioSnapshot * part.quantidade).toFixed(2)}
                                </span>
                                <button type="button" onClick={() => handleRemovePart(idx)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* TOTAL & SUBMIT */}
          <div className="flex items-center justify-between border-t pt-4">
             <div>
                 <p className="text-sm text-slate-500">Total Estimado</p>
                 <p className="text-2xl font-bold text-brand-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTempTotal())}
                 </p>
             </div>
             <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    disabled={!selectedClientId || !selectedVehicleId}
                    className="px-6 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <CheckCircle size={18} /> Finalizar OS
                </button>
             </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};