export interface Client {
  id: string;
  nome: string;
  telefone: string;
  email: string;
}

export interface Vehicle {
  id: string;
  placa: string;
  modelo: string;
  clienteId: string;
  kmEntrada: number;
  dataUltimaManutencao: string;
  kmProximaManutencao: number;
}

export interface Part {
  id: string;
  nomePeca: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  valorUnitario: number;
}

export interface UsedPart {
  partId: string;
  nomePeca: string; // Snapshot name in case part is deleted/changed later
  quantidade: number;
  valorUnitarioSnapshot: number; // Snapshot price
}

export interface ServiceOrder {
  id: string;
  clienteId: string;
  veiculoId: string;
  pecasUsadas: UsedPart[];
  valorTotal: number;
  data: string;
  status: 'ABERTA' | 'CONCLUIDA';
}

export interface Log {
  id: string;
  timestamp: string;
  acao: 'CRIACAO' | 'EDICAO' | 'EXCLUSAO';
  entidade: 'CLIENTE' | 'VEICULO' | 'ESTOQUE' | 'OS';
  detalhes: string;
}

export interface Alert {
  id: string;
  type: 'ESTOQUE' | 'MANUTENCAO';
  severity: 'warning' | 'critical';
  message: string;
  entityId?: string;
}