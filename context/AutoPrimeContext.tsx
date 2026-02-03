import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Client, Vehicle, Part, ServiceOrder, Log, Alert, MaintenanceRule, DashboardMetrics, Transaction } from '../types';

interface AutoPrimeContextData {
  clients: Client[];
  vehicles: Vehicle[];
  inventory: Part[];
  serviceOrders: ServiceOrder[];
  maintenanceRules: MaintenanceRule[];
  logs: Log[];
  alerts: Alert[];
  metrics: DashboardMetrics;
  transactions: Transaction[];
  currentView: string;
  setCurrentView: (view: string) => void;

  // Actions
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'ativo'>) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'kmAtual' | 'historicoKm' | 'dataProximaManutencao'>) => void;
  updateVehicle: (id: string, data: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  addPart: (part: Omit<Part, 'id'>) => void;
  updatePart: (id: string, data: Partial<Part>) => void;
  deletePart: (id: string) => void;

  addMaintenanceRule: (rule: Omit<MaintenanceRule, 'id'>) => void;
  updateMaintenanceRule: (id: string, data: Partial<MaintenanceRule>) => void;
  deleteMaintenanceRule: (id: string) => void;

  addServiceOrder: (os: Omit<ServiceOrder, 'id' | 'valorTotal' | 'status'>) => void;
  deleteServiceOrder: (id: string) => void;
  
  // Financial Actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  
  // PDF
  generateOSPDF: (osId: string) => void;
}

const AutoPrimeContext = createContext<AutoPrimeContextData>({} as AutoPrimeContextData);

export const useAutoPrime = () => useContext(AutoPrimeContext);

// --- UTILITÁRIOS ---
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try { return crypto.randomUUID(); } catch (e) {}
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

