import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
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
}

const ProductPositions = ({ productId, readOnly = false }: ProductPositionsProps) => {
  const [productPositions, setProductPositions] = useState<ProductPosition[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<ProductPosition | null>(null);
  const [formData, setFormData] = useState({
    position_id: '',
    horas_alocadas: ''
  });
  const [markup, setMarkup] = useState<number>(1);

  useEffect(() => {
    fetchProductPositions();
    fetchPositions();
  }, [productId]);

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
  const descontoPagamento = faturamentoSemDesconto * 0.17;
  const descontoCupom = faturamentoSemDesconto * 0.20;
  const faturamentoComDesconto = faturamentoSemDesconto - descontoPagamento - descontoCupom;
  const royalties = faturamentoComDesconto * 0.17;
  const taxaPagamento = faturamentoComDesconto * 0.03;
  const taxaAntecipacao = faturamentoComDesconto * 0.10;
  const receitaBruta = faturamentoComDesconto - royalties - taxaPagamento - taxaAntecipacao;
  const impostosReceita = receitaBruta * 0.074;
  const receitaLiquida = receitaBruta - impostosReceita;
  const custosGestao = totalCSP; // CSP Gestão = total CSP
  const custosOps = totalCSP * 11.9; // CSP Ops baseado no exemplo
  const custosDiretos = custosGestao + custosOps;
  const margemOperacional = receitaLiquida - custosDiretos;
  const margemPercentual = receitaLiquida > 0 ? (margemOperacional / receitaLiquida) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Posições Alocadas</CardTitle>
        {!readOnly && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Posição
              </Button>
            </DialogTrigger>
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
        )}
      </CardHeader>
      <CardContent>
        {productPositions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhuma posição alocada para este produto.
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>POSIÇÃO</TableHead>
                  <TableHead>HORAS ALOCADAS</TableHead>
                  <TableHead>CSP</TableHead>
                  {!readOnly && <TableHead>AÇÕES</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {productPositions.map((productPosition) => (
                  <TableRow key={productPosition.id}>
                    <TableCell className="font-medium">
                      {productPosition.positions.nome}
                    </TableCell>
                    <TableCell>{productPosition.horas_alocadas}</TableCell>
                    <TableCell>
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
                  <TableCell className="font-bold">TOTAL</TableCell>
                  <TableCell className="font-bold">{totalHoras}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(totalCSP)}</TableCell>
                  {!readOnly && <TableCell></TableCell>}
                </TableRow>
              </TableBody>
            </Table>
          </>
        )}

        {/* Campo de Markup e DRE */}
        {productPositions.length > 0 && (
          <div className="mt-6 space-y-6">
            {/* Campo de Markup */}
            <div className="flex items-center gap-4">
              <Label htmlFor="markup" className="min-w-fit">Markup:</Label>
              <Input
                id="markup"
                type="number"
                step="0.1"
                value={markup}
                onChange={(e) => setMarkup(parseFloat(e.target.value) || 1)}
                className="w-32"
                placeholder="Ex: 1.5"
              />
            </div>

            {/* Tabela DRE */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right bg-muted p-2 rounded">DRE FINAL</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">(=) Faturamento (MRR) - Sem Desconto</TableCell>
                      <TableCell className="text-center">R$</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(faturamentoSemDesconto).replace('R$ ', '')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-red-600">(-) Desconto de Pagamento (-17%)</TableCell>
                      <TableCell className="text-center text-red-600">R$</TableCell>
                      <TableCell className="text-right font-medium text-red-600">{formatCurrency(descontoPagamento).replace('R$ ', '')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-red-600">(-) Desconto de Cupom (-20%)</TableCell>
                      <TableCell className="text-center text-red-600">R$</TableCell>
                      <TableCell className="text-right font-medium text-red-600">{formatCurrency(descontoCupom).replace('R$ ', '')}</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-medium">(=) Faturamento (MRR) - Com Desconto</TableCell>
                      <TableCell className="text-center">R$</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(faturamentoComDesconto).replace('R$ ', '')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-red-600">(-) Royalties (-17%)</TableCell>
                      <TableCell className="text-center text-red-600">R$</TableCell>
                      <TableCell className="text-right font-medium text-red-600">{formatCurrency(royalties).replace('R$ ', '')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-red-600">(-) Taxa de Pagamento (-3%)</TableCell>
                      <TableCell className="text-center text-red-600">R$</TableCell>
                      <TableCell className="text-right font-medium text-red-600">{formatCurrency(taxaPagamento).replace('R$ ', '')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-red-600">(-) Taxa de Antecipação (-10%)</TableCell>
                      <TableCell className="text-center text-red-600">R$</TableCell>
                      <TableCell className="text-right font-medium text-red-600">{formatCurrency(taxaAntecipacao).replace('R$ ', '')}</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-medium">(=) Receita Bruta (MRR)</TableCell>
                      <TableCell className="text-center">R$</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(receitaBruta).replace('R$ ', '')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-red-600">(-) Impostos sobre Receita</TableCell>
                      <TableCell className="text-center text-red-600">R$</TableCell>
                      <TableCell className="text-right font-medium text-red-600">{formatCurrency(impostosReceita).replace('R$ ', '')}</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-medium">(=) Receita Líquida</TableCell>
                      <TableCell className="text-center">R$</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(receitaLiquida).replace('R$ ', '')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-red-600">(-) Custos diretos</TableCell>
                      <TableCell className="text-center text-red-600">R$</TableCell>
                      <TableCell className="text-right font-medium text-red-600">{formatCurrency(custosDiretos).replace('R$ ', '')}</TableCell>
                    </TableRow>
                    <TableRow className="pl-6">
                      <TableCell className="font-medium text-red-600 pl-8">(-) CSP Gestão</TableCell>
                      <TableCell className="text-center text-red-600">R$</TableCell>
                      <TableCell className="text-right font-medium text-red-600">{formatCurrency(custosGestao).replace('R$ ', '')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-red-600 pl-8">(-) CSP Ops</TableCell>
                      <TableCell className="text-center text-red-600">R$</TableCell>
                      <TableCell className="text-right font-medium text-red-600">{formatCurrency(custosOps).replace('R$ ', '')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-red-600 pl-8">(-) Auxílio</TableCell>
                      <TableCell className="text-center text-red-600">R$</TableCell>
                      <TableCell className="text-right font-medium text-red-600">-</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/50 border-t-2">
                      <TableCell className="font-bold">(=) Margem operacional</TableCell>
                      <TableCell className="text-center font-bold">R$</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(margemOperacional).replace('R$ ', '')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right font-bold text-sm">{margemPercentual.toFixed(2)}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductPositions;