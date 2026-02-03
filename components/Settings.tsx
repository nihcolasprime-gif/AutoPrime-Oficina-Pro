import React, { useState } from 'react';
import { useAutoPrime } from '../context/AutoPrimeContext';
import { Save, Trash2, Calendar, Settings as SettingsIcon, Plus, Info, Clock, Car } from 'lucide-react';

export const Settings = () => {
  const { maintenanceRules, addMaintenanceRule, deleteMaintenanceRule, vehicles, clients } = useAutoPrime();
  const [newRule, setNewRule] = useState({ nomeServico: '', intervaloMeses: 6, veiculoId: '' });

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.nomeServico) return;
    
    // Se veiculoId for string vazia, passamos undefined para indicar regra global (opcional)
    // Mas conforme pedido, o foco é especificar o veículo.
    const ruleToSave = {
        ...newRule,
        veiculoId: newRule.veiculoId || undefined
    };

    addMaintenanceRule(ruleToSave);
    setNewRule({ nomeServico: '', intervaloMeses: 6, veiculoId: '' });
  };

  const getVehicleLabel = (id?: string) => {
      if (!id) return 'Todos os Veículos (Global)';
      const v = vehicles.find(v => v.id === id);
      return v ? `${v.modelo} - ${v.placa}` : 'Veículo Desconhecido';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <SettingsIcon className="text-slate-600" />
            Configurações & Inteligência
        </h1>
        <p className="text-slate-500 mt-2">
            Configure o "Cérebro" do sistema. Defina o tempo de validade de cada serviço para um veículo específico.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário de Nova Regra */}
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 sticky top-4">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-brand-600" /> Nova Regra de Tempo
                </h2>
                <form onSubmit={handleAddRule} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Veículo Alvo</label>
                        <select 
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                            value={newRule.veiculoId}
                            onChange={e => setNewRule({...newRule, veiculoId: e.target.value})}
                        >
                            <option value="">Aplicar a Todos (Global)</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.modelo} - {v.placa}</option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-400 mt-1">Especifique qual veículo deve seguir esta regra.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Serviço</label>
                        <input 
                            type="text" 
                            required
                            placeholder="Ex: Troca de Óleo"
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
                            value={newRule.nomeServico}
                            onChange={e => setNewRule({...newRule, nomeServico: e.target.value})}
                        />
                        <p className="text-xs text-slate-400 mt-1">Deve ser idêntico ao usado nas OS.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Intervalo (Meses)</label>
                        <input 
                            type="number" 
                            required
                            min="1"
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
                            value={newRule.intervaloMeses}
                            onChange={e => setNewRule({...newRule, intervaloMeses: Number(e.target.value)})}
                        />
                        <p className="text-xs text-slate-400 mt-1">Ex: 6 para semestral, 12 para anual.</p>
                    </div>
                    
                    <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-lg transition-colors flex justify-center items-center gap-2">
                        <Save size={18} /> Salvar Regra
                    </button>
                </form>
            </div>
        </div>

        {/* Lista de Regras */}
        <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Regras de Validade Ativas ({maintenanceRules.length})</h2>
            
            {maintenanceRules.length === 0 ? (
                <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center text-slate-500">
                    Nenhuma regra definida. O sistema não gerará alertas de vencimento.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {maintenanceRules.map(rule => (
                        <div key={rule.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">{rule.nomeServico}</h3>
                                <div className="space-y-1 mt-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                                            <Clock size={16} /> A cada <strong>{rule.intervaloMeses} meses</strong>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                         <Car size={16} /> 
                                         <span className={rule.veiculoId ? "font-semibold text-brand-600" : "italic text-slate-400"}>
                                            {getVehicleLabel(rule.veiculoId)}
                                         </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button 
                                    onClick={() => deleteMaintenanceRule(rule.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    title="Excluir regra"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8 bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3">
                <Info className="text-blue-500 flex-shrink-0 mt-1" />
                <div className="text-sm text-blue-800">
                    <p className="font-bold mb-1">Como funciona:</p>
                    <p>Ao selecionar um veículo específico, esta regra de tempo só será aplicada a ele. Se deixar em "Todos", a regra será global para qualquer veículo que fizer este serviço.</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};