const getInitialState = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`autoprime_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (error) { return fallback; }
};

export const AutoPrimeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  // --- STATE (DATA-BRAIN STORAGE) ---
  const [clients, setClients] = useState<Client[]>(() => getInitialState('clients', []));
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => getInitialState('vehicles', []));
  const [inventory, setInventory] = useState<Part[]>(() => getInitialState('inventory', []));
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(() => getInitialState('serviceOrders', []));
  const [maintenanceRules, setMaintenanceRules] = useState<MaintenanceRule[]>(() => getInitialState('maintenanceRules', []));
  const [transactions, setTransactions] = useState<Transaction[]>(() => getInitialState('transactions', []));
  const [logs, setLogs] = useState<Log[]>(() => getInitialState('logs', []));
  const [currentView, setCurrentView] = useState<string>(() => getInitialState('currentView', 'dashboard'));
  
  // Seed inicial para regras se estiver vazio
  useEffect(() => {
    if (maintenanceRules.length === 0) {
        setMaintenanceRules([
            { id: 'rule-1', nomeServico: 'Troca de Óleo', intervaloMeses: 6 },
            { id: 'rule-2', nomeServico: 'Alinhamento', intervaloMeses: 12 },
            { id: 'rule-3', nomeServico: 'Correia Dentada', intervaloMeses: 36 }
        ]);
    }
  }, []);

  // --- PERSISTÊNCIA ---
  useEffect(() => { localStorage.setItem('autoprime_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('autoprime_vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('autoprime_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('autoprime_serviceOrders', JSON.stringify(serviceOrders)); }, [serviceOrders]);
  useEffect(() => { localStorage.setItem('autoprime_maintenanceRules', JSON.stringify(maintenanceRules)); }, [maintenanceRules]);
  useEffect(() => { localStorage.setItem('autoprime_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('autoprime_logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('autoprime_currentView', JSON.stringify(currentView)); }, [currentView]);

  const addLog = (acao: Log['acao'], entidade: Log['entidade'], detalhes: string) => {
    const newLog: Log = { id: Date.now().toString(), timestamp: new Date().toISOString(), acao, entidade, detalhes };
    setLogs(prev => [newLog, ...prev]);
  };

  // --- ENGINE DE CÁLCULO (BRAIN) ---
  
  // 1. Alertas Derivados
  const alerts = useMemo(() => {
    const newAlerts: Alert[] = [];
    const today = new Date();

    // Estoque
    inventory.forEach(part => {
      if (part.quantidadeAtual < part.quantidadeMinima) {
        newAlerts.push({
          id: `stock-${part.id}`,
          type: 'ESTOQUE',
          severity: 'critical',
          message: `Estoque Baixo: ${part.nomePeca} (${part.quantidadeAtual}/${part.quantidadeMinima})`
        });
      }
    });

    // Manutenção Inteligente
    vehicles.forEach(vehicle => {
      const client = clients.find(c => c.id === vehicle.clienteId);
      
      maintenanceRules.forEach(rule => {
        if (rule.veiculoId && rule.veiculoId !== vehicle.id) {
            return;
        }

        const lastOS = serviceOrders
          .filter(os => os.veiculoId === vehicle.id && os.status === 'CONCLUIDA' && os.servicos.some(s => s.nome === rule.nomeServico))
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];

        let baseDateStr = lastOS ? lastOS.data : vehicle.dataUltimaManutencao;
        if (!baseDateStr) baseDateStr = new Date().toISOString();

        const baseDate = new Date(baseDateStr);
        const nextDate = new Date(baseDate);
        nextDate.setMonth(baseDate.getMonth() + rule.intervaloMeses);

        const diffTime = nextDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          newAlerts.push({
            id: `maint-crit-${vehicle.id}-${rule.id}`,
            type: 'MANUTENCAO',
            severity: 'critical',
            message: `${rule.nomeServico} VENCIDO - ${vehicle.modelo} (${vehicle.placa})`,
            veiculoId: vehicle.id,
            regraId: rule.id,
            clientName: client ? client.nome : 'Cliente Desconhecido',
            clientPhone: client ? client.telefone : ''
          });
        } else if (diffDays <= 30) {
          newAlerts.push({
            id: `maint-warn-${vehicle.id}-${rule.id}`,
            type: 'MANUTENCAO',
            severity: 'warning',
            message: `${rule.nomeServico} vence em ${diffDays} dias - ${vehicle.modelo}`,
            veiculoId: vehicle.id,
            regraId: rule.id,
            clientName: client ? client.nome : 'Cliente Desconhecido',
            clientPhone: client ? client.telefone : ''
          });
        }
      });
    });

    return newAlerts;
  }, [inventory, vehicles, maintenanceRules, serviceOrders, clients]);

  // 2. Métricas Derivadas
  const metrics = useMemo<DashboardMetrics>(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const osConcluidas = serviceOrders.filter(os => os.status === 'CONCLUIDA');
    const faturamentoTotal = osConcluidas.reduce((acc, os) => acc + os.valorTotal, 0);
    
    const faturamentoMes = osConcluidas
      .filter(os => {
        const d = new Date(os.data);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, os) => acc + os.valorTotal, 0);

    const serviceMap: Record<string, number> = {};
    osConcluidas.forEach(os => {
      os.servicos.forEach(s => {
        serviceMap[s.nome] = (serviceMap[s.nome] || 0) + 1;
      });
    });

    const topServicos = Object.entries(serviceMap)
      .map(([nome, qtd]) => ({ nome, qtd }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 5);

    return {
      faturamentoTotal,
      faturamentoMes,
      osAbertas: serviceOrders.filter(os => os.status === 'ABERTA').length,
      osConcluidas: osConcluidas.length,
      ticketMedio: osConcluidas.length ? faturamentoTotal / osConcluidas.length : 0,
      topServicos
    };
  }, [serviceOrders]);


  // --- ACTIONS ---

  // Clients
  const addClient = (data: Omit<Client, 'id' | 'createdAt' | 'ativo'>) => {
    const newClient: Client = { ...data, id: generateUUID(), createdAt: new Date().toISOString(), ativo: true };
    setClients(prev => [...prev, newClient]);
    addLog('CRIACAO', 'CLIENTE', `Cliente ${newClient.nome} criado.`);
  };
  const updateClient = (id: string, data: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    addLog('EDICAO', 'CLIENTE', `Cliente ${id} editado.`);
  };
  const deleteClient = (id: string) => {
    const linkedVehicles = vehicles.filter(v => v.clienteId === id).map(v => v.id);
    setServiceOrders(prev => prev.filter(os => !linkedVehicles.includes(os.veiculoId)));
    setVehicles(prev => prev.filter(v => v.clienteId !== id));
    setClients(prev => prev.filter(c => c.id !== id));
    addLog('EXCLUSAO', 'CLIENTE', `Cliente ${id} removido.`);
  };

  // Vehicles
  const addVehicle = (data: Omit<Vehicle, 'id' | 'kmAtual' | 'historicoKm' | 'dataProximaManutencao'>) => {
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 6); // Default 6 meses

    const newVehicle: Vehicle = { 
      ...data, 
      id: generateUUID(), 
      kmAtual: data.kmEntrada, 
      dataProximaManutencao: nextDate.toISOString(),
      historicoKm: [{ data: new Date().toISOString(), km: data.kmEntrada, origem: 'Cadastro' }] 
    };
    setVehicles(prev => [...prev, newVehicle]);
    addLog('CRIACAO', 'VEICULO', `Veículo ${newVehicle.placa} criado.`);
  };
  const updateVehicle = (id: string, data: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
    addLog('EDICAO', 'VEICULO', `Veículo ${id} editado.`);
  };
  const deleteVehicle = (id: string) => {
    setServiceOrders(prev => prev.filter(os => os.veiculoId !== id));
    setVehicles(prev => prev.filter(v => v.id !== id));
    addLog('EXCLUSAO', 'VEICULO', `Veículo ${id} removido.`);
  };

  // Financial Actions
  const addTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...data, id: generateUUID() };
    setTransactions(prev => [...prev, newTransaction]);
    addLog('CRIACAO', 'FINANCEIRO', `${data.tipo}: ${data.descricao} (R$ ${data.valor})`);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    addLog('EXCLUSAO', 'FINANCEIRO', `Transação ${id} removida.`);
  };

  // Parts (Integrado com Financeiro)
  const addPart = (data: Omit<Part, 'id'>) => {
    const newPartId = generateUUID();
    const custoTotal = data.quantidadeAtual * data.valorUnitario;
    
    setInventory(prev => [...prev, { ...data, id: newPartId }]);
    
    // Gera despesa automática de compra de estoque
    if (custoTotal > 0) {
        addTransaction({
            descricao: `Compra Estoque: ${data.nomePeca}`,
            tipo: 'DESPESA',
            valor: custoTotal,
            data: new Date().toISOString(),
            categoria: 'ESTOQUE',
            referenciaId: newPartId
        });
    }

    addLog('CRIACAO', 'ESTOQUE', `Peça ${data.nomePeca} adicionada.`);
  };

  const updatePart = (id: string, data: Partial<Part>) => {
    setInventory(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };
  const deletePart = (id: string) => {
    setInventory(prev => prev.filter(p => p.id !== id));
    // Opcional: Remover transações de compra ligadas a esta peça? 
    // Por segurança financeira, melhor manter o histórico de que gastou, mesmo se apagou a peça.
    addLog('EXCLUSAO', 'ESTOQUE', `Peça ${id} removida.`);
  };

  // Maintenance Rules
  const addMaintenanceRule = (data: Omit<MaintenanceRule, 'id'>) => {
    setMaintenanceRules(prev => [...prev, { ...data, id: generateUUID() }]);
    addLog('CRIACAO', 'REGRA', `Regra ${data.nomeServico} criada.`);
  };
  const updateMaintenanceRule = (id: string, data: Partial<MaintenanceRule>) => {
    setMaintenanceRules(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    addLog('EDICAO', 'REGRA', `Regra ${id} editada.`);
  };
  const deleteMaintenanceRule = (id: string) => {
    setMaintenanceRules(prev => prev.filter(r => r.id !== id));
    addLog('EXCLUSAO', 'REGRA', `Regra ${id} removida.`);
  };

  // Service Orders (Integrado com Financeiro)
  const addServiceOrder = (data: Omit<ServiceOrder, 'id' | 'valorTotal' | 'status'>) => {
    const totalPecas = data.pecasUsadas.reduce((acc, p) => acc + (p.quantidade * p.valorUnitarioSnapshot), 0);
    const totalServicos = data.servicos.reduce((acc, s) => acc + s.valor, 0);
    const total = totalPecas + totalServicos;

    const newOS: ServiceOrder = {
      ...data,
      id: generateUUID(),
      valorTotal: total,
      status: 'CONCLUIDA'
    };

    setServiceOrders(prev => [...prev, newOS]);

    // Baixa de Estoque
    setInventory(prev => prev.map(part => {
      const used = data.pecasUsadas.find(u => u.partId === part.id);
      return used ? { ...part, quantidadeAtual: part.quantidadeAtual - used.quantidade } : part;
    }));

    // Atualiza Veículo
    setVehicles(prev => prev.map(v => {
      if (v.id === data.veiculoId) {
        const nextDate = new Date(data.data);
        nextDate.setMonth(nextDate.getMonth() + 6);

        const newKm = Math.max(v.kmAtual, data.kmNoServico);
        return {
          ...v,
          kmAtual: newKm,
          dataUltimaManutencao: data.data,
          dataProximaManutencao: nextDate.toISOString(),
          historicoKm: [...v.historicoKm, { data: data.data, km: data.kmNoServico, origem: `OS #${newOS.id.slice(0,4)}` }]
        };
      }
      return v;
    }));
    
    // Gera Receita Automática
    addTransaction({
        descricao: `Receita OS #${newOS.id.slice(0,8)}`,
        tipo: 'RECEITA',
        valor: total,
        data: data.data,
        categoria: 'OS',
        referenciaId: newOS.id
    });

    addLog('CRIACAO', 'OS', `OS ${newOS.id} gerada. Valor: ${total}`);
  };

  const deleteServiceOrder = (id: string) => {
    setServiceOrders(prev => prev.filter(os => os.id !== id));
    // Remove também a transação financeira associada para manter coerência
    setTransactions(prev => prev.filter(t => t.referenciaId !== id));
    addLog('EXCLUSAO', 'OS', `OS ${id} removida.`);
  };

  const generateOSPDF = (osId: string) => {
    const os = serviceOrders.find(o => o.id === osId);
    if (!os) return;
    const client = clients.find(c => c.id === os.clienteId);
    const vehicle = vehicles.find(v => v.id === os.veiculoId);

    const printContent = `
      <html>
        <head>
          <title>Ordem de Serviço #${os.id.slice(0, 8)}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Yellowtail&display=swap');
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #003366; padding-bottom: 20px; background: #f8fafc; padding-top: 20px; }
            .brand-name { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 5px; }
            .prime { font-family: 'Montserrat', sans-serif; font-weight: 900; font-style: italic; font-size: 32px; color: #003366; }
            .car { font-family: 'Yellowtail', cursive; font-size: 38px; color: #d97706; }
            .subtitle { font-size: 14px; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 1px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .box { background: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #003366; color: white; }
            .total { text-align: right; margin-top: 20px; font-size: 1.4em; font-weight: bold; color: #003366; }
            .notes { margin-top: 30px; background: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 4px; }
            .footer { margin-top: 50px; text-align: center; font-size: 0.8em; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand-name">
                <span class="prime">PRIME</span>
                <span class="car">Car</span>
            </div>
            <div class="subtitle">Mecânica do Dênis</div>
            <p style="margin-top: 10px; font-size: 14px; color: #666;">Ordem de Serviço: <strong>${os.id}</strong></p>
            <p style="font-size: 12px;">Data: ${new Date(os.data).toLocaleDateString()} | Status: ${os.status}</p>
          </div>

          <div class="info-grid">
            <div class="box">
              <h3>Cliente</h3>
              <p><strong>Nome:</strong> ${client?.nome || 'N/A'}</p>
              <p><strong>Tel:</strong> ${client?.telefone || 'N/A'}</p>
              <p><strong>Email:</strong> ${client?.email || 'N/A'}</p>
            </div>
            <div class="box">
              <h3>Veículo</h3>
              <p><strong>Modelo:</strong> ${vehicle?.modelo || 'N/A'}</p>
              <p><strong>Placa:</strong> ${vehicle?.placa || 'N/A'}</p>
              <p><strong>KM no Serviço:</strong> ${os.kmNoServico}</p>
            </div>
          </div>

          <h3>Serviços Realizados</h3>
          <table>
            <thead><tr><th>Serviço</th><th>Valor</th></tr></thead>
            <tbody>
              ${os.servicos.map(s => `<tr><td>${s.nome}</td><td>R$ ${s.valor.toFixed(2)}</td></tr>`).join('')}
              ${os.servicos.length === 0 ? '<tr><td colspan="2">Nenhum serviço listado</td></tr>' : ''}
            </tbody>
          </table>

          <h3>Peças Utilizadas</h3>
          <table>
            <thead><tr><th>Peça</th><th>Qtd</th><th>Unit.</th><th>Total</th></tr></thead>
            <tbody>
              ${os.pecasUsadas.map(p => `
                <tr>
                  <td>${p.nomePeca}</td>
                  <td>${p.quantidade}</td>
                  <td>R$ ${p.valorUnitarioSnapshot.toFixed(2)}</td>
                  <td>R$ ${(p.quantidade * p.valorUnitarioSnapshot).toFixed(2)}</td>
                </tr>`).join('')}
               ${os.pecasUsadas.length === 0 ? '<tr><td colspan="4">Nenhuma peça utilizada</td></tr>' : ''}
            </tbody>
          </table>

          ${os.notas ? `
            <div class="notes">
                <h3>Observações / Relato</h3>
                <p>${os.notas}</p>
            </div>
          ` : ''}

          <div class="total">
            Valor Total: R$ ${os.valorTotal.toFixed(2)}
          </div>

          <div class="footer">
            <p>_____________________________________</p>
            <p>Assinatura do Cliente</p>
            <p>PRIME Car - Mecânica do Dênis</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    const win = window.open('', '', 'height=700,width=900');
    if (win) {
      win.document.write(printContent);
      win.document.close();
    }
  };

  return (
    <AutoPrimeContext.Provider value={{
      clients, vehicles, inventory, serviceOrders, maintenanceRules, logs, alerts, metrics, transactions, currentView,
      setCurrentView,
      addClient, updateClient, deleteClient,
      addVehicle, updateVehicle, deleteVehicle,
      addPart, updatePart, deletePart,
      addMaintenanceRule, updateMaintenanceRule, deleteMaintenanceRule,
      addServiceOrder, deleteServiceOrder,
      addTransaction, deleteTransaction,
      generateOSPDF
    }}>
      {children}
    </AutoPrimeContext.Provider>
  );
};