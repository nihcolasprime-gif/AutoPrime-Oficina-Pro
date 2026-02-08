
export interface Client {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  ativo: boolean;
  notas?: string;
  createdAt: string;
}

export interface Vehicle {
  id: string; // Mantido ID interno para integridade, mas Placa é visualmente a chave
  placa: string;
  modelo: string;
  ano?: string;
  marca?: string;
  clienteId: string;
  kmEntrada: number; // KM inicial de cadastro
  kmAtual: number; // KM atualizado pelas OS
  historicoKm: { data: string; km: number; origem: string }[];
  notas?: string;
  dataUltimaManutencao: string;
  dataProximaManutencao?: string; // Alterado de KM para Data
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
  nomePeca: string;
  quantidade: number;
  valorUnitarioSnapshot: number;
}

export interface ServiceItem {
  id?: string; // Optional for compatibility, but should be generated
  nome: string; // Ex: "Troca de Óleo"
  valor: number;
}

export interface ServiceOrder {
  id: string;
  clienteId: string;
  veiculoId: string;
  kmNoServico: number;
  pecasUsadas: UsedPart[];
  servicos: ServiceItem[];
  valorTotal: number;
  data: string;
  status: 'ABERTA' | 'CONCLUIDA' | 'CANCELADA';
  mecanico?: string;
  notas?: string;
}

export interface MaintenanceRule {
  id: string;
  nomeServico: string; // Deve bater com o nome do serviço na OS
  intervaloMeses: number; // Alterado de KM para Meses
  veiculoId?: string; // Opcional: Se definido, regra vale apenas para este veículo
}

export interface Transaction {
  id: string;
  descricao: string;
  tipo: 'RECEITA' | 'DESPESA';
  valor: number;
  data: string; // ISO Date
  categoria: 'OS' | 'ESTOQUE' | 'ALUGUEL' | 'CONTAS' | 'PESSOAL' | 'OUTROS';
  referenciaId?: string; // ID da OS ou da Peça (para exclusão em cascata)
}

export interface Log {
  id: string;
  timestamp: string;
  acao: 'CRIACAO' | 'EDICAO' | 'EXCLUSAO' | 'CONFIG';
  entidade: 'CLIENTE' | 'VEICULO' | 'ESTOQUE' | 'OS' | 'REGRA' | 'FINANCEIRO';
  detalhes: string;
}

export interface Alert {
  id: string;
  type: 'ESTOQUE' | 'MANUTENCAO';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  veiculoId?: string;
  regraId?: string;
  // Novos campos para identificação direta
  clientName?: string;
  clientPhone?: string;
}

export interface DashboardMetrics {
  faturamentoTotal: number;
  faturamentoMes: number;
  osAbertas: number;
  osConcluidas: number;
  ticketMedio: number;
  topServicos: { nome: string; qtd: number }[];
}