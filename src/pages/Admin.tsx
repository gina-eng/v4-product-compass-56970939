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
import ComoEntregoTable from "@/components/ComoEntregoTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Header from "@/components/Header";
import { Link } from "react-router-dom";

interface SpicedData {
  situation: { objetivo: string; perguntas: string; observar: string };
  pain: { objetivo: string; perguntas: string; observar: string };
  impact: { objetivo: string; perguntas: string; observar: string };
  criticalEvent: { objetivo: string; perguntas: string; observar: string };
  decision: { objetivo: string; perguntas: string; observar: string };
}

interface ComoEntregoItem {
  etapa: string;
  tarefa: string;
  dri: string;
  estimativaHoras: string;
  comoExecutar: string;
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
  comoVendo: string;
  spicedData: SpicedData;
  comoEntregoDados: ComoEntregoItem[];
  oQueEntrego: string;
  paraQuemServe?: string;
  comoEntregaValor?: string;
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
    comoVendo: "",
    spicedData: {
      situation: { objetivo: "", perguntas: "", observar: "" },
      pain: { objetivo: "", perguntas: "", observar: "" },
      impact: { objetivo: "", perguntas: "", observar: "" },
      criticalEvent: { objetivo: "", perguntas: "", observar: "" },
      decision: { objetivo: "", perguntas: "", observar: "" }
    } as SpicedData,
    comoEntregoDados: [] as ComoEntregoItem[],
    oQueEntrego: "",
    paraQuemServe: "",
    comoEntregaValor: "",
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

  // Verificar mudanças sempre que localSettings mudar
  useEffect(() => {
    checkForChanges();
  }, [localSettings, settings]);

  const handleSettingChange = (key: string, value: string) => {
    const newLocalSettings = { ...localSettings, [key]: value };
    setLocalSettings(newLocalSettings);
    
    // Detectar mudanças usando setTimeout para garantir que o estado seja atualizado
    setTimeout(() => {
      checkForChanges(newLocalSettings);
    }, 0);
  };

  const checkForChanges = (currentLocalSettings = localSettings) => {
    const hasChanges = Object.keys(currentLocalSettings).some(key => {
      const localValue = currentLocalSettings[key as keyof typeof currentLocalSettings];
      const globalValue = settings[key as keyof typeof settings] || '';
      const isDifferent = localValue !== globalValue;
      
      if (isDifferent) {
        console.log(`Mudança detectada em ${key}:`, { localValue, globalValue });
      }
      
      return isDifferent;
    });
    
    console.log('Status das mudanças:', { hasChanges, currentLocalSettings, settings });
    setSettingsChanged(hasChanges);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    console.log('Iniciando salvamento das configurações...', { localSettings, settings, isTableAvailable });
    
    try {
      const fieldsToSave = Object.keys(localSettings).filter(key => {
        const localValue = localSettings[key as keyof typeof localSettings];
        const globalValue = settings[key as keyof typeof settings] || '';
        return localValue !== globalValue;
      });

      console.log('Campos que serão salvos:', fieldsToSave);

      if (fieldsToSave.length === 0) {
        toast({
          title: "Nenhuma alteração",
          description: "Não há alterações para salvar.",
        });
        setSavingSettings(false);
        return;
      }

      // Salvar cada campo modificado
      const savePromises = fieldsToSave.map(async (key) => {
        const value = localSettings[key as keyof typeof localSettings];
        console.log(`Salvando ${key}: "${value}"`);
        
        const result = await updateSetting(key, value);
        console.log(`Resultado ${key}:`, result);
        return result;
      });

      const results = await Promise.all(savePromises);
      const allSuccessful = results.every(result => result === true);

      if (allSuccessful) {
        toast({
          title: "Configurações salvas",
          description: "As configurações do site foram atualizadas com sucesso.",
        });
        setSettingsChanged(false);
      } else {
        throw new Error('Nem todas as configurações foram salvas com sucesso');
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
        comoVendo: product.como_vendo,
        spicedData: (product.spiced_data as unknown as SpicedData) || {
          situation: { objetivo: "", perguntas: "", observar: "" },
          pain: { objetivo: "", perguntas: "", observar: "" },
          impact: { objetivo: "", perguntas: "", observar: "" },
          criticalEvent: { objetivo: "", perguntas: "", observar: "" },
          decision: { objetivo: "", perguntas: "", observar: "" }
        },
        comoEntregoDados: (product.como_entrego_dados as unknown as ComoEntregoItem[]) || [],
        oQueEntrego: product.o_que_entrego,
        paraQuemServe: product.para_quem_serve,
        comoEntregaValor: product.como_entrega_valor,
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
            pitch_url: formData.pitchUrl || null,
            bpmn_url: formData.bpmnUrl || null,
            playbook_url: formData.playbookUrl || null,
            icp_url: formData.icpUrl || null,
            pricing_url: formData.pricingUrl || null,
            certificacao_url: formData.certificacaoUrl || null,
            status: formData.status as any,
            description: formData.description,
            como_vendo: formData.comoVendo,
            spiced_data: formData.spicedData as any,
            como_entrego_dados: formData.comoEntregoDados as any,
            o_que_entrego: formData.oQueEntrego,
            para_quem_serve: formData.paraQuemServe || null,
            como_entrega_valor: formData.comoEntregaValor || null,
            bonus_kpi: formData.bonusKpi || null,
            kpi_principal: (formData.kpiPrincipal && formData.kpiPrincipal.trim() !== "") ? formData.kpiPrincipal as any : null,
            tempo_meta_kpi: (formData.tempoMetaKpi && formData.tempoMetaKpi.trim() !== "") ? formData.tempoMetaKpi as any : null,
            garantia_especifica: formData.garantiaEspecifica || null,
            stack_digital: formData.stackDigital || null,
            entregaveis_relacionados: formData.entregaveisRelacionados || null,
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
            pitch_url: formData.pitchUrl || null,
            bpmn_url: formData.bpmnUrl || null,
            playbook_url: formData.playbookUrl || null,
            icp_url: formData.icpUrl || null,
            pricing_url: formData.pricingUrl || null,
            certificacao_url: formData.certificacaoUrl || null,
            status: formData.status as any,
            description: formData.description,
            como_vendo: formData.comoVendo,
            spiced_data: (formData.spicedData || {
              situation: { objetivo: "", perguntas: "", observar: "" },
              pain: { objetivo: "", perguntas: "", observar: "" },
              impact: { objetivo: "", perguntas: "", observar: "" },
              criticalEvent: { objetivo: "", perguntas: "", observar: "" },
              decision: { objetivo: "", perguntas: "", observar: "" }
            }) as any,
            como_entrego_dados: (formData.comoEntregoDados || []) as any,
            o_que_entrego: formData.oQueEntrego,
            para_quem_serve: formData.paraQuemServe || null,
            como_entrega_valor: formData.comoEntregaValor || null,
            bonus_kpi: formData.bonusKpi || null,
            kpi_principal: (formData.kpiPrincipal && formData.kpiPrincipal.trim() !== "") ? formData.kpiPrincipal as any : null,
            tempo_meta_kpi: (formData.tempoMetaKpi && formData.tempoMetaKpi.trim() !== "") ? formData.tempoMetaKpi as any : null,
            garantia_especifica: formData.garantiaEspecifica || null,
            stack_digital: formData.stackDigital || null,
            entregaveis_relacionados: formData.entregaveisRelacionados || null,
          });

        if (error) throw error;

        toast({
          title: "Produto criado",
          description: "O produto foi criado com sucesso.",
        });
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData({ 
        categoria: "saber", 
        status: "Em produção",
        produto: "",
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
        description: "",
        comoVendo: "",
        spicedData: {
          situation: { objetivo: "", perguntas: "", observar: "" },
          pain: { objetivo: "", perguntas: "", observar: "" },
          impact: { objetivo: "", perguntas: "", observar: "" },
          criticalEvent: { objetivo: "", perguntas: "", observar: "" },
          decision: { objetivo: "", perguntas: "", observar: "" }
        },
        comoEntregoDados: [],
        oQueEntrego: "",
        paraQuemServe: "",
        comoEntregaValor: "",
        bonusKpi: "",
        kpiPrincipal: "",
        tempoMetaKpi: "",
        garantiaEspecifica: "",
        stackDigital: "",
        entregaveisRelacionados: ""
      });
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
      comoVendo: product.comoVendo,
      spicedData: product.spicedData,
      comoEntregoDados: product.comoEntregoDados,
      oQueEntrego: product.oQueEntrego,
      paraQuemServe: product.paraQuemServe || "",
      comoEntregaValor: product.comoEntregaValor || "",
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
    setFormData({ 
      categoria: "saber", 
      status: "Em produção",
      produto: "",
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
      description: "",
      comoVendo: "",
      spicedData: {
        situation: { objetivo: "", perguntas: "", observar: "" },
        pain: { objetivo: "", perguntas: "", observar: "" },
        impact: { objetivo: "", perguntas: "", observar: "" },
        criticalEvent: { objetivo: "", perguntas: "", observar: "" },
        decision: { objetivo: "", perguntas: "", observar: "" }
      },
      comoEntregoDados: [],
      oQueEntrego: "",
      paraQuemServe: "",
      comoEntregaValor: "",
      bonusKpi: "",
      kpiPrincipal: "",
      tempoMetaKpi: "",
      garantiaEspecifica: "",
      stackDigital: "",
      entregaveisRelacionados: ""
    });
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

  useEffect(() => {
    let filtered = [...products];

    if (categoryFilter !== "Todas") {
      filtered = filtered.filter(product => product.categoria === categoryFilter);
    }

    if (statusFilter !== "Todos") {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
  }, [products, categoryFilter, statusFilter]);

  const StatusIcon = ({ value }: { value: boolean }) => (
    <div className="w-4 h-4 flex items-center justify-center">
      {value ? (
        <Check className="w-3 h-3 text-green-600" />
      ) : (
        <X className="w-3 h-3 text-red-600" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Administração</h1>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="settings">Informações Gerais</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-6">Informações Gerais do Site</h1>
              
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Categoria SABER */}
                      <div className="space-y-4 p-4 border rounded-lg">
                        <h4 className="font-semibold text-saber">SABER</h4>
                        <div>
                          <Label htmlFor="saberSubtitle">Subtítulo</Label>
                          <Input
                            id="saberSubtitle"
                            value={localSettings.saber_subtitle}
                            onChange={(e) => handleSettingChange('saber_subtitle', e.target.value)}
                            placeholder="Subtítulo da categoria SABER"
                          />
                        </div>
                        <div>
                          <Label htmlFor="saberDescription">Descrição</Label>
                          <Textarea
                            id="saberDescription"
                            rows={3}
                            value={localSettings.saber_description}
                            onChange={(e) => handleSettingChange('saber_description', e.target.value)}
                            placeholder="Descrição da categoria SABER"
                          />
                        </div>
                      </div>

                      {/* Categoria TER */}
                      <div className="space-y-4 p-4 border rounded-lg">
                        <h4 className="font-semibold text-ter">TER</h4>
                        <div>
                          <Label htmlFor="terSubtitle">Subtítulo</Label>
                          <Input
                            id="terSubtitle"
                            value={localSettings.ter_subtitle}
                            onChange={(e) => handleSettingChange('ter_subtitle', e.target.value)}
                            placeholder="Subtítulo da categoria TER"
                          />
                        </div>
                        <div>
                          <Label htmlFor="terDescription">Descrição</Label>
                          <Textarea
                            id="terDescription"
                            rows={3}
                            value={localSettings.ter_description}
                            onChange={(e) => handleSettingChange('ter_description', e.target.value)}
                            placeholder="Descrição da categoria TER"
                          />
                        </div>
                      </div>

                      {/* Categoria EXECUTAR */}
                      <div className="space-y-4 p-4 border rounded-lg">
                        <h4 className="font-semibold text-executar">EXECUTAR</h4>
                        <div>
                          <Label htmlFor="executarSubtitle">Subtítulo</Label>
                          <Input
                            id="executarSubtitle"
                            value={localSettings.executar_subtitle}
                            onChange={(e) => handleSettingChange('executar_subtitle', e.target.value)}
                            placeholder="Subtítulo da categoria EXECUTAR"
                          />
                        </div>
                        <div>
                          <Label htmlFor="executarDescription">Descrição</Label>
                          <Textarea
                            id="executarDescription"
                            rows={3}
                            value={localSettings.executar_description}
                            onChange={(e) => handleSettingChange('executar_description', e.target.value)}
                            placeholder="Descrição da categoria EXECUTAR"
                          />
                        </div>
                      </div>

                      {/* Categoria POTENCIALIZAR */}
                      <div className="space-y-4 p-4 border rounded-lg">
                        <h4 className="font-semibold text-potencializar">POTENCIALIZAR</h4>
                        <div>
                          <Label htmlFor="potencializarSubtitle">Subtítulo</Label>
                          <Input
                            id="potencializarSubtitle"
                            value={localSettings.potencializar_subtitle}
                            onChange={(e) => handleSettingChange('potencializar_subtitle', e.target.value)}
                            placeholder="Subtítulo da categoria POTENCIALIZAR"
                          />
                        </div>
                        <div>
                          <Label htmlFor="potencializarDescription">Descrição</Label>
                          <Textarea
                            id="potencializarDescription"
                            rows={3}
                            value={localSettings.potencializar_description}
                            onChange={(e) => handleSettingChange('potencializar_description', e.target.value)}
                            placeholder="Descrição da categoria POTENCIALIZAR"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <Button
                        onClick={handleSaveSettings}
                        disabled={!settingsChanged || savingSettings}
                        variant={settingsChanged ? "default" : "outline"}
                      >
                        {savingSettings ? "Salvando..." : "Salvar Configurações"}
                      </Button>
                      
                      {settingsChanged && (
                        <p className="text-sm text-amber-600">
                          ⚠️ Você tem alterações não salvas
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Gestão de Produtos</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openNewProductDialog} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Produto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "Editar Produto" : "Novo Produto"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingProduct ? "Edite as informações do produto." : "Adicione um novo produto ao portfólio."}
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="produto">Nome do Produto</Label>
                          <Input
                            id="produto"
                            value={formData.produto}
                            onChange={(e) => setFormData({...formData, produto: e.target.value})}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="categoria">Categoria</Label>
                          <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
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
                          <Label htmlFor="dono">Dono do Produto</Label>
                          <Input
                            id="dono"
                            value={formData.dono}
                            onChange={(e) => setFormData({...formData, dono: e.target.value})}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="duracao">Duração</Label>
                          <Input
                            id="duracao"
                            value={formData.duracao}
                            onChange={(e) => setFormData({...formData, duracao: e.target.value})}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="valor">Valor</Label>
                          <Input
                            id="valor"
                            value={formData.valor}
                            onChange={(e) => setFormData({...formData, valor: e.target.value})}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
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
                          <Label htmlFor="description">Descrição Curta</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows={3}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="paraQuemServe">Pra quem ele serve?</Label>
                          <Textarea
                            id="paraQuemServe"
                            value={formData.paraQuemServe || ""}
                            onChange={(e) => setFormData({...formData, paraQuemServe: e.target.value})}
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="comoEntregaValor">Como ele entrega valor?</Label>
                          <Textarea
                            id="comoEntregaValor"
                            value={formData.comoEntregaValor || ""}
                            onChange={(e) => setFormData({...formData, comoEntregaValor: e.target.value})}
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="oQueEntrego">O que eu entrego?</Label>
                          <Textarea
                            id="oQueEntrego"
                            value={formData.oQueEntrego}
                            onChange={(e) => setFormData({...formData, oQueEntrego: e.target.value})}
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="comoVendo">Como eu vendo?</Label>
                          <Textarea
                            id="comoVendo"
                            value={formData.comoVendo}
                            onChange={(e) => setFormData({...formData, comoVendo: e.target.value})}
                            rows={4}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">SPICED Data</h4>
                        <SpicedTable 
                          data={formData.spicedData}
                          onChange={(data) => setFormData({...formData, spicedData: data})}
                        />
                      </div>

                      <div className="space-y-4">
                        <ComoEntregoTable 
                          data={formData.comoEntregoDados}
                          onChange={(data) => setFormData({...formData, comoEntregoDados: data})}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bonusKpi">Bonus KPI</Label>
                          <Input
                            id="bonusKpi"
                            value={formData.bonusKpi || ""}
                            onChange={(e) => setFormData({...formData, bonusKpi: e.target.value})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="kpiPrincipal">KPI Principal</Label>
                          <Input
                            id="kpiPrincipal"
                            value={formData.kpiPrincipal || ""}
                            onChange={(e) => setFormData({...formData, kpiPrincipal: e.target.value})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tempoMetaKpi">Tempo Meta KPI</Label>
                          <Input
                            id="tempoMetaKpi"
                            value={formData.tempoMetaKpi || ""}
                            onChange={(e) => setFormData({...formData, tempoMetaKpi: e.target.value})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="garantiaEspecifica">Garantia Específica</Label>
                          <Input
                            id="garantiaEspecifica"
                            value={formData.garantiaEspecifica || ""}
                            onChange={(e) => setFormData({...formData, garantiaEspecifica: e.target.value})}
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
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filtros:</span>
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas">Todas as categorias</SelectItem>
                    <SelectItem value="saber">SABER</SelectItem>
                    <SelectItem value="ter">TER</SelectItem>
                    <SelectItem value="executar">EXECUTAR</SelectItem>
                    <SelectItem value="potencializar">POTENCIALIZAR</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos os status</SelectItem>
                    <SelectItem value="Disponível">Disponível</SelectItem>
                    <SelectItem value="Em produção">Em produção</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Outras Configurações</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Outras configurações do sistema serão implementadas aqui no futuro.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
