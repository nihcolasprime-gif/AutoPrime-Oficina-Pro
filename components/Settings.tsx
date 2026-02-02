import React, { useState } from 'react';
import { useAutoPrime } from '../context/AutoPrimeContext';
import { Save, Trash2, AlertTriangle, Settings as SettingsIcon, Plus, Info } from 'lucide-react';
import { MaintenanceRule } from '../types';

export const Settings = () => {
  const { maintenanceRules, addMaintenanceRule, updateMaintenanceRule, deleteMaintenanceRule } = useAutoPrime();
  const [newRule, setNewRule] = useState({ nomeServico: '', intervaloKm: 5000, avisoAntesKm: 500 });

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.nomeServico) return;
    addMaintenanceRule(newRule);
    setNewRule({ nomeServico: '', intervaloKm: 5000, avisoAntesKm: 500 });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <SettingsIcon className="text-slate-600" />
            Configurações & Inteligência
        </h1>
        <p className="text-slate-500 mt-2">
            Configure o "Cérebro" do sistema. Estas regras determinam quando os alertas de manutenção são gerados automaticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário de Nova Regra */}
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 sticky top-4">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-brand-600" /> Nova Regra
                </h2>
                <form onSubmit={handleAddRule} className="space-y-4">
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
                        <label className="block text-sm font-medium text-slate-700 mb-1">Intervalo (KM)</label>
                        <input 
                            type="number" 
                            required
                            min="100"
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
                            value={newRule.intervaloKm}
                            onChange={e => setNewRule({...newRule, intervaloKm: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Alertar antes de (KM)</label>
                        <input 
                            type="number" 
                            required
                            min="0"
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
                            value={newRule.avisoAntesKm}
                            onChange={e => setNewRule({...newRule, avisoAntesKm: Number(e.target.value)})}
                        />
                    </div>
                    <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-lg transition-colors flex justify-center items-center gap-2">
                        <Save size={18} /> Salvar Regra
                    </button>
                </form>
            </div>
        </div>

        {/* Lista de Regras */}
        <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Regras Ativas ({maintenanceRules.length})</h2>
            
            {maintenanceRules.length === 0 ? (
                <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center text-slate-500">
                    Nenhuma regra definida. O sistema não gerará alertas de manutenção.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {maintenanceRules.map(rule => (
                        <div key={rule.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">{rule.nomeServico}</h3>
                                <div className="flex gap-4 mt-1 text-sm text-slate-600">
                                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                        <SettingsIcon size={14} /> Intervalo: {rule.intervaloKm} km
                                    </span>
                                    <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded">
                                        <AlertTriangle size={14} /> Aviso: {rule.avisoAntesKm} km
                                    </span>
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
                    <p className="font-bold mb-1">Como funciona o cálculo:</p>
                    <p>O sistema cruza o histórico de Ordens de Serviço de cada veículo. Se um serviço com o nome exato (ex: "Troca de Óleo") foi realizado, ele soma o intervalo da regra à KM daquele serviço. Se o veículo exceder essa KM, um alerta é gerado.</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};