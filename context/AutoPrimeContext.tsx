import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Client, Vehicle, Part, ServiceOrder, Log, Alert, UsedPart } from '../types';

interface AutoPrimeContextData {
  clients: Client[];
  vehicles: Vehicle[];
  inventory: Part[];
  serviceOrders: ServiceOrder[];
  logs: Log[];
  alerts: Alert[];
  currentView: string;
  setCurrentView: (view: string) => void;

  // Actions
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'kmProximaManutencao'>) => void;
  updateVehicle: (id: string, data: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  addPart: (part: Omit<Part, 'id'>) => void;
  updatePart: (id: string, data: Partial<Part>) => void;
  deletePart: (id: string) => void;

  addServiceOrder: (os: Omit<ServiceOrder, 'id' | 'valorTotal'>) => void;
  deleteServiceOrder: (id: string) => void;
}

const AutoPrimeContext = createContext<AutoPrimeContextData>({} as AutoPrimeContextData);

export const useAutoPrime = () => useContext(AutoPrimeContext);

// --- UTILITÁRIOS ---

// Gerador de ID seguro que funciona em ambientes sem HTTPS/crypto
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fallback silencioso se crypto falhar
    }
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

// Helper para ler do LocalStorage de forma segura (Lazy Init)
// Garante que o estado nunca inicie vazio se houver dados persistidos
const getInitialState = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`autoprime_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Erro ao carregar chave ${key}`, error);
    return fallback;
  }
};

export const AutoPrimeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- STATE COM LAZY INITIALIZATION ---
  // Inicializa o estado DIRETAMENTE com os dados do LocalStorage.
  // Isso evita o "flash" de estado vazio e previne sobrescrita acidental.
  
  const [clients, setClients] = useState<Client[]>(() => 
    getInitialState('clients', [])
  );

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => 
    getInitialState('vehicles', [])
  );

  const [inventory, setInventory] = useState<Part[]>(() => 
    getInitialState('inventory', [])
  );

  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(() => 
    getInitialState('serviceOrders', [])
  );

  const [logs, setLogs] = useState<Log[]>(() => 
    getInitialState('logs', [])
  );

  const [currentView, setCurrentView] = useState<string>(() => 
    getInitialState('currentView', 'dashboard')
  );

  // --- EFEITOS DE PERSISTÊNCIA (SOMENTE ESCRITA) ---
  // Atualiza o LocalStorage sempre que o estado muda.
  // NUNCA lê do LocalStorage aqui para evitar re-hidratação de dados antigos.
  
  useEffect(() => {
    localStorage.setItem('autoprime_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('autoprime_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('autoprime_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('autoprime_serviceOrders', JSON.stringify(serviceOrders));
  }, [serviceOrders]);

  useEffect(() => {
    localStorage.setItem('autoprime_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('autoprime_currentView', JSON.stringify(currentView));
  }, [currentView]);

  // --- LOGS ---

  const addLog = (acao: Log['acao'], entidade: Log['entidade'], detalhes: string) => {
    const newLog: Log = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      acao,
      entidade,
      detalhes,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // --- ALERTAS (DERIVED STATE) ---
  // Calculado via useMemo para evitar loops de renderização.
  // Não usa useState para armazenar alertas.

  const alerts = useMemo(() => {
    const newAlerts: Alert[] = [];

    // Alertas de Estoque
    inventory.forEach(part => {
      if (part.quantidadeAtual < part.quantidadeMinima) {
        newAlerts.push({
          id: `stock-${part.id}`,
          type: 'ESTOQUE',
          severity: 'critical',
          message: `Baixo estoque: ${part.nomePeca} (Atual: ${part.quantidadeAtual}, Mín: ${part.quantidadeMinima})`,
          entityId: part.id
        });
      } else if (part.quantidadeAtual === part.quantidadeMinima) {
        newAlerts.push({
          id: `stock-${part.id}`,
          type: 'ESTOQUE',
          severity: 'warning',
          message: `Estoque no limite: ${part.nomePeca}`,
          entityId: part.id
        });
      }
    });

    // Alertas de Manutenção
    vehicles.forEach(vehicle => {
      const kmRemaining = vehicle.kmProximaManutencao - vehicle.kmEntrada;
      if (kmRemaining <= 0) {
        newAlerts.push({
          id: `maint-${vehicle.id}`,
          type: 'MANUTENCAO',
          severity: 'critical',
          message: `Manutenção vencida: ${vehicle.modelo} (${vehicle.placa})`,
          entityId: vehicle.id
        });
      } else if (kmRemaining <= 500) {
        newAlerts.push({
          id: `maint-${vehicle.id}`,
          type: 'MANUTENCAO',
          severity: 'warning',
          message: `Manutenção próxima (${kmRemaining}km): ${vehicle.modelo} (${vehicle.placa})`,
          entityId: vehicle.id
        });
      }
    });

    return newAlerts;
  }, [inventory, vehicles]);

  // --- CLIENT ACTIONS ---

  const addClient = (clientData: Omit<Client, 'id'>) => {
    const newClient = { ...clientData, id: generateUUID() };
    setClients(prev => [...prev, newClient]);
    addLog('CRIACAO', 'CLIENTE', `Cliente ${newClient.nome} cadastrado.`);
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    addLog('EDICAO', 'CLIENTE', `Cliente ID ${id} atualizado.`);
  };

  const deleteClient = (id: string) => {
    // 1. Identificar veículos do cliente para exclusão em cascata
    // Usamos o estado atual 'vehicles' disponível no escopo da função
    const clientVehicles = vehicles.filter(v => v.clienteId === id);
    const vehicleIds = clientVehicles.map(v => v.id);

    // 2. Remover Ordens de Serviço ligadas a esses veículos
    if (vehicleIds.length > 0) {
      setServiceOrders(prev => prev.filter(os => !vehicleIds.includes(os.veiculoId)));
    }
    
    // 3. Remover Veículos
    setVehicles(prev => prev.filter(v => v.clienteId !== id));

    // 4. Remover Cliente
    setClients(prev => prev.filter(c => c.id !== id));

    addLog('EXCLUSAO', 'CLIENTE', `Cliente ID ${id} e dados associados excluídos.`);
  };

  // --- VEHICLE ACTIONS ---

  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'kmProximaManutencao'>) => {
    const nextMaintenance = vehicleData.kmEntrada + 5000;
    const newVehicle = { 
      ...vehicleData, 
      id: generateUUID(),
      kmProximaManutencao: nextMaintenance
    };
    setVehicles(prev => [...prev, newVehicle]);
    addLog('CRIACAO', 'VEICULO', `Veículo ${newVehicle.placa} cadastrado.`);
  };

  const updateVehicle = (id: string, data: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => {
      if (v.id !== id) return v;
      
      const updated = { ...v, ...data };
      if (data.kmEntrada !== undefined) {
        updated.kmProximaManutencao = updated.kmEntrada + 5000;
      }
      return updated;
    }));
    addLog('EDICAO', 'VEICULO', `Veículo ID ${id} atualizado.`);
  };

  const deleteVehicle = (id: string) => {
    setServiceOrders(prev => prev.filter(os => os.veiculoId !== id));
    setVehicles(prev => prev.filter(v => v.id !== id));
    addLog('EXCLUSAO', 'VEICULO', `Veículo ID ${id} e OS associadas excluídos.`);
  };

  // --- INVENTORY ACTIONS ---

  const addPart = (partData: Omit<Part, 'id'>) => {
    const newPart = { ...partData, id: generateUUID() };
    setInventory(prev => [...prev, newPart]);
    addLog('CRIACAO', 'ESTOQUE', `Peça ${newPart.nomePeca} adicionada.`);
  };

  const updatePart = (id: string, data: Partial<Part>) => {
    setInventory(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    addLog('EDICAO', 'ESTOQUE', `Peça ID ${id} atualizada.`);
  };

  const deletePart = (id: string) => {
    setInventory(prev => prev.filter(p => p.id !== id));
    addLog('EXCLUSAO', 'ESTOQUE', `Peça ID ${id} removida.`);
  };

  // --- SERVICE ORDER ACTIONS ---

  const addServiceOrder = (osData: Omit<ServiceOrder, 'id' | 'valorTotal'>) => {
    const total = osData.pecasUsadas.reduce((acc, item) => {
      return acc + (item.quantidade * item.valorUnitarioSnapshot);
    }, 0);

    const newOS: ServiceOrder = {
      ...osData,
      id: generateUUID(),
      valorTotal: total
    };

    setServiceOrders(prev => [...prev, newOS]);

    // Baixa no estoque
    setInventory(prevInventory => {
      return prevInventory.map(part => {
        const used = osData.pecasUsadas.find(u => u.partId === part.id);
        if (used) {
          return { ...part, quantidadeAtual: part.quantidadeAtual - used.quantidade };
        }
        return part;
      });
    });

    // Atualiza manutenção do veículo
    updateVehicle(osData.veiculoId, { dataUltimaManutencao: osData.data });

    addLog('CRIACAO', 'OS', `OS ID ${newOS.id} criada. Valor: R$ ${total}`);
  };

  const deleteServiceOrder = (id: string) => {
    setServiceOrders(prev => prev.filter(os => os.id !== id));
    addLog('EXCLUSAO', 'OS', `OS ID ${id} excluída.`);
  };

  return (
    <AutoPrimeContext.Provider value={{
      clients, vehicles, inventory, serviceOrders, logs, alerts, currentView,
      setCurrentView,
      addClient, updateClient, deleteClient,
      addVehicle, updateVehicle, deleteVehicle,
      addPart, updatePart, deletePart,
      addServiceOrder, deleteServiceOrder
    }}>
      {children}
    </AutoPrimeContext.Provider>
  );
};