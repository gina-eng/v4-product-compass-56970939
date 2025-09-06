
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Edit, Trash2, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatters";

interface Position {
  id: string;
  nome: string;
  investimento_total: number;
  cph: number;
}

interface ProductPosition {
  id: string;
  product_id: string;
  position_id: string;
  horas_alocadas: number;
  positions: Position;
}

interface ProductPositionsProps {
  productId: string;
  readOnly?: boolean;
  initialMarkup?: number;
  initialMarkupOverhead?: number;
  initialOutros?: number;
  onMarkupChange?: (markup: number) => void;
  onMarkupOverheadChange?: (markupOverhead: number) => void;
  onOutrosChange?: (outros: number) => void;
  onPositionsChange?: () => void;
}

const ProductPositions = ({ 
  productId, 
  readOnly = false, 
  initialMarkup = 1, 
  initialMarkupOverhead = 1,
  initialOutros = 0,
  onMarkupChange, 
  onMarkupOverheadChange,
  onOutrosChange,
  onPositionsChange 
}: ProductPositionsProps) => {
  const [productPositions, setProductPositions] = useState<ProductPosition[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<ProductPosition | null>(null);
  const [formData, setFormData] = useState({
    position_id: '',
    horas_alocadas: ''
  });
  const [markup, setMarkup] = useState<number>(initialMarkup);
  const [markupOverhead, setMarkupOverhead] = useState<number>(initialMarkupOverhead);
  const [outros, setOutros] = useState<number>(initialOutros);
  const [categoria, setCategoria] = useState<string>('');
  const [isDreOpen, setIsDreOpen] = useState(false);
  const [isPositionsOpen, setIsPositionsOpen] = useState(false);
  const [aplicarDescontoPagamento, setAplicarDescontoPagamento] = useState(true);
  const [aplicarDescontoCupom, setAplicarDescontoCupom] = useState(true);
  const [aplicarDescontoComprometimento, setAplicarDescontoComprometimento] = useState(false); // Iniciar como false
  const [nivelDedicacao, setNivelDedicacao] = useState<number>(1); // 100% por padrão
  const [usaDedicacao, setUsaDedicacao] = useState<boolean>(false); // Controla se deve aplicar dedicação

  // Opções de dedicação
  const opcoesDedicacao = [
    { label: "Compartilhado 1 (10%)", value: 0.1 },
    { label: "Compartilhado 2 (15%)", value: 0.15 },
    { label: "Semi Dedicado 1 (25%)", value: 0.25 },
    { label: "Semi Dedicado 2 (50%)", value: 0.5 },
    { label: "Dedicado (100%)", value: 1 }
  ];

  useEffect(() => {
    fetchProductPositions();
    fetchPositions();
    fetchProductData();
  }, [productId]);

  const fetchProductData = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('markup, markup_overhead, outros, categoria, usa_dedicacao')
        .eq('id', productId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar dados do produto:', error);
        return;
      }
      
      if (data) {
        if (data.markup) setMarkup(data.markup);
        if (data.markup_overhead) setMarkupOverhead(data.markup_overhead);
        if (data.outros !== null) setOutros(data.outros);
        setUsaDedicacao(data.usa_dedicacao || false); // Armazenar se usa dedicação
        if (data.categoria) {
          setCategoria(data.categoria);
          // Configurar desconto de comprometimento baseado na categoria
          if (data.categoria === 'saber' || data.categoria === 'ter') {
            setAplicarDescontoComprometimento(false);
          } else {
            setAplicarDescontoComprometimento(true);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do produto:', error);
    }
  };

  const updateProductData = async (field: 'markup' | 'markup_overhead' | 'outros', value: number) => {
    try {
      console.log(`Tentando atualizar ${field} para:`, value, 'no produto:', productId);
      
      const { data, error } = await supabase
        .from('products')
        .update({ [field]: value })
        .eq('id', productId)
        .select();
      
      if (error) {
        console.error(`Erro detalhado ao atualizar ${field}:`, error);
        throw error;
      }
      
      console.log(`${field} atualizado com sucesso:`, data);
      
      const fieldLabels = {
        markup: 'Markup Direto',
        markup_overhead: 'Markup Overhead', 
        outros: 'Outros'
      };
      
      toast({
        title: "Sucesso",
        description: `${fieldLabels[field]} atualizado com sucesso!`,
      });
      
      // Chamar callbacks apropriados
      if (field === 'markup' && onMarkupChange) {
        onMarkupChange(value);
      } else if (field === 'markup_overhead' && onMarkupOverheadChange) {
        onMarkupOverheadChange(value);
      } else if (field === 'outros' && onOutrosChange) {
        onOutrosChange(value);
      }
    } catch (error) {
      console.error(`Erro ao atualizar ${field}:`, error);
      toast({
        title: "Erro",
        description: `Não foi possível atualizar: ${error?.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const handleMarkupChange = (newMarkup: number) => {
    setMarkup(newMarkup);
    if (!readOnly) {
      updateProductData('markup', newMarkup);
    }
  };

  const handleMarkupOverheadChange = (newMarkupOverhead: number) => {
    setMarkupOverhead(newMarkupOverhead);
    if (!readOnly) {
      updateProductData('markup_overhead', newMarkupOverhead);
    }
  };

  const handleOutrosChange = (newOutros: number) => {
    setOutros(newOutros);
    if (!readOnly) {
      updateProductData('outros', newOutros);
    }
  };

  const fetchProductPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('product_positions')
        .select(`
          *,
          positions (*)
        `)
        .eq('product_id', productId);
      
      if (error) {
        console.error('Erro ao buscar posições do produto:', error);
        return;
      }
      
      setProductPositions(data || []);
    } catch (error) {
      console.error('Erro ao buscar posições do produto:', error);
    }
  };

  const fetchPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .order('nome');
      
      if (error) {
        console.error('Erro ao buscar posições:', error);
        return;
      }
      
      setPositions(data || []);
    } catch (error) {
      console.error('Erro ao buscar posições:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const positionData = {
        product_id: productId,
        position_id: formData.position_id,
        horas_alocadas: parseFloat(formData.horas_alocadas)
      };

      console.log('Tentando salvar posição:', positionData);

      if (editingPosition) {
        const { data, error } = await supabase
          .from('product_positions')
          .update(positionData)
          .eq('id', editingPosition.id)
          .select();
        
        if (error) {
          console.error('Erro detalhado ao atualizar posição:', error);
          throw error;
        }
        
        console.log('Posição atualizada com sucesso:', data);
        
        toast({
          title: "Sucesso",
          description: "Posição atualizada com sucesso!",
        });
      } else {
        const { data, error } = await supabase
          .from('product_positions')
          .insert([positionData])
          .select();
        
        if (error) {
          console.error('Erro detalhado ao inserir posição:', error);
          throw error;
        }
        
        console.log('Posição inserida com sucesso:', data);
        
        toast({
          title: "Sucesso",
          description: "Posição adicionada com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingPosition(null);
      setFormData({ position_id: '', horas_alocadas: '' });
      fetchProductPositions();
      
      // Notificar mudança nas posições
      if (onPositionsChange) {
        onPositionsChange();
      }
    } catch (error) {
      console.error('Erro ao salvar posição:', error);
      toast({
        title: "Erro",
        description: `Não foi possível salvar a posição: ${error?.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (productPosition: ProductPosition) => {
    setEditingPosition(productPosition);
    setFormData({
      position_id: productPosition.position_id,
      horas_alocadas: productPosition.horas_alocadas.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('Tentando excluir posição:', id);
      
      const { data, error } = await supabase
        .from('product_positions')
        .delete()
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Erro detalhado ao excluir posição:', error);
        throw error;
      }
      
      console.log('Posição excluída com sucesso:', data);
      
      toast({
        title: "Sucesso",
        description: "Posição removida com sucesso!",
      });
      
      fetchProductPositions();
      
      // Notificar mudança nas posições
      if (onPositionsChange) {
        onPositionsChange();
      }
    } catch (error) {
      console.error('Erro ao excluir posição:', error);
      toast({
        title: "Erro",
        description: `Não foi possível remover a posição: ${error?.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const openNewDialog = () => {
    setEditingPosition(null);
    setFormData({ position_id: '', horas_alocadas: '' });
    setIsDialogOpen(true);
  };

  const calculateCSP = (cph: number, horasAlocadas: number) => {
    // Aplicar fator de dedicação APENAS se usa_dedicacao estiver habilitado E categoria for EXECUTAR
    const horasEfetivas = (categoria === 'executar' && usaDedicacao) 
      ? horasAlocadas * nivelDedicacao 
      : horasAlocadas; // 100% se não usa dedicação
    return horasEfetivas * cph;
  };

  // Função para identificar se uma posição é Overhead
  const isOverheadPosition = (nome: string) => {
    const normalized = (nome || '').toLowerCase().trim();
    const isGestaoPeG = normalized === 'gerente de pe&g' || normalized === 'coordenador de pe&g';
    const isAccount = normalized.includes('account manager') || normalized === 'account' || normalized === 'am';
    
    if (categoria === 'executar') {
      return isGestaoPeG || isAccount; // Account Manager é overhead em EXECUTAR
    }
    return isGestaoPeG; // Account Manager é direto em TER/SABER
  };

  const posicoesDiretas = productPositions.filter(pp =>
    !isOverheadPosition(pp.positions.nome)
  );
  const posicoesOverhead = productPositions.filter(pp =>
    isOverheadPosition(pp.positions.nome)
  );

  // Calcular totais
  const totalHoras = productPositions.reduce((total, pp) => {
    // Aplicar horas efetivas APENAS se usa_dedicacao estiver habilitado E categoria for EXECUTAR
    return (categoria === 'executar' && usaDedicacao)
      ? total + (pp.horas_alocadas * nivelDedicacao)
      : total + pp.horas_alocadas; // 100% se não usa dedicação
  }, 0);
  
  const totalCSPDireto = posicoesDiretas.reduce((total, pp) => {
    return total + calculateCSP(pp.positions.cph, pp.horas_alocadas);
  }, 0);
  
  const totalCSPOverhead = posicoesOverhead.reduce((total, pp) => {
    return total + calculateCSP(pp.positions.cph, pp.horas_alocadas);
  }, 0);
  
  const totalCSP = totalCSPDireto + totalCSPOverhead;

  // Cálculos DRE - Fórmula consistente para todas as categorias
  // Faturamento Ancoragem = (CSP Direto × markup direto) + (CSP Overhead × markup overhead)
  const faturamentoAncoragem = (totalCSPDireto * markup) + (totalCSPOverhead * markupOverhead);
    
  // Estrutura hierárquica correta
  const descontoPagamento = aplicarDescontoPagamento ? faturamentoAncoragem * 0.11 : 0;
  const faturamentoMedio = faturamentoAncoragem - descontoPagamento;
  
  const descontoComprometimento = aplicarDescontoComprometimento ? faturamentoAncoragem * 0.06 : 0;
  const descontoCupom = aplicarDescontoCupom ? faturamentoAncoragem * 0.20 : 0;
  const faturamentoMinimo = faturamentoMedio - descontoComprometimento - descontoCupom;
  
  const faturamentoComDesconto = faturamentoMinimo;
  
  const royalties = faturamentoComDesconto * 0.17;
  const taxaTransicao = faturamentoComDesconto * 0.03;
  const receitaBruta = faturamentoComDesconto - royalties - taxaTransicao;
  const impostosReceita = receitaBruta * 0.0925;
  const receitaLiquida = receitaBruta - impostosReceita;
  const custosDiretos = totalCSPDireto + totalCSPOverhead + outros;
  const margemOperacional = receitaLiquida - custosDiretos;
  const margemPercentual = receitaLiquida > 0 ? (margemOperacional / receitaLiquida) * 100 : 0;

  // Debug logs detalhados
  console.log('=== DEBUG CÁLCULOS DETALHADO ===');
  console.log('Categoria:', categoria);
  console.log('Função isOverheadPosition aplicada');
  console.log('Product Positions:', productPositions.map(pp => ({ 
    nome: pp.positions.nome, 
    horas: pp.horas_alocadas, 
    cph: pp.positions.cph,
    csp: calculateCSP(pp.positions.cph, pp.horas_alocadas),
    isOverhead: isOverheadPosition(pp.positions.nome),
    categoria: categoria
  })));
  console.log('Posições Diretas:', posicoesDiretas.map(pp => ({ nome: pp.positions.nome, csp: calculateCSP(pp.positions.cph, pp.horas_alocadas) })));
  console.log('Posições Overhead:', posicoesOverhead.map(pp => ({ nome: pp.positions.nome, csp: calculateCSP(pp.positions.cph, pp.horas_alocadas) })));
  console.log('Total CSP Direto:', totalCSPDireto);
  console.log('Total CSP Overhead:', totalCSPOverhead);
  console.log('Markup:', markup);
  console.log('Markup Overhead:', markupOverhead);
  console.log('Cálculo Faturamento - Categoria EXECUTAR?', categoria === 'executar');
  console.log('Faturamento = (CSP Direto × markup) + (CSP Overhead × markup overhead) - TODAS as categorias');
  console.log(`Faturamento = (${totalCSPDireto} × ${markup}) + (${totalCSPOverhead} × ${markupOverhead})`);
  console.log(`Faturamento = ${totalCSPDireto * markup} + ${totalCSPOverhead * markupOverhead} = ${faturamentoAncoragem}`);
  console.log('================================');
  
  console.log('ProductPositions rendering - Taxa de Transição updated');

  return (
    <Collapsible open={isPositionsOpen} onOpenChange={setIsPositionsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-title-card flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                Posições Alocadas
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isPositionsOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
              {!readOnly && isPositionsOpen && (
                <Button onClick={(e) => { e.stopPropagation(); openNewDialog(); }} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Posição
                </Button>
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
        {productPositions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-body text-muted-foreground">
              Nenhuma posição alocada para este produto.
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="table-header">Posição</TableHead>
                  <TableHead className="table-header">Horas Alocadas</TableHead>
                  <TableHead className="table-header">CSP</TableHead>
                  {!readOnly && <TableHead className="table-header">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {productPositions.map((productPosition) => (
                  <TableRow key={productPosition.id}>
                    <TableCell className="table-cell font-medium">
                      {productPosition.positions.nome}
                    </TableCell>
                     <TableCell className="table-cell-number">
                       {(categoria === 'executar' && usaDedicacao) 
                         ? `${productPosition.horas_alocadas} (${(productPosition.horas_alocadas * nivelDedicacao).toFixed(1)}h efetivas)`
                         : productPosition.horas_alocadas
                       }
                     </TableCell>
                    <TableCell className="table-cell">
                      {formatCurrency(
                        calculateCSP(
                          productPosition.positions.cph,
                          productPosition.horas_alocadas
                        )
                      )}
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(productPosition)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(productPosition.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {/* Linha de total */}
                <TableRow className="border-t-2 border-border bg-muted/50">
                  <TableCell className="text-title-sub">TOTAL</TableCell>
                  <TableCell className="text-title-sub table-cell-number">{totalHoras}</TableCell>
                  <TableCell className="text-title-sub">{formatCurrency(totalCSP)}</TableCell>
                  {!readOnly && <TableCell></TableCell>}
                </TableRow>
              </TableBody>
            </Table>
          </>
        )}

        {/* Campos de Markup e Outros - DRE */}
        {productPositions.length > 0 && (
          <div className="spacing-section">
            {/* Campos de controle - apenas no modo de edição */}
            {!readOnly && (
              <div className="space-y-4">
                {/* Seletor de Dedicação - apenas para categoria EXECUTAR E se usa_dedicacao estiver habilitado */}
                {categoria === 'executar' && usaDedicacao && (
                  <div className="flex items-center gap-4">
                    <Label htmlFor="dedicacao" className="text-label min-w-fit">Nível de Dedicação:</Label>
                    <Select value={nivelDedicacao.toString()} onValueChange={(value) => setNivelDedicacao(parseFloat(value))}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Selecione o nível de dedicação" />
                      </SelectTrigger>
                      <SelectContent>
                        {opcoesDedicacao.map((opcao) => (
                          <SelectItem key={opcao.value} value={opcao.value.toString()}>
                            {opcao.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Label htmlFor="markup" className="text-label min-w-fit">Markup Direto:</Label>
                  <Input
                    id="markup"
                    type="number"
                    step="0.1"
                    value={markup}
                    onChange={(e) => handleMarkupChange(parseFloat(e.target.value) || 1)}
                    className="w-32"
                    placeholder="Ex: 1.5"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Label htmlFor="markupOverhead" className="text-label min-w-fit">Markup Overhead:</Label>
                  <Input
                    id="markupOverhead"
                    type="number"
                    step="0.1"
                    value={markupOverhead}
                    onChange={(e) => handleMarkupOverheadChange(parseFloat(e.target.value) || 1)}
                    className="w-32"
                    placeholder="Ex: 1.5"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Label htmlFor="outros" className="text-label min-w-fit">(-) Outros:</Label>
                  <Input
                    id="outros"
                    type="number"
                    step="0.01"
                    value={outros}
                    onChange={(e) => handleOutrosChange(parseFloat(e.target.value) || 0)}
                    className="w-32"
                    placeholder="Ex: 100.00"
                  />
                </div>
              </div>
            )}

            {/* Tabela DRE */}
            <Collapsible open={isDreOpen} onOpenChange={setIsDreOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-title-card text-right bg-muted padding-section rounded flex items-center justify-between">
                        DRE FINAL
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDreOpen ? 'rotate-180' : ''}`} />
                      </CardTitle>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-0">
                    <Table>
                      <TableBody>
                        <TableRow className="bg-red-50 dark:bg-red-950/30 border-l-4 border-l-red-500">
                          <TableCell className="font-semibold flex items-center gap-2">
                            <span className="text-red-600 dark:text-red-400">⚓</span>
                            (=) Faturamento Ancoragem
                            <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded-full font-medium">
                              {categoria === 'executar' 
                                ? "(CSP direto × markup) + (CSP Overhead × markup overhead)"
                                : "(CSP direto + CSP Overhead) × markup direto"
                              }
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-red-600 dark:text-red-400 font-medium">R$</TableCell>
                          <TableCell className="text-right font-semibold text-red-600 dark:text-red-400">{formatCurrency(faturamentoAncoragem).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className={`font-medium ${aplicarDescontoPagamento ? 'text-red-600' : 'text-muted-foreground line-through'}`}>
                            (-) Desconto de pagamento (-11%)
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium ml-2">
                              sobre Faturamento Ancoragem
                            </span>
                          </TableCell>
                          <TableCell className={`text-center ${aplicarDescontoPagamento ? 'text-red-600' : 'text-muted-foreground'}`}>R$</TableCell>
                          <TableCell className={`text-right font-medium ${aplicarDescontoPagamento ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {formatCurrency(descontoPagamento).replace('R$ ', '')}
                          </TableCell>
                          <TableCell className="w-16">
                            <Button
                              variant={aplicarDescontoPagamento ? "default" : "outline"}
                              size="sm"
                              onClick={() => setAplicarDescontoPagamento(!aplicarDescontoPagamento)}
                              className="h-6 w-6 p-0 text-xs"
                            >
                              {aplicarDescontoPagamento ? "✓" : "✗"}
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-muted/50">
                          <TableCell className="font-medium">(=) Faturamento Médio</TableCell>
                          <TableCell className="text-center">R$</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(faturamentoMedio).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className={`font-medium ${aplicarDescontoComprometimento ? 'text-red-600' : 'text-muted-foreground line-through'}`}>
                            (-) Desconto de Comprometimento (-6%)
                            {(categoria === 'saber' || categoria === 'ter') && (
                              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full font-medium ml-2">
                                N/A para {categoria.toUpperCase()}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className={`text-center ${aplicarDescontoComprometimento ? 'text-red-600' : 'text-muted-foreground'}`}>R$</TableCell>
                          <TableCell className={`text-right font-medium ${aplicarDescontoComprometimento ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {formatCurrency(descontoComprometimento).replace('R$ ', '')}
                          </TableCell>
                          <TableCell className="w-16">
                            <Button
                              variant={aplicarDescontoComprometimento ? "default" : "outline"}
                              size="sm"
                              onClick={() => setAplicarDescontoComprometimento(!aplicarDescontoComprometimento)}
                              disabled={categoria === 'saber' || categoria === 'ter'}
                              className="h-6 w-6 p-0 text-xs"
                            >
                              {aplicarDescontoComprometimento ? "✓" : "✗"}
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className={`font-medium ${aplicarDescontoCupom ? 'text-red-600' : 'text-muted-foreground line-through'}`}>
                            (-) Desconto de Cupom (-20%)
                          </TableCell>
                          <TableCell className={`text-center ${aplicarDescontoCupom ? 'text-red-600' : 'text-muted-foreground'}`}>R$</TableCell>
                          <TableCell className={`text-right font-medium ${aplicarDescontoCupom ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {formatCurrency(descontoCupom).replace('R$ ', '')}
                          </TableCell>
                          <TableCell className="w-16">
                            <Button
                              variant={aplicarDescontoCupom ? "default" : "outline"}
                              size="sm"
                              onClick={() => setAplicarDescontoCupom(!aplicarDescontoCupom)}
                              className="h-6 w-6 p-0 text-xs"
                            >
                              {aplicarDescontoCupom ? "✓" : "✗"}
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-green-50 dark:bg-green-950/30 border-l-4 border-l-green-500 border-t-2 border-t-green-200 dark:border-t-green-800">
                          <TableCell className="font-semibold flex items-center gap-2">
                            <span className="text-green-600 dark:text-green-400">💰</span>
                            (=) Faturamento Mínimo
                            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium">
                              Médio - Comprometimento - Cupom
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-green-600 dark:text-green-400 font-medium">R$</TableCell>
                          <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">{formatCurrency(faturamentoMinimo).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-red-600">(-) Royalties (-17%)</TableCell>
                          <TableCell className="text-center text-red-600">R$</TableCell>
                          <TableCell className="text-right font-medium text-red-600">{formatCurrency(royalties).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-red-600">(-) Taxa de Transação (-3%)</TableCell>
                          <TableCell className="text-center text-red-600">R$</TableCell>
                          <TableCell className="text-right font-medium text-red-600">{formatCurrency(taxaTransicao).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow className="bg-muted/50">
                          <TableCell className="font-medium">(=) Receita Bruta (MRR)</TableCell>
                          <TableCell className="text-center">R$</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(receitaBruta).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-red-600">(-) Impostos sobre Receita (-9,25%)</TableCell>
                          <TableCell className="text-center text-red-600">R$</TableCell>
                          <TableCell className="text-right font-medium text-red-600">{formatCurrency(impostosReceita).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow className="bg-muted/50">
                          <TableCell className="font-medium">(=) Receita Líquida</TableCell>
                          <TableCell className="text-center">R$</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(receitaLiquida).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-red-600">(-) Custos diretos</TableCell>
                          <TableCell className="text-center text-red-600">R$</TableCell>
                          <TableCell className="text-right font-medium text-red-600">{formatCurrency(custosDiretos).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow className="pl-6">
                          <TableCell className="font-medium text-red-600 pl-8">(-) CSP Direto</TableCell>
                          <TableCell className="text-center text-red-600">R$</TableCell>
                          <TableCell className="text-right font-medium text-red-600">{formatCurrency(totalCSPDireto).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow className="pl-6">
                          <TableCell className="font-medium text-red-600 pl-8">(-) CSP Overhead</TableCell>
                          <TableCell className="text-center text-red-600">R$</TableCell>
                          <TableCell className="text-right font-medium text-red-600">{formatCurrency(totalCSPOverhead).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-red-600 pl-8">(-) Outros</TableCell>
                          <TableCell className="text-center text-red-600">R$</TableCell>
                          <TableCell className="text-right font-medium text-red-600">{formatCurrency(outros).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow className="bg-muted/50 border-t-2">
                          <TableCell className="font-bold">(=) Margem operacional</TableCell>
                          <TableCell className="text-center font-bold">R$</TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(margemOperacional).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell className="text-right font-bold text-sm">{margemPercentual.toFixed(2)}%</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        )}
          </CardContent>
        </CollapsibleContent>
      </Card>
      
      {/* Modal Dialog - moved outside of collapsible */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPosition ? 'Editar Posição' : 'Adicionar Posição'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="position">Posição</Label>
              <Select
                value={formData.position_id}
                onValueChange={(value) => setFormData({ ...formData, position_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma posição" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position.id} value={position.id}>
                      {position.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="horas">Horas Alocadas</Label>
              <Input
                id="horas"
                type="number"
                step="0.1"
                value={formData.horas_alocadas}
                onChange={(e) => setFormData({ ...formData, horas_alocadas: e.target.value })}
                placeholder="Ex: 40.0"
              />
            </div>
            <Button onClick={handleSubmit} className="w-full">
              {editingPosition ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Collapsible>
  );
};

export default ProductPositions;
