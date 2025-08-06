import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import SpicedTable from "@/components/SpicedTable";
import ComoEntregoTable from "@/components/ComoEntregoTable";
import { Plus, Edit, Trash2 } from "lucide-react";

interface SpicedData {
  situation: { objetivo: string; perguntas: string; observar: string };
  pain: { objetivo: string; perguntas: string; observar: string };
  impact: { objetivo: string; perguntas: string; observar: string };
  criticalEvent: { objetivo: string; perguntas: string; observar: string };
  decision: { objetivo: string; perguntas: string; observar: string };
}

interface ComoEntregoItem {
  fase: string;
  etapa: string;
  tarefa: string;
  dri: string;
  estimativaHoras: string;
  comoExecutar: string;
}

interface Position {
  id: string;
  nome: string;
  cph: number;
  investimento_total: number;
}

interface Product {
  id: string;
  produto: string;
  categoria: string;
  duracao: string;
  dono: string;
  valor: string;
  status: string;
  description: string;
  descricao_card?: string;
  como_vendo: string;
  spiced_data: SpicedData;
  como_entrego_dados: ComoEntregoItem[];
  markup?: number;
  // Novos campos da estrutura expandida
  icp?: string;
  escopo?: string;
  duracao_media?: string;
  time_envolvido?: string;
  formato_entrega?: string;
  descricao_completa?: string;
}

const Admin = () => {
  const { toast } = useToast();
  
  // Estados para produtos
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para posições
  const [positions, setPositions] = useState<Position[]>([]);
  const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  
  // Form states
  const [productForm, setProductForm] = useState({
    produto: '',
    categoria: 'saber',
    duracao: '',
    dono: '',
    valor: '',
    status: 'Disponível',
    description: '',
    descricao_card: '',
    como_vendo: '',
    icp: '',
    escopo: '',
    duracao_media: '',
    time_envolvido: '',
    formato_entrega: '',
    descricao_completa: '',
    markup: 1
  });

  const [positionForm, setPositionForm] = useState({
    nome: '',
    cph: '',
    investimento_total: ''
  });

  const [spicedData, setSpicedData] = useState<SpicedData>({
    situation: { objetivo: "", perguntas: "", observar: "" },
    pain: { objetivo: "", perguntas: "", observar: "" },
    impact: { objetivo: "", perguntas: "", observar: "" },
    criticalEvent: { objetivo: "", perguntas: "", observar: "" },
    decision: { objetivo: "", perguntas: "", observar: "" }
  });

  const [comoEntregoDados, setComoEntregoDados] = useState<ComoEntregoItem[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchPositions();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedProducts = data.map(product => ({
        id: product.id,
        produto: product.produto,
        categoria: product.categoria,
        duracao: product.duracao,
        dono: product.dono,
        valor: product.valor,
        status: product.status,
        description: product.description,
        descricao_card: product.descricao_card,
        como_vendo: product.como_vendo,
        spiced_data: (product.spiced_data as unknown as SpicedData) || {
          situation: { objetivo: "", perguntas: "", observar: "" },
          pain: { objetivo: "", perguntas: "", observar: "" },
          impact: { objetivo: "", perguntas: "", observar: "" },
          criticalEvent: { objetivo: "", perguntas: "", observar: "" },
          decision: { objetivo: "", perguntas: "", observar: "" }
        },
        como_entrego_dados: (product.como_entrego_dados as unknown as ComoEntregoItem[]) || [],
        markup: product.markup,
        icp: typeof product.icp === 'string' ? product.icp : undefined,
        escopo: product.escopo,
        duracao_media: product.duracao_media,
        time_envolvido: product.time_envolvido,
        formato_entrega: product.formato_entrega,
        descricao_completa: product.descricao_completa
      }));
      
      setProducts(formattedProducts);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  const handleSaveProduct = async () => {
    try {
      const productData = {
        produto: productForm.produto,
        categoria: productForm.categoria as "saber" | "ter" | "executar" | "potencializar",
        duracao: productForm.duracao,
        dono: productForm.dono,
        valor: productForm.valor,
        status: productForm.status as "Disponível" | "Em produção" | "Em homologação",
        description: productForm.description,
        descricao_card: productForm.descricao_card || null,
        como_vendo: productForm.como_vendo,
        o_que_entrego: productForm.description,
        spiced_data: spicedData,
        como_entrego_dados: comoEntregoDados,
        markup: productForm.markup,
        icp: productForm.icp || null,
        escopo: productForm.escopo || null,
        duracao_media: productForm.duracao_media || null,
        time_envolvido: productForm.time_envolvido || null,
        formato_entrega: productForm.formato_entrega || null,
        descricao_completa: productForm.descricao_completa || null
      } as any;

      let error;
      if (editingProduct) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert([productData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: editingProduct ? "Produto atualizado!" : "Produto criado!"
      });

      resetProductForm();
      setIsProductDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar produto",
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      produto: product.produto,
      categoria: product.categoria,
      duracao: product.duracao,
      dono: product.dono,
      valor: product.valor,
      status: product.status,
      description: product.description,
      descricao_card: product.descricao_card || '',
      como_vendo: product.como_vendo,
      icp: product.icp || '',
      escopo: product.escopo || '',
      duracao_media: product.duracao_media || '',
      time_envolvido: product.time_envolvido || '',
      formato_entrega: product.formato_entrega || '',
      descricao_completa: product.descricao_completa || '',
      markup: product.markup || 1
    });
    setSpicedData(product.spiced_data || {
      situation: { objetivo: "", perguntas: "", observar: "" },
      pain: { objetivo: "", perguntas: "", observar: "" },
      impact: { objetivo: "", perguntas: "", observar: "" },
      criticalEvent: { objetivo: "", perguntas: "", observar: "" },
      decision: { objetivo: "", perguntas: "", observar: "" }
    });
    setComoEntregoDados(product.como_entrego_dados || []);
    setIsProductDialogOpen(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({
      produto: '',
      categoria: 'saber',
      duracao: '',
      dono: '',
      valor: '',
      status: 'Disponível',
      description: '',
      descricao_card: '',
      como_vendo: '',
      icp: '',
      escopo: '',
      duracao_media: '',
      time_envolvido: '',
      formato_entrega: '',
      descricao_completa: '',
      markup: 1
    });
    setSpicedData({
      situation: { objetivo: "", perguntas: "", observar: "" },
      pain: { objetivo: "", perguntas: "", observar: "" },
      impact: { objetivo: "", perguntas: "", observar: "" },
      criticalEvent: { objetivo: "", perguntas: "", observar: "" },
      decision: { objetivo: "", perguntas: "", observar: "" }
    });
    setComoEntregoDados([]);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Produto excluído!"
      });

      fetchProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir produto",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Administração</h1>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="positions">Posições</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Produtos</CardTitle>
                  <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetProductForm}>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Produto
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                        </DialogTitle>
                      </DialogHeader>

                      <Tabs defaultValue="basico" className="mt-4">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="basico">Básico</TabsTrigger>
                          <TabsTrigger value="visao">Visão Geral</TabsTrigger>
                          <TabsTrigger value="venda">Como Vendo</TabsTrigger>
                          <TabsTrigger value="entrega">Como Entrego</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basico" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="produto">Nome do Produto</Label>
                              <Input
                                id="produto"
                                value={productForm.produto}
                                onChange={(e) => setProductForm({...productForm, produto: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="categoria">Categoria</Label>
                              <Select
                                value={productForm.categoria}
                                onValueChange={(value) => setProductForm({...productForm, categoria: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="saber">SABER</SelectItem>
                                  <SelectItem value="ter">TER</SelectItem>
                                  <SelectItem value="executar">EXECUTAR</SelectItem>
                                  <SelectItem value="potencializar">POTENCIALIZAR</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="duracao">Duração</Label>
                              <Input
                                id="duracao"
                                value={productForm.duracao}
                                onChange={(e) => setProductForm({...productForm, duracao: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="valor">Valor</Label>
                              <Input
                                id="valor"
                                value={productForm.valor}
                                onChange={(e) => setProductForm({...productForm, valor: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="dono">Dono</Label>
                              <Input
                                id="dono"
                                value={productForm.dono}
                                onChange={(e) => setProductForm({...productForm, dono: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="status">Status</Label>
                              <Select
                                value={productForm.status}
                                onValueChange={(value) => setProductForm({...productForm, status: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Disponível">Disponível</SelectItem>
                                  <SelectItem value="Em produção">Em produção</SelectItem>
                                  <SelectItem value="Em homologação">Em homologação</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="descricao_card">Descrição do Card</Label>
                            <Textarea
                              id="descricao_card"
                              value={productForm.descricao_card}
                              onChange={(e) => setProductForm({...productForm, descricao_card: e.target.value})}
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="visao" className="space-y-4">
                          <div>
                            <Label htmlFor="icp">ICP (Ideal Customer Profile)</Label>
                            <Textarea
                              id="icp"
                              value={productForm.icp}
                              onChange={(e) => setProductForm({...productForm, icp: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="escopo">Escopo</Label>
                            <Textarea
                              id="escopo"
                              value={productForm.escopo}
                              onChange={(e) => setProductForm({...productForm, escopo: e.target.value})}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="duracao_media">Duração Média</Label>
                              <Input
                                id="duracao_media"
                                value={productForm.duracao_media}
                                onChange={(e) => setProductForm({...productForm, duracao_media: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="time_envolvido">Time Envolvido</Label>
                              <Input
                                id="time_envolvido"
                                value={productForm.time_envolvido}
                                onChange={(e) => setProductForm({...productForm, time_envolvido: e.target.value})}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="formato_entrega">Formato de Entrega</Label>
                            <Textarea
                              id="formato_entrega"
                              value={productForm.formato_entrega}
                              onChange={(e) => setProductForm({...productForm, formato_entrega: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="descricao_completa">Descrição Completa</Label>
                            <Textarea
                              id="descricao_completa"
                              value={productForm.descricao_completa}
                              onChange={(e) => setProductForm({...productForm, descricao_completa: e.target.value})}
                              rows={5}
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="venda" className="space-y-4">
                          <div>
                            <Label htmlFor="como_vendo">Como eu vendo?</Label>
                            <Textarea
                              id="como_vendo"
                              value={productForm.como_vendo}
                              onChange={(e) => setProductForm({...productForm, como_vendo: e.target.value})}
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label>Metodologia SPICED</Label>
                            <SpicedTable 
                              data={spicedData} 
                              onChange={setSpicedData}
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="entrega" className="space-y-4">
                          <div>
                            <Label htmlFor="description">Como eu entrego?</Label>
                            <Textarea
                              id="description"
                              value={productForm.description}
                              onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label>Etapas de Entrega</Label>
                            <ComoEntregoTable 
                              data={comoEntregoDados} 
                              onChange={(data) => setComoEntregoDados(data as any)}
                              positions={positions}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>

                      <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveProduct}>
                          {editingProduct ? 'Atualizar' : 'Criar'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {products.map((product) => (
                    <Card key={product.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{product.produto}</h3>
                            <Badge variant="outline">{product.categoria.toUpperCase()}</Badge>
                            <Badge variant="default">{product.status}</Badge>
                          </div>
                          {product.descricao_card && (
                            <p className="text-sm text-muted-foreground mb-2">{product.descricao_card}</p>
                          )}
                          <div className="text-sm text-muted-foreground">
                            <span>Valor: {product.valor}</span> • 
                            <span>Duração: {product.duracao}</span> • 
                            <span>Dono: {product.dono}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positions">
            <Card>
              <CardHeader>
                <CardTitle>Posições</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Gestão de posições será implementada aqui.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;