import { supabase } from "@/integrations/supabase/client";

interface Position {
  horas_alocadas: number;
  positions: {
    cph: number;
    nome: string;
  };
}

interface ProductData {
  markup: number;
  markup_overhead: number;
  categoria: string;
  usa_dedicacao: boolean;
}

/**
 * Verifica se uma posição é classificada como Overhead baseada na categoria do produto
 */
export const isOverheadPosition = (nome: string, categoria: string): boolean => {
  const normalized = (nome || '').toLowerCase();
  const isGestaoPeG = normalized === 'gerente de pe&g' || normalized === 'coordenador de pe&g';
  const isAccount = normalized.includes('account manager') || normalized === 'am' || normalized.includes('account');
  
  if (categoria.toLowerCase() === 'executar') {
    return isGestaoPeG || isAccount;
  }
  return isGestaoPeG;
};

/**
 * Calcula o Faturamento Ancoragem (valor base) de um produto
 * usando a fórmula: (CSP Direto × markup) + (CSP Overhead × markup_overhead)
 * 
 * @param productId ID do produto
 * @param customDedicacao Nível de dedicação customizado (opcional)
 * @returns Valor do faturamento ancoragem
 */
export const calculateFaturamentoAncoragem = async (
  productId: string, 
  customDedicacao?: number
): Promise<number> => {
  try {
    // Buscar posições alocadas ao produto
    const { data: positions, error: positionsError } = await supabase
      .from('product_positions')
      .select(`
        *,
        positions (cph, nome)
      `)
      .eq('product_id', productId);
    
    if (positionsError) throw positionsError;

    // Buscar dados do produto
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('markup, markup_overhead, categoria, usa_dedicacao')
      .eq('id', productId)
      .single();
    
    if (productError) throw productError;

    return calculateFaturamentoFromData(
      positions || [], 
      product, 
      customDedicacao
    );
  } catch (error) {
    console.error('Erro ao calcular faturamento ancoragem:', error);
    return 0;
  }
};

/**
 * Calcula o faturamento a partir dos dados já carregados
 */
export const calculateFaturamentoFromData = (
  positions: Position[],
  product: ProductData,
  customDedicacao?: number
): number => {
  const markup = Number(product.markup) || 1;
  const markupOverhead = Number(product.markup_overhead) || 1;
  const categoria = (product.categoria || '').toLowerCase();
  const usaDedicacao = product.usa_dedicacao || false;

  // Nível de dedicação: customizado ou padrão (EXECUTAR com dedicação = 10%, demais = 100%)
  const nivelDedicacao = customDedicacao !== undefined 
    ? customDedicacao 
    : (usaDedicacao && categoria === 'executar' ? 0.1 : 1);

  // Classificação de posições Overhead
  const isOverheadPosition = (nome: string): boolean => {
    const normalized = (nome || '').toLowerCase();
    const isGestaoPeG = normalized === 'gerente de pe&g' || normalized === 'coordenador de pe&g';
    const isAccount = normalized.includes('account manager') || normalized === 'am' || normalized.includes('account');
    
    if (categoria === 'executar') {
      return isGestaoPeG || isAccount;
    }
    return isGestaoPeG;
  };

  // Função para calcular CSP com dedicação
  const calculateCSP = (cph: number, horasAlocadas: number): number => {
    const horasEfetivas = (categoria === 'executar' && usaDedicacao) 
      ? horasAlocadas * nivelDedicacao 
      : horasAlocadas; // Sempre 100% se não usa dedicação
    return horasEfetivas * cph;
  };

  // Calcular totais CSP
  let totalCSPDireto = 0;
  let totalCSPOverhead = 0;

  positions.forEach((pp) => {
    const horas = Number(pp.horas_alocadas) || 0;
    const cph = Number(pp.positions?.cph) || 0;
    const nome = pp.positions?.nome || '';
    const csp = calculateCSP(cph, horas);
    
    if (isOverheadPosition(nome)) {
      totalCSPOverhead += csp;
    } else {
      totalCSPDireto += csp;
    }
  });

  // Faturamento Ancoragem = (CSP Direto × markup) + (CSP Overhead × markup_overhead)
  const faturamentoAncoragem = (totalCSPDireto * markup) + (totalCSPOverhead * markupOverhead);
  
  return faturamentoAncoragem;
};

/**
 * Atualiza o campo valor no banco de dados com o faturamento calculado
 */
export const updateProductValue = async (productId: string, value: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ valor: value.toFixed(2) })
      .eq('id', productId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar valor do produto:', error);
  }
};
