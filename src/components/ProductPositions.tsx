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
  onMarkupChange?: (markup: number) => void;
  onPositionsChange?: () => void;
}

const ProductPositions = ({ productId, readOnly = false, initialMarkup = 1, onMarkupChange, onPositionsChange }: ProductPositionsProps) => {
  const [productPositions, setProductPositions] = useState<ProductPosition[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<ProductPosition | null>(null);
  const [formData, setFormData] = useState({
    position_id: '',
    horas_alocadas: ''
  });
  const [markup, setMarkup] = useState<number>(initialMarkup);
  const [isDreOpen, setIsDreOpen] = useState(false);
  const [isPositionsOpen, setIsPositionsOpen] = useState(false);
  const [aplicarDescontoPagamento, setAplicarDescontoPagamento] = useState(true);
  const [aplicarDescontoCupom, setAplicarDescontoCupom] = useState(true);

  useEffect(() => {
    fetchProductPositions();
    fetchPositions();
    fetchProductMarkup();
  }, [productId]);

  const fetchProductMarkup = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('markup')
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      if (data && data.markup) {
        setMarkup(data.markup);
      }
    } catch (error) {
      console.error('Erro ao buscar markup do produto:', error);
    }
  };

  const updateProductMarkup = async (newMarkup: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ markup: newMarkup })
        .eq('id', productId);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Markup atualizado com sucesso!",
      });
      
      if (onMarkupChange) {
        onMarkupChange(newMarkup);
      }
    } catch (error) {
      console.error('Erro ao atualizar markup:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o markup.",
        variant: "destructive",
      });
    }
  };

  const handleMarkupChange = (newMarkup: number) => {
    setMarkup(newMarkup);
    if (!readOnly) {
      updateProductMarkup(newMarkup);
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
      
      if (error) throw error;
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
      
      if (error) throw error;
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

      if (editingPosition) {
        const { error } = await supabase
          .from('product_positions')
          .update(positionData)
          .eq('id', editingPosition.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Posição atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('product_positions')
          .insert([positionData]);
        
        if (error) throw error;
        
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
        description: "Não foi possível salvar a posição.",
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
      const { error } = await supabase
        .from('product_positions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
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
        description: "Não foi possível remover a posição.",
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
    return horasAlocadas * cph;
  };

  // Calcular totais
  const totalHoras = productPositions.reduce((total, pp) => total + pp.horas_alocadas, 0);
  const totalCSP = productPositions.reduce((total, pp) => {
    return total + calculateCSP(pp.positions.cph, pp.horas_alocadas);
  }, 0);

  // Cálculos DRE
  const faturamentoSemDesconto = totalCSP * markup;
  const descontoPagamento = aplicarDescontoPagamento ? faturamentoSemDesconto * 0.17 : 0;
  const descontoCupom = aplicarDescontoCupom ? faturamentoSemDesconto * 0.20 : 0;
  const faturamentoComDesconto = faturamentoSemDesconto - descontoPagamento - descontoCupom;
  const royalties = faturamentoComDesconto * 0.17;
  const taxaTransicao = faturamentoComDesconto * 0.03;
  const taxaAntecipacao = faturamentoComDesconto * 0.10;
  const receitaBruta = faturamentoComDesconto - royalties - taxaTransicao - taxaAntecipacao;
  const impostosReceita = receitaBruta * 0.074;
  const receitaLiquida = receitaBruta - impostosReceita;
  const custosCSP = totalCSP; // CSP total
  const custosDiretos = custosCSP;
  const margemOperacional = receitaLiquida - custosDiretos;
  const margemPercentual = receitaLiquida > 0 ? (margemOperacional / receitaLiquida) * 100 : 0;
  
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
                    <TableCell className="table-cell-number">{productPosition.horas_alocadas}</TableCell>
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

        {/* Campo de Markup e DRE */}
        {productPositions.length > 0 && (
          <div className="spacing-section">
            {/* Campo de Markup - apenas no modo de edição */}
            {!readOnly && (
              <div className="flex items-center gap-4">
                <Label htmlFor="markup" className="text-label min-w-fit">Markup:</Label>
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
                            (=) Faturamento (MRR) - Sem Desconto
                            <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded-full font-medium">
                              VALOR DE ANCORAGEM
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-red-600 dark:text-red-400 font-medium">R$</TableCell>
                          <TableCell className="text-right font-semibold text-red-600 dark:text-red-400">{formatCurrency(faturamentoSemDesconto).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className={`font-medium ${aplicarDescontoPagamento ? 'text-red-600' : 'text-muted-foreground line-through'}`}>
                            (-) Desconto de Pagamento (-17%)
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
                            (=) Faturamento (MRR) - Com Desconto
                            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium">
                              VALOR COBRADO AO CLIENTE
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-green-600 dark:text-green-400 font-medium">R$</TableCell>
                          <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">{formatCurrency(faturamentoComDesconto).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-red-600">(-) Royalties (-17%)</TableCell>
                          <TableCell className="text-center text-red-600">R$</TableCell>
                          <TableCell className="text-right font-medium text-red-600">{formatCurrency(royalties).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-red-600">(-) Taxa de Transição (-3%)</TableCell>
                          <TableCell className="text-center text-red-600">R$</TableCell>
                          <TableCell className="text-right font-medium text-red-600">{formatCurrency(taxaTransicao).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-red-600">(-) Taxa de Antecipação (-10%)</TableCell>
                          <TableCell className="text-center text-red-600">R$</TableCell>
                          <TableCell className="text-right font-medium text-red-600">{formatCurrency(taxaAntecipacao).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow className="bg-muted/50">
                          <TableCell className="font-medium">(=) Receita Bruta (MRR)</TableCell>
                          <TableCell className="text-center">R$</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(receitaBruta).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-red-600">(-) Impostos sobre Receita</TableCell>
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
                          <TableCell className="font-medium text-red-600 pl-8">(-) CSP</TableCell>
                          <TableCell className="text-center text-red-600">R$</TableCell>
                          <TableCell className="text-right font-medium text-red-600">{formatCurrency(custosCSP).replace('R$ ', '')}</TableCell>
                          <TableCell className="w-16"></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-red-600 pl-8">(-) Auxílio</TableCell>
                          <TableCell className="text-center text-red-600">R$</TableCell>
                          <TableCell className="text-right font-medium text-red-600">-</TableCell>
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