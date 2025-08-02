import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, X, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SpicedTable from "@/components/SpicedTable";
import { supabase } from "@/integrations/supabase/client";

interface SpicedData {
  situation: { objetivo: string; perguntas: string; observar: string };
  pain: { objetivo: string; perguntas: string; observar: string };
  impact: { objetivo: string; perguntas: string; observar: string };
  criticalEvent: { objetivo: string; perguntas: string; observar: string };
  decision: { objetivo: string; perguntas: string; observar: string };
}

interface Product {
  id: string;
  produto: string;
  categoria: "saber" | "ter" | "executar" | "potencializar";
  duracao: string;
  dono: string;
  valor: string;
  pitch: boolean;
  bpmn: boolean;
  playbook: boolean;
  icp: boolean;
  pricing: boolean;
  certificacao: boolean;
  pitchUrl?: string;
  bpmnUrl?: string;
  playbookUrl?: string;
  icpUrl?: string;
  pricingUrl?: string;
  certificacaoUrl?: string;
  status: "Disponível" | "Em produção" | "Em homologação";
  description: string;
  detailedDescription: string;
  objetivos: string;
  spicedData: SpicedData;
  entregas: string;
  prerequisitos: string;
}

const Admin = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<Product>>({
    categoria: "saber",
    status: "Em produção"
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Erro ao carregar produtos",
          description: "Não foi possível carregar os produtos do banco de dados.",
          variant: "destructive"
        });
        return;
      }

      const formattedProducts = data?.map(product => ({
        id: product.id,
        produto: product.produto,
        categoria: product.categoria,
        duracao: product.duracao,
        dono: product.dono,
        valor: product.valor,
        pitch: product.pitch,
        bpmn: product.bpmn,
        playbook: product.playbook,
        icp: product.icp,
        pricing: product.pricing,
        certificacao: product.certificacao,
        pitchUrl: product.pitch_url,
        bpmnUrl: product.bpmn_url,
        playbookUrl: product.playbook_url,
        icpUrl: product.icp_url,
        pricingUrl: product.pricing_url,
        certificacaoUrl: product.certificacao_url,
        status: product.status,
        description: product.description,
        detailedDescription: product.detailed_description,
        objetivos: product.objetivos,
        spicedData: (product.spiced_data as unknown) as SpicedData,
        entregas: product.entregas,
        prerequisitos: product.prerequisitos
      })) || [];
      
      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao conectar com o banco de dados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "Disponível": { color: "bg-green-100 text-green-800" },
      "Em produção": { color: "bg-purple-100 text-purple-800" },
      "Em homologação": { color: "bg-yellow-100 text-yellow-800" }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig["Disponível"];
  };

  const getCategoryColor = (categoria: string) => {
    const colors = {
      "saber": "saber",
      "ter": "ter", 
      "executar": "executar",
      "potencializar": "potencializar"
    };
    return colors[categoria as keyof typeof colors] || "saber";
  };

  const StatusIcon = ({ value }: { value: boolean }) => (
    value ? (
      <Check className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-red-400" />
    )
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        // Atualizar produto existente
        const { error } = await supabase
          .from('products')
          .update({
            produto: formData.produto,
            categoria: formData.categoria,
            duracao: formData.duracao,
            dono: formData.dono,
            valor: formData.valor,
            pitch: formData.pitch,
            bpmn: formData.bpmn,
            playbook: formData.playbook,
            icp: formData.icp,
            pricing: formData.pricing,
            certificacao: formData.certificacao,
            pitch_url: formData.pitchUrl,
            bpmn_url: formData.bpmnUrl,
            playbook_url: formData.playbookUrl,
            icp_url: formData.icpUrl,
            pricing_url: formData.pricingUrl,
            certificacao_url: formData.certificacaoUrl,
            status: formData.status,
            description: formData.description,
            detailed_description: formData.detailedDescription,
            objetivos: formData.objetivos,
            spiced_data: formData.spicedData as any,
            entregas: formData.entregas,
            prerequisitos: formData.prerequisitos,
          })
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({
          title: "Produto atualizado",
          description: "As informações do produto foram atualizadas com sucesso.",
        });
      } else {
        // Criar novo produto
        const { error } = await supabase
          .from('products')
          .insert({
            produto: formData.produto,
            categoria: formData.categoria,
            duracao: formData.duracao,
            dono: formData.dono,
            valor: formData.valor,
            pitch: formData.pitch || false,
            bpmn: formData.bpmn || false,
            playbook: formData.playbook || false,
            icp: formData.icp || false,
            pricing: formData.pricing || false,
            certificacao: formData.certificacao || false,
            pitch_url: formData.pitchUrl,
            bpmn_url: formData.bpmnUrl,
            playbook_url: formData.playbookUrl,
            icp_url: formData.icpUrl,
            pricing_url: formData.pricingUrl,
            certificacao_url: formData.certificacaoUrl,
            status: formData.status,
            description: formData.description,
            detailed_description: formData.detailedDescription,
            objetivos: formData.objetivos,
            spiced_data: (formData.spicedData || {
              situation: { objetivo: "", perguntas: "", observar: "" },
              pain: { objetivo: "", perguntas: "", observar: "" },
              impact: { objetivo: "", perguntas: "", observar: "" },
              criticalEvent: { objetivo: "", perguntas: "", observar: "" },
              decision: { objetivo: "", perguntas: "", observar: "" }
            }) as any,
            entregas: formData.entregas,
            prerequisitos: formData.prerequisitos,
          });

        if (error) throw error;

        toast({
          title: "Produto criado",
          description: "Novo produto adicionado ao portfólio com sucesso.",
        });
      }
      
      // Recarregar a lista de produtos
      await fetchProducts();
      
      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData({ categoria: "saber", status: "Em produção" });
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o produto. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Produto removido",
        description: "O produto foi removido do portfólio.",
      });
      
      // Recarregar a lista de produtos
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível remover o produto. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const openNewProductDialog = () => {
    setEditingProduct(null);
    setFormData({ categoria: "saber", status: "Em produção" });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gestão completa do portfólio de produtos</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewProductDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do produto para o portfólio STEP.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="produto">Nome do Produto</Label>
                    <Input
                      id="produto"
                      value={formData.produto || ""}
                      onChange={(e) => setFormData({...formData, produto: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria STEP</Label>
                    <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value as any})}>
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="duracao">Duração (dias)</Label>
                    <Input
                      id="duracao"
                      value={formData.duracao || ""}
                      onChange={(e) => setFormData({...formData, duracao: e.target.value})}
                      placeholder="ex: 15-30"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dono">Responsável</Label>
                    <Input
                      id="dono"
                      value={formData.dono || ""}
                      onChange={(e) => setFormData({...formData, dono: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor Base</Label>
                    <Input
                      id="valor"
                      value={formData.valor || ""}
                      onChange={(e) => setFormData({...formData, valor: e.target.value})}
                      placeholder="ex: R$ 5.000,00"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})}>
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

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">O que é o produto?</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descrição resumida para os cards do portfólio"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="detailedDescription">Pra quem é o produto?</Label>
                    <Textarea
                      id="detailedDescription"
                      value={formData.detailedDescription || ""}
                      onChange={(e) => setFormData({...formData, detailedDescription: e.target.value})}
                      placeholder="Público-alvo e perfil do cliente ideal para o produto"
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="objetivos">Como vender o produto?</Label>
                    <Textarea
                      id="objetivos"
                      value={formData.objetivos || ""}
                      onChange={(e) => setFormData({...formData, objetivos: e.target.value})}
                      placeholder="Estratégias e abordagens de vendas para o produto"
                      rows={3}
                    />
                  </div>

                  {/* Tabela SPICED */}
                  <SpicedTable
                    data={formData.spicedData || {
                      situation: { objetivo: "", perguntas: "", observar: "" },
                      pain: { objetivo: "", perguntas: "", observar: "" },
                      impact: { objetivo: "", perguntas: "", observar: "" },
                      criticalEvent: { objetivo: "", perguntas: "", observar: "" },
                      decision: { objetivo: "", perguntas: "", observar: "" }
                    }}
                    onChange={(spicedData) => setFormData({...formData, spicedData})}
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="entregas">Como cobrar o produto?</Label>
                    <Textarea
                      id="entregas"
                      value={formData.entregas || ""}
                      onChange={(e) => setFormData({...formData, entregas: e.target.value})}
                      placeholder="Modelo de precificação e formas de cobrança"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="prerequisitos">Pré-requisitos</Label>
                    <Textarea
                      id="prerequisitos"
                      value={formData.prerequisitos || ""}
                      onChange={(e) => setFormData({...formData, prerequisitos: e.target.value})}
                      placeholder="Requisitos necessários para iniciar o projeto"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pitch */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pitch"
                          checked={formData.pitch || false}
                          onCheckedChange={(checked) => setFormData({...formData, pitch: checked as boolean})}
                        />
                        <Label htmlFor="pitch">Pitch</Label>
                      </div>
                      {formData.pitch && (
                        <div className="space-y-2">
                          <Label htmlFor="pitchUrl">URL do Pitch</Label>
                          <Input
                            id="pitchUrl"
                            value={formData.pitchUrl || ""}
                            onChange={(e) => setFormData({...formData, pitchUrl: e.target.value})}
                            placeholder="https://exemplo.com/pitch"
                          />
                        </div>
                      )}
                    </div>

                    {/* BPMN */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="bpmn"
                          checked={formData.bpmn || false}
                          onCheckedChange={(checked) => setFormData({...formData, bpmn: checked as boolean})}
                        />
                        <Label htmlFor="bpmn">BPMN</Label>
                      </div>
                      {formData.bpmn && (
                        <div className="space-y-2">
                          <Label htmlFor="bpmnUrl">URL do BPMN</Label>
                          <Input
                            id="bpmnUrl"
                            value={formData.bpmnUrl || ""}
                            onChange={(e) => setFormData({...formData, bpmnUrl: e.target.value})}
                            placeholder="https://exemplo.com/bpmn"
                          />
                        </div>
                      )}
                    </div>

                    {/* Playbook */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="playbook"
                          checked={formData.playbook || false}
                          onCheckedChange={(checked) => setFormData({...formData, playbook: checked as boolean})}
                        />
                        <Label htmlFor="playbook">Playbook</Label>
                      </div>
                      {formData.playbook && (
                        <div className="space-y-2">
                          <Label htmlFor="playbookUrl">URL do Playbook</Label>
                          <Input
                            id="playbookUrl"
                            value={formData.playbookUrl || ""}
                            onChange={(e) => setFormData({...formData, playbookUrl: e.target.value})}
                            placeholder="https://exemplo.com/playbook"
                          />
                        </div>
                      )}
                    </div>

                    {/* ICP */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="icp"
                          checked={formData.icp || false}
                          onCheckedChange={(checked) => setFormData({...formData, icp: checked as boolean})}
                        />
                        <Label htmlFor="icp">ICP</Label>
                      </div>
                      {formData.icp && (
                        <div className="space-y-2">
                          <Label htmlFor="icpUrl">URL do ICP</Label>
                          <Input
                            id="icpUrl"
                            value={formData.icpUrl || ""}
                            onChange={(e) => setFormData({...formData, icpUrl: e.target.value})}
                            placeholder="https://exemplo.com/icp"
                          />
                        </div>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pricing"
                          checked={formData.pricing || false}
                          onCheckedChange={(checked) => setFormData({...formData, pricing: checked as boolean})}
                        />
                        <Label htmlFor="pricing">Pricing</Label>
                      </div>
                      {formData.pricing && (
                        <div className="space-y-2">
                          <Label htmlFor="pricingUrl">URL do Pricing</Label>
                          <Input
                            id="pricingUrl"
                            value={formData.pricingUrl || ""}
                            onChange={(e) => setFormData({...formData, pricingUrl: e.target.value})}
                            placeholder="https://exemplo.com/pricing"
                          />
                        </div>
                      )}
                    </div>

                    {/* Certificação */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="certificacao"
                          checked={formData.certificacao || false}
                          onCheckedChange={(checked) => setFormData({...formData, certificacao: checked as boolean})}
                        />
                        <Label htmlFor="certificacao">Certificação</Label>
                      </div>
                      {formData.certificacao && (
                        <div className="space-y-2">
                          <Label htmlFor="certificacaoUrl">URL da Certificação</Label>
                          <Input
                            id="certificacaoUrl"
                            value={formData.certificacaoUrl || ""}
                            onChange={(e) => setFormData({...formData, certificacaoUrl: e.target.value})}
                            placeholder="https://exemplo.com/certificacao"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingProduct ? "Atualizar" : "Criar"} Produto
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Duração (dias)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Valor Base
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Dono
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Pitch
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      BPMN
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Playbook
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      ICP
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Pricing
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Certificação
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {products.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-card-foreground">{item.produto}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant="secondary"
                          className="text-white"
                          style={{backgroundColor: `hsl(var(--${getCategoryColor(item.categoria)}))`}}
                        >
                          {item.categoria.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{item.duracao}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground font-medium">{item.valor}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{item.dono}</td>
                      <td className="px-6 py-4 text-center">
                        <StatusIcon value={item.pitch} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusIcon value={item.bpmn} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusIcon value={item.playbook} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusIcon value={item.icp} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusIcon value={item.pricing} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusIcon value={item.certificacao} />
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status).color}`}>
                          {item.status}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {!loading && products.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Nenhum produto cadastrado. Clique em "Novo Produto" para começar.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Admin;