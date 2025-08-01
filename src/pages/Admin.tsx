import { useState } from "react";
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

interface Product {
  id: string;
  produto: string;
  categoria: "saber" | "ter" | "executar" | "potencializar";
  duracao: string;
  dono: string;
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
  entregas: string;
  prerequisitos: string;
}

const Admin = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      produto: "Diagnóstico de Mídia Paga (Meta e Google Ads)",
      categoria: "saber",
      duracao: "15-30",
      dono: "Paulo Barros",
      pitch: true,
      bpmn: true,
      playbook: false,
      icp: true,
      pricing: false,
      certificacao: false,
      status: "Em produção",
      description: "Diagnóstico estratégico de performance em mídia paga para negócios que investem de forma consistente e desejam maximizar resultados.",
      detailedDescription: "Análise completa das campanhas de mídia paga nas principais plataformas digitais, incluindo Meta Ads e Google Ads. O diagnóstico identifica oportunidades de otimização, gaps estratégicos e recomendações específicas para maximizar o ROI dos investimentos em publicidade digital.",
      objetivos: "Identificar oportunidades de melhoria; Otimizar performance das campanhas; Aumentar ROI dos investimentos; Definir estratégias de crescimento",
      entregas: "Relatório executivo com diagnóstico completo; Planilha com análise detalhada das campanhas; Apresentação com recomendações estratégicas; Plano de ação para otimização",
      prerequisitos: "Acesso às contas de anúncios; Histórico de pelo menos 3 meses de campanhas; Dados de conversão configurados"
    },
    {
      id: "2", 
      produto: "E-commerce",
      categoria: "ter",
      duracao: "45-60",
      dono: "Oriana Finta",
      pitch: false,
      bpmn: false,
      playbook: true,
      icp: false,
      certificacao: true,
      pricing: true,
      status: "Disponível",
      description: "Implementação completa de plataforma de e-commerce com foco em conversão e experiência do usuário.",
      detailedDescription: "Desenvolvimento e implementação de loja virtual completa, incluindo design responsivo, integração com gateways de pagamento, sistema de gestão de produtos, relatórios analíticos e otimização para conversão.",
      objetivos: "Criar presença digital forte; Aumentar vendas online; Melhorar experiência do cliente; Automatizar processos de venda",
      entregas: "Plataforma e-commerce completa; Design responsivo e otimizado; Integração com pagamentos; Sistema de gestão de produtos; Relatórios e analytics",
      prerequisitos: "Catálogo de produtos definido; Identidade visual da marca; Conta nos gateways de pagamento"
    },
    {
      id: "3",
      produto: "Profissional de Google Ads",
      categoria: "executar",
      duracao: "30-45",
      dono: "Maria Silva",
      pitch: true,
      bpmn: true,
      playbook: true,
      icp: true,
      pricing: false,
      certificacao: false,
      status: "Em homologação",
      description: "Serviço especializado de gestão e otimização de campanhas Google Ads para maximizar resultados.",
      detailedDescription: "Gestão completa de campanhas Google Ads por profissional certificado, incluindo criação de campanhas, otimização contínua, relatórios detalhados e estratégias avançadas de bidding e segmentação.",
      objetivos: "Maximizar performance das campanhas; Reduzir custo por aquisição; Aumentar volume de conversões; Melhorar qualidade do tráfego",
      entregas: "Gestão completa das campanhas; Relatórios semanais de performance; Otimizações contínuas; Consultoria estratégica mensal",
      prerequisitos: "Conta Google Ads ativa; Budget mínimo definido; Pixel de conversão instalado"
    }
  ]);

  const [formData, setFormData] = useState<Partial<Product>>({
    categoria: "saber",
    status: "Em produção"
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "Disponível": { color: "bg-green-100 text-green-800" },
      "Em produção": { color: "bg-blue-100 text-blue-800" },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...formData as Product } : p));
      toast({
        title: "Produto atualizado",
        description: "As informações do produto foram atualizadas com sucesso.",
      });
    } else {
      const newProduct = {
        ...formData,
        id: Date.now().toString(),
      } as Product;
      
      setProducts([...products, newProduct]);
      toast({
        title: "Produto criado",
        description: "Novo produto adicionado ao portfólio com sucesso.",
      });
    }
    
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData({ categoria: "saber", status: "Em produção" });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast({
      title: "Produto removido",
      description: "O produto foi removido do portfólio.",
    });
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
      </div>
    </div>
  );
};

export default Admin;