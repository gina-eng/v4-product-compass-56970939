import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, X, Plus, Edit, Trash2, Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import SpicedTable from "@/components/SpicedTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteSettings } from "@/hooks/useSiteSettings";

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
  categoria: string;
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
  status: string;
  description: string;
  detailedDescription: string;
  objetivos: string;
  spicedData: SpicedData;
  entregas: string;
  prerequisitos: string;
  bonusKpi?: string;
  kpiPrincipal?: string;
  tempoMetaKpi?: string;
  garantiaEspecifica?: string;
  stackDigital?: string;
  entregaveisRelacionados?: string;
}

const Admin = () => {
  const { settings, updateSetting, isTableAvailable } = useSiteSettings();
  const [localSettings, setLocalSettings] = useState({
    step_title: '',
    step_description: '',
    saber_subtitle: '',
    saber_description: '',
    ter_subtitle: '',
    ter_description: '',
    executar_subtitle: '',
    executar_description: '',
    potencializar_subtitle: '',
    potencializar_description: ''
  });
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("Todas");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    produto: "",
    categoria: "saber",
    duracao: "",
    dono: "",
    valor: "",
    pitch: false,
    bpmn: false,
    playbook: false,
    icp: false,
    pricing: false,
    certificacao: false,
    pitchUrl: "",
    bpmnUrl: "",
    playbookUrl: "",
    icpUrl: "",
    pricingUrl: "",
    certificacaoUrl: "",
    status: "Em produção",
    description: "",
    detailedDescription: "",
    objetivos: "",
    spicedData: {
      situation: { objetivo: "", perguntas: "", observar: "" },
      pain: { objetivo: "", perguntas: "", observar: "" },
      impact: { objetivo: "", perguntas: "", observar: "" },
      criticalEvent: { objetivo: "", perguntas: "", observar: "" },
      decision: { objetivo: "", perguntas: "", observar: "" }
    } as SpicedData,
    entregas: "",
    prerequisitos: "",
    bonusKpi: "",
    kpiPrincipal: "",
    tempoMetaKpi: "",
    garantiaEspecifica: "",
    stackDigital: "",
    entregaveisRelacionados: ""
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  // Sincronizar configurações locais com as globais
  useEffect(() => {
    setLocalSettings({
      step_title: settings.step_title,
      step_description: settings.step_description,
      saber_subtitle: settings.saber_subtitle,
      saber_description: settings.saber_description,
      ter_subtitle: settings.ter_subtitle,
      ter_description: settings.ter_description,
      executar_subtitle: settings.executar_subtitle,
      executar_description: settings.executar_description,
      potencializar_subtitle: settings.potencializar_subtitle,
      potencializar_description: settings.potencializar_description
    });
    setSettingsChanged(false);
  }, [settings]);

  const handleSettingChange = (key: string, value: string) => {
    const newLocalSettings = { ...localSettings, [key]: value };
    setLocalSettings(newLocalSettings);
    
    // Verificar se há mudanças comparando todos os campos
    const hasChanges = Object.keys(newLocalSettings).some(settingKey => 
      newLocalSettings[settingKey as keyof typeof newLocalSettings] !== settings[settingKey as keyof typeof settings]
    );
    
    console.log('Verificando mudanças:', { 
      key, 
      value, 
      hasChanges, 
      newLocalSettings, 
      settings 
    });
    
    setSettingsChanged(hasChanges);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    console.log('Iniciando salvamento das configurações...', { localSettings, isTableAvailable });
    
    try {
      let hasChanges = false;
      
      if (localSettings.step_title !== settings.step_title) {
        console.log('Salvando step_title:', localSettings.step_title);
        const result = await updateSetting('step_title', localSettings.step_title);
        console.log('Resultado step_title:', result);
        hasChanges = true;
      }
      
      if (localSettings.step_description !== settings.step_description) {
        console.log('Salvando step_description:', localSettings.step_description);
        const result = await updateSetting('step_description', localSettings.step_description);
        console.log('Resultado step_description:', result);
        hasChanges = true;
      }

      if (hasChanges) {
        toast({
          title: "Configurações salvas",
          description: "As configurações do site foram atualizadas com sucesso.",
        });
        setSettingsChanged(false);
      } else {
        toast({
          title: "Nenhuma alteração",
          description: "Não há alterações para salvar.",
        });
      }
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações.",
        variant: "destructive",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts: Product[] = (data || []).map(product => ({
        id: product.id,
        produto: product.produto,
        categoria: product.categoria,
        duracao: product.duracao,
        dono: product.dono,
        valor: product.valor,
        pitch: product.pitch || false,
        bpmn: product.bpmn || false,
        playbook: product.playbook || false,
        icp: product.icp || false,
        pricing: product.pricing || false,
        certificacao: product.certificacao || false,
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
        spicedData: (product.spiced_data as unknown as SpicedData) || {
          situation: { objetivo: "", perguntas: "", observar: "" },
          pain: { objetivo: "", perguntas: "", observar: "" },
          impact: { objetivo: "", perguntas: "", observar: "" },
          criticalEvent: { objetivo: "", perguntas: "", observar: "" },
          decision: { objetivo: "", perguntas: "", observar: "" }
        },
        entregas: product.entregas,
        prerequisitos: product.prerequisitos,
        bonusKpi: product.bonus_kpi,
        kpiPrincipal: product.kpi_principal,
        tempoMetaKpi: product.tempo_meta_kpi,
        garantiaEspecifica: product.garantia_especifica,
        stackDigital: product.stack_digital,
        entregaveisRelacionados: product.entregaveis_relacionados,
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        // Atualizar produto existente
        const { error } = await supabase
          .from('products')
          .update({
            produto: formData.produto,
            categoria: formData.categoria as any,
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
            status: formData.status as any,
            description: formData.description,
            detailed_description: formData.detailedDescription,
            objetivos: formData.objetivos,
            spiced_data: formData.spicedData as any,
            entregas: formData.entregas,
            prerequisitos: formData.prerequisitos,
            bonus_kpi: formData.bonusKpi,
            kpi_principal: formData.kpiPrincipal as any,
            tempo_meta_kpi: formData.tempoMetaKpi as any,
            garantia_especifica: formData.garantiaEspecifica,
            stack_digital: formData.stackDigital,
            entregaveis_relacionados: formData.entregaveisRelacionados,
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
            categoria: formData.categoria as any,
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
            status: formData.status as any,
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
            bonus_kpi: formData.bonusKpi,
            kpi_principal: formData.kpiPrincipal as any,
            tempo_meta_kpi: formData.tempoMetaKpi as any,
            garantia_especifica: formData.garantiaEspecifica,
            stack_digital: formData.stackDigital,
            entregaveis_relacionados: formData.entregaveisRelacionados,
          });

        if (error) throw error;

        toast({
          title: "Produto criado",
          description: "O produto foi criado com sucesso.",
        });
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData({ categoria: "saber", status: "Em produção" } as any);
      await fetchProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar produto.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
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
      pitchUrl: product.pitchUrl || "",
      bpmnUrl: product.bpmnUrl || "",
      playbookUrl: product.playbookUrl || "",
      icpUrl: product.icpUrl || "",
      pricingUrl: product.pricingUrl || "",
      certificacaoUrl: product.certificacaoUrl || "",
      status: product.status,
      description: product.description,
      detailedDescription: product.detailedDescription,
      objetivos: product.objetivos,
      spicedData: product.spicedData,
      entregas: product.entregas,
      prerequisitos: product.prerequisitos,
      bonusKpi: product.bonusKpi || "",
      kpiPrincipal: product.kpiPrincipal || "",
      tempoMetaKpi: product.tempoMetaKpi || "",
      garantiaEspecifica: product.garantiaEspecifica || "",
      stackDigital: product.stackDigital || "",
      entregaveisRelacionados: product.entregaveisRelacionados || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso.",
      });

      await fetchProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir produto.",
        variant: "destructive",
      });
    }
  };

  const openNewProductDialog = () => {
    setEditingProduct(null);
    setFormData({ categoria: "saber", status: "Em produção" } as any);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Disponível":
        return { label: "Disponível", color: "bg-green-500 text-white" };
      case "Em produção":
        return { label: "Em produção", color: "bg-yellow-500 text-black" };
      case "Inativo":
        return { label: "Inativo", color: "bg-gray-500 text-white" };
      default:
        return { label: status, color: "bg-gray-500 text-white" };
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case "saber":
        return "saber";
      case "ter":
        return "ter";
      case "executar":
        return "executar";
      case "potencializar":
        return "potencializar";
      default:
        return "primary";
    }
  };

  const StatusIcon = ({ value }: { value: boolean }) => (
    value ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />
  );

  const filterProducts = () => {
    let filtered = products;

    if (categoryFilter !== "Todas") {
      filtered = filtered.filter(product => product.categoria === categoryFilter);
    }

    if (statusFilter !== "Todos") {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    filterProducts();
  }, [products, categoryFilter, statusFilter]);

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="settings">Configurações do Site</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Administração de Produtos</h1>
            <Button onClick={openNewProductDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas as categorias</SelectItem>
                  <SelectItem value="saber">Saber</SelectItem>
                  <SelectItem value="ter">Ter</SelectItem>
                  <SelectItem value="executar">Executar</SelectItem>
                  <SelectItem value="potencializar">Potencializar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos os status</SelectItem>
                  <SelectItem value="Disponível">Disponível</SelectItem>
                  <SelectItem value="Em produção">Em produção</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do produto
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="produto">Nome do Produto *</Label>
                      <Input
                        id="produto"
                        value={formData.produto}
                        onChange={(e) => setFormData({...formData, produto: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria *</Label>
                      <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value as any})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="saber">Saber</SelectItem>
                          <SelectItem value="ter">Ter</SelectItem>
                          <SelectItem value="executar">Executar</SelectItem>
                          <SelectItem value="potencializar">Potencializar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duracao">Duração *</Label>
                      <Input
                        id="duracao"
                        value={formData.duracao}
                        onChange={(e) => setFormData({...formData, duracao: e.target.value})}
                        placeholder="Ex: 3 meses"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dono">Dono do Produto *</Label>
                      <Input
                        id="dono"
                        value={formData.dono}
                        onChange={(e) => setFormData({...formData, dono: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor Base *</Label>
                      <Input
                        id="valor"
                        value={formData.valor}
                        onChange={(e) => setFormData({...formData, valor: e.target.value})}
                        placeholder="Ex: R$ 10.000"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Disponível">Disponível</SelectItem>
                          <SelectItem value="Em produção">Em produção</SelectItem>
                          <SelectItem value="Inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição Breve *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="detailedDescription">Descrição Detalhada *</Label>
                      <Textarea
                        id="detailedDescription"
                        value={formData.detailedDescription}
                        onChange={(e) => setFormData({...formData, detailedDescription: e.target.value})}
                        rows={4}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="objetivos">Objetivos *</Label>
                      <Textarea
                        id="objetivos"
                        value={formData.objetivos}
                        onChange={(e) => setFormData({...formData, objetivos: e.target.value})}
                        rows={3}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Tabela SPICED</Label>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="entregas">Entregas *</Label>
                    <Textarea
                      id="entregas"
                      value={formData.entregas}
                      onChange={(e) => setFormData({...formData, entregas: e.target.value})}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prerequisitos">Pré-requisitos *</Label>
                    <Textarea
                      id="prerequisitos"
                      value={formData.prerequisitos}
                      onChange={(e) => setFormData({...formData, prerequisitos: e.target.value})}
                      rows={4}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bonusKpi">Bônus KPI</Label>
                    <Textarea
                      id="bonusKpi"
                      value={formData.bonusKpi || ""}
                      onChange={(e) => setFormData({...formData, bonusKpi: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kpiPrincipal">KPI Principal</Label>
                    <Select value={formData.kpiPrincipal || ""} onValueChange={(value) => setFormData({...formData, kpiPrincipal: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Receita">Receita</SelectItem>
                        <SelectItem value="Leads">Leads</SelectItem>
                        <SelectItem value="Conversão">Conversão</SelectItem>
                        <SelectItem value="Satisfação">Satisfação</SelectItem>
                        <SelectItem value="Retenção">Retenção</SelectItem>
                        <SelectItem value="Eficiência">Eficiência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tempoMetaKpi">Tempo Meta KPI</Label>
                    <Select value={formData.tempoMetaKpi || ""} onValueChange={(value) => setFormData({...formData, tempoMetaKpi: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1_mes">1 mês</SelectItem>
                        <SelectItem value="3_meses">3 meses</SelectItem>
                        <SelectItem value="6_meses">6 meses</SelectItem>
                        <SelectItem value="1_ano">1 ano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="garantiaEspecifica">Garantia Específica</Label>
                    <Textarea
                      id="garantiaEspecifica"
                      value={formData.garantiaEspecifica || ""}
                      onChange={(e) => setFormData({...formData, garantiaEspecifica: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stackDigital">Stack Digital</Label>
                    <Textarea
                      id="stackDigital"
                      value={formData.stackDigital || ""}
                      onChange={(e) => setFormData({...formData, stackDigital: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entregaveisRelacionados">Entregáveis Relacionados</Label>
                    <Textarea
                      id="entregaveisRelacionados"
                      value={formData.entregaveisRelacionados || ""}
                      onChange={(e) => setFormData({...formData, entregaveisRelacionados: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Recursos Disponíveis</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando produtos...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {/* Cards de resumo dos produtos */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-card-foreground line-clamp-2">
                            {product.produto}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant="secondary"
                              className="text-white text-xs"
                              style={{backgroundColor: `hsl(var(--${getCategoryColor(product.categoria)}))`}}
                            >
                              {product.categoria.toUpperCase()}
                            </Badge>
                            <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(product.status).color}`}>
                              {getStatusBadge(product.status).label}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {product.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Dono:</span>
                          <span className="font-medium">{product.dono}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Duração:</span>
                          <span className="font-medium">{product.duracao}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="font-medium">{product.valor}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {product.pitch && <Badge variant="outline" className="text-xs">Pitch</Badge>}
                        {product.bpmn && <Badge variant="outline" className="text-xs">BPMN</Badge>}
                        {product.playbook && <Badge variant="outline" className="text-xs">Playbook</Badge>}
                        {product.icp && <Badge variant="outline" className="text-xs">ICP</Badge>}
                        {product.pricing && <Badge variant="outline" className="text-xs">Pricing</Badge>}
                        {product.certificacao && <Badge variant="outline" className="text-xs">Certificação</Badge>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Tabela detalhada para telas grandes */}
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Produto</th>
                        <th className="text-left p-4 font-medium">Categoria</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Dono</th>
                        <th className="text-left p-4 font-medium">Duração</th>
                        <th className="text-left p-4 font-medium">Valor</th>
                        <th className="text-center p-4 font-medium">Recursos</th>
                        <th className="text-center p-4 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-t hover:bg-muted/25">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{product.produto}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {product.description}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge 
                              variant="secondary"
                              className="text-white"
                              style={{backgroundColor: `hsl(var(--${getCategoryColor(product.categoria)}))`}}
                            >
                              {product.categoria.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(product.status).color}`}>
                              {getStatusBadge(product.status).label}
                            </div>
                          </td>
                          <td className="p-4 text-sm">{product.dono}</td>
                          <td className="p-4 text-sm">{product.duracao}</td>
                          <td className="p-4 text-sm font-medium">{product.valor}</td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <StatusIcon value={product.pitch} />
                              <StatusIcon value={product.bpmn} />
                              <StatusIcon value={product.playbook} />
                              <StatusIcon value={product.icp} />
                              <StatusIcon value={product.pricing} />
                              <StatusIcon value={product.certificacao} />
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDelete(product.id)}>
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
          )}

          {!loading && filteredProducts.length === 0 && products.length > 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Nenhum produto encontrado com os filtros selecionados.</p>
            </Card>
          )}

          {!loading && products.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Nenhum produto cadastrado. Clique em "Novo Produto" para começar.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-6">Configurações do Site</h1>
            
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Textos da Página Principal</h3>
                  {!isTableAvailable && (
                    <Badge variant="outline" className="text-xs">
                      Apenas Preview (Tabela não disponível)
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="stepTitle">Título da Seção STEP</Label>
                    <Input
                      id="stepTitle"
                      value={localSettings.step_title}
                      onChange={(e) => handleSettingChange('step_title', e.target.value)}
                      placeholder="Digite o título da seção STEP"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="stepDescription">Descrição da Seção STEP</Label>
                    <Textarea
                      id="stepDescription"
                      rows={6}
                      value={localSettings.step_description}
                      onChange={(e) => handleSettingChange('step_description', e.target.value)}
                      placeholder="Digite a descrição da seção STEP"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {/* Categoria Saber */}
                    <Card className="p-4 border-red-200">
                      <h4 className="text-md font-semibold mb-3 text-red-600">S - SABER</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="saberSubtitle">Subtítulo</Label>
                          <Input
                            id="saberSubtitle"
                            value={localSettings.saber_subtitle}
                            onChange={(e) => handleSettingChange('saber_subtitle', e.target.value)}
                            placeholder="Ex: Não sei o que não sei"
                          />
                        </div>
                        <div>
                          <Label htmlFor="saberDescription">Descrição</Label>
                          <Textarea
                            id="saberDescription"
                            rows={3}
                            value={localSettings.saber_description}
                            onChange={(e) => handleSettingChange('saber_description', e.target.value)}
                            placeholder="Descrição da categoria Saber"
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Categoria Ter */}
                    <Card className="p-4 border-green-200">
                      <h4 className="text-md font-semibold mb-3 text-green-600">T - TER</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="terSubtitle">Subtítulo</Label>
                          <Input
                            id="terSubtitle"
                            value={localSettings.ter_subtitle}
                            onChange={(e) => handleSettingChange('ter_subtitle', e.target.value)}
                            placeholder="Ex: Sei o que preciso, mas não tenho"
                          />
                        </div>
                        <div>
                          <Label htmlFor="terDescription">Descrição</Label>
                          <Textarea
                            id="terDescription"
                            rows={3}
                            value={localSettings.ter_description}
                            onChange={(e) => handleSettingChange('ter_description', e.target.value)}
                            placeholder="Descrição da categoria Ter"
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Categoria Executar */}
                    <Card className="p-4 border-orange-200">
                      <h4 className="text-md font-semibold mb-3 text-orange-600">E - EXECUTAR</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="executarSubtitle">Subtítulo</Label>
                          <Input
                            id="executarSubtitle"
                            value={localSettings.executar_subtitle}
                            onChange={(e) => handleSettingChange('executar_subtitle', e.target.value)}
                            placeholder="Ex: Tenho tudo, mas preciso fazer funcionar"
                          />
                        </div>
                        <div>
                          <Label htmlFor="executarDescription">Descrição</Label>
                          <Textarea
                            id="executarDescription"
                            rows={3}
                            value={localSettings.executar_description}
                            onChange={(e) => handleSettingChange('executar_description', e.target.value)}
                            placeholder="Descrição da categoria Executar"
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Categoria Potencializar */}
                    <Card className="p-4 border-purple-200">
                      <h4 className="text-md font-semibold mb-3 text-purple-600">P - POTENCIALIZAR</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="potencializarSubtitle">Subtítulo</Label>
                          <Input
                            id="potencializarSubtitle"
                            value={localSettings.potencializar_subtitle}
                            onChange={(e) => handleSettingChange('potencializar_subtitle', e.target.value)}
                            placeholder="Ex: Domino tudo, quero resultados extraordinários"
                          />
                        </div>
                        <div>
                          <Label htmlFor="potencializarDescription">Descrição</Label>
                          <Textarea
                            id="potencializarDescription"
                            rows={3}
                            value={localSettings.potencializar_description}
                            onChange={(e) => handleSettingChange('potencializar_description', e.target.value)}
                            placeholder="Descrição da categoria Potencializar"
                          />
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleSaveSettings}
                      disabled={!settingsChanged || savingSettings}
                      className="gap-2"
                    >
                      {savingSettings ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                    
                    {settingsChanged && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setLocalSettings({
                            step_title: settings.step_title,
                            step_description: settings.step_description,
                            saber_subtitle: settings.saber_subtitle,
                            saber_description: settings.saber_description,
                            ter_subtitle: settings.ter_subtitle,
                            ter_description: settings.ter_description,
                            executar_subtitle: settings.executar_subtitle,
                            executar_description: settings.executar_description,
                            potencializar_subtitle: settings.potencializar_subtitle,
                            potencializar_description: settings.potencializar_description
                          });
                          setSettingsChanged(false);
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                  
                  {settingsChanged && (
                    <p className="text-sm text-amber-600">
                      ⚠️ Você tem alterações não salvas
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;