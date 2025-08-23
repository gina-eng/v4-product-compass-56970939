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
import { Layout } from "@/components/Layout";
import SpicedTable from "@/components/SpicedTable";
import ComoEntregoTable from "@/components/ComoEntregoTable";
import ProductPositions from "@/components/ProductPositions";
import TrainingMaterials from "@/components/TrainingMaterials";
import SalesMaterials from "@/components/SalesMaterials";
import OperationalMaterials from "@/components/OperationalMaterials";
import TrainingMaterialsOnly from "@/components/TrainingMaterialsOnly";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Plus, Edit, Trash2, Upload } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import UseCaseMap from "@/components/UseCaseMap";

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
  description: string;
  descricao_card?: string;
  como_vendo: string;
  duracao: string;
  dono: string;
  valor: string;
  status: string;
  o_que_entrego?: string;
  escopo?: string;
  duracao_media?: string;
  time_envolvido?: string;
  formato_entrega?: string;
  descricao_completa?: string;
  para_quem_serve?: string;
  como_entrega_valor?: string;
  entregaveis_relacionados?: string;
  stack_digital?: string;
  bonus_kpi?: string;
  garantia_especifica?: string;
  kpi_principal?: string;
  tempo_meta_kpi?: string;
  pitch?: boolean;
  bpmn?: boolean;
  playbook?: boolean;
  icp?: boolean;
  pricing?: boolean;
  certificacao?: boolean;
  pitch_url?: string;
  bpmn_url?: string;
  playbook_url?: string;
  icp_url?: string;
  pricing_url?: string;
  certificacao_url?: string;
  case_1_name?: string;
  case_1_unidade_responsavel?: string;
  case_1_responsavel_projeto?: string;
  case_1_documento_url?: string;
  case_2_name?: string;
  case_2_unidade_responsavel?: string;
  case_2_responsavel_projeto?: string;
  case_2_documento_url?: string;
  spiced_data: SpicedData;
  como_entrego_dados: ComoEntregoItem[];
  markup?: number;
  use_case_map_1_name?: string;
  use_case_map_1_data?: any;
  use_case_map_2_name?: string;
  use_case_map_2_data?: any;
}

interface SupportMaterial {
  id: string;
  nome_arquivo: string;
  url_direcionamento: string;
  created_at: string;
}

const Admin = () => {
  const { toast } = useToast();
  const { settings, updateSetting, isTableAvailable } = useSiteSettings();
  
  // Estados para produtos
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Cache para valores calculados por produto
  const [calculatedValues, setCalculatedValues] = useState<{[key: string]: number}>({});
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para posições
  const [positions, setPositions] = useState<Position[]>([]);
  const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  
  // Estados para materiais de suporte
  const [supportMaterials, setSupportMaterials] = useState<SupportMaterial[]>([]);
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false);
  const [editingSupportMaterial, setEditingSupportMaterial] = useState<SupportMaterial | null>(null);
  const [supportForm, setSupportForm] = useState({
    nome_arquivo: '',
    url_direcionamento: ''
  });
  
  // Form states
  const [productForm, setProductForm] = useState({
    produto: '',
    categoria: 'saber',
    description: '',
    descricao_card: '',
    como_vendo: '',
    duracao: '',
    dono: '',
    valor: '',
    status: 'Disponível',
    o_que_entrego: '',
    escopo: '',
    duracao_media: '',
    time_envolvido: '',
    formato_entrega: '',
    descricao_completa: '',
    para_quem_serve: '',
    como_entrega_valor: '',
    entregaveis_relacionados: '',
    stack_digital: '',
    bonus_kpi: '',
    garantia_especifica: '',
    kpi_principal: '',
    tempo_meta_kpi: '',
    pitch: false,
    bpmn: false,
    playbook: false,
    icp: false,
    pricing: false,
    certificacao: false,
    pitch_url: '',
    bpmn_url: '',
    playbook_url: '',
    icp_url: '',
    pricing_url: '',
    certificacao_url: '',
    case_1_name: '',
    case_1_unidade_responsavel: '',
    case_1_responsavel_projeto: '',
    case_1_documento_url: '',
    case_2_name: '',
    case_2_unidade_responsavel: '',
    case_2_responsavel_projeto: '',
    case_2_documento_url: '',
    markup: 1,
    use_case_map_1_name: 'Use Case Map - Cliente sem Investimento',
    use_case_map_2_name: 'Use Case Map - Cliente com Investimento'
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

  const [spicedData2, setSpicedData2] = useState<SpicedData>({
    situation: { objetivo: "", perguntas: "", observar: "" },
    pain: { objetivo: "", perguntas: "", observar: "" },
    impact: { objetivo: "", perguntas: "", observar: "" },
    criticalEvent: { objetivo: "", perguntas: "", observar: "" },
    decision: { objetivo: "", perguntas: "", observar: "" }
  });

  const [comoEntregoDados, setComoEntregoDados] = useState<ComoEntregoItem[]>([]);
  
  // Estados para Use Case Maps
  const [useCaseMap1Data, setUseCaseMap1Data] = useState({
    problema: '', persona: '', alternativa: '', why: '', frequencia: ''
  });
  const [useCaseMap2Data, setUseCaseMap2Data] = useState({
    problema: '', persona: '', alternativa: '', why: '', frequencia: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchPositions();
    fetchSupportMaterials();
  }, []);

  const fetchSupportMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('support_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSupportMaterials(data || []);
    } catch (error) {
      console.error('Erro ao buscar materiais de apoio:', error);
    }
  };

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
        description: product.description,
        descricao_card: product.descricao_card,
        como_vendo: product.como_vendo,
        duracao: product.duracao,
        dono: product.dono,
        valor: product.valor,
        status: product.status,
        o_que_entrego: product.o_que_entrego,
        escopo: product.escopo,
        duracao_media: product.duracao_media,
        time_envolvido: product.time_envolvido,
        formato_entrega: product.formato_entrega,
        descricao_completa: product.descricao_completa,
        para_quem_serve: product.para_quem_serve,
        como_entrega_valor: product.como_entrega_valor,
        entregaveis_relacionados: product.entregaveis_relacionados,
        stack_digital: product.stack_digital,
        bonus_kpi: product.bonus_kpi,
        garantia_especifica: product.garantia_especifica,
        kpi_principal: product.kpi_principal,
        tempo_meta_kpi: product.tempo_meta_kpi,
        pitch: product.pitch,
        bpmn: product.bpmn,
        playbook: product.playbook,
        icp: product.icp,
        pricing: product.pricing,
        certificacao: product.certificacao,
        pitch_url: product.pitch_url,
        bpmn_url: product.bpmn_url,
        playbook_url: product.playbook_url,
        icp_url: product.icp_url,
        pricing_url: product.pricing_url,
        certificacao_url: product.certificacao_url,
        case_1_name: product.case_1_name,
        case_1_unidade_responsavel: product.case_1_unidade_responsavel,
        case_1_responsavel_projeto: product.case_1_responsavel_projeto,
        case_1_documento_url: product.case_1_documento_url,
        case_2_name: product.case_2_name,
        case_2_unidade_responsavel: product.case_2_unidade_responsavel,
        case_2_responsavel_projeto: product.case_2_responsavel_projeto,
        case_2_documento_url: product.case_2_documento_url,
        spiced_data: (product.spiced_data as unknown as SpicedData) || {
          situation: { objetivo: "", perguntas: "", observar: "" },
          pain: { objetivo: "", perguntas: "", observar: "" },
          impact: { objetivo: "", perguntas: "", observar: "" },
          criticalEvent: { objetivo: "", perguntas: "", observar: "" },
          decision: { objetivo: "", perguntas: "", observar: "" }
        },
        como_entrego_dados: (product.como_entrego_dados as unknown as ComoEntregoItem[]) || [],
        markup: product.markup,
        use_case_map_1_name: product.use_case_map_1_name,
        use_case_map_1_data: (product.use_case_map_1_data as any) || {
          problema: '', persona: '', alternativa: '', why: '', frequencia: ''
        },
        use_case_map_2_name: product.use_case_map_2_name,
        use_case_map_2_data: (product.use_case_map_2_data as any) || {
          problema: '', persona: '', alternativa: '', why: '', frequencia: ''
        }
      }));
      
      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);
      
      // Calcular valores automaticamente para todos os produtos
      const calculatedVals: {[key: string]: number} = {};
      for (const product of formattedProducts) {
        const calculatedValue = await calculateFaturamentoSemDesconto(product.id, product.markup || 1.0);
        calculatedVals[product.id] = calculatedValue;
      }
      setCalculatedValues(calculatedVals);
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
        description: productForm.description,
        descricao_card: productForm.descricao_card || null,
        como_vendo: productForm.como_vendo,
        duracao: productForm.duracao,
        dono: productForm.dono,
        valor: productForm.valor,
        status: productForm.status as "Disponível" | "Em produção" | "Em homologação",
        o_que_entrego: productForm.o_que_entrego || '',
        escopo: productForm.escopo || null,
        duracao_media: productForm.duracao_media || null,
        time_envolvido: productForm.time_envolvido || null,
        formato_entrega: productForm.formato_entrega || null,
        descricao_completa: productForm.descricao_completa || null,
        para_quem_serve: productForm.para_quem_serve || null,
        como_entrega_valor: productForm.como_entrega_valor || null,
        entregaveis_relacionados: productForm.entregaveis_relacionados || null,
        stack_digital: productForm.stack_digital || null,
        bonus_kpi: productForm.bonus_kpi || null,
        garantia_especifica: productForm.garantia_especifica || null,
        kpi_principal: productForm.kpi_principal || null,
        tempo_meta_kpi: productForm.tempo_meta_kpi || null,
        pitch: productForm.pitch,
        bpmn: productForm.bpmn,
        playbook: productForm.playbook,
        icp: productForm.icp,
        pricing: productForm.pricing,
        certificacao: productForm.certificacao,
        pitch_url: productForm.pitch_url || null,
        bpmn_url: productForm.bpmn_url || null,
        playbook_url: productForm.playbook_url || null,
      icp_url: productForm.icp_url || null,
        pricing_url: productForm.pricing_url || null,
        certificacao_url: productForm.certificacao_url || null,
        case_1_name: productForm.case_1_name || null,
        case_1_unidade_responsavel: productForm.case_1_unidade_responsavel || null,
        case_1_responsavel_projeto: productForm.case_1_responsavel_projeto || null,
        case_1_documento_url: productForm.case_1_documento_url || null,
        case_2_name: productForm.case_2_name || null,
        case_2_unidade_responsavel: productForm.case_2_unidade_responsavel || null,
        case_2_responsavel_projeto: productForm.case_2_responsavel_projeto || null,
        case_2_documento_url: productForm.case_2_documento_url || null,
        spiced_data: spicedData,
        spiced_data_2: spicedData2,
        como_entrego_dados: comoEntregoDados,
        markup: productForm.markup,
        use_case_map_1_name: productForm.use_case_map_1_name,
        use_case_map_1_data: useCaseMap1Data,
        use_case_map_2_name: productForm.use_case_map_2_name,
        use_case_map_2_data: useCaseMap2Data
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

  const handleEditProduct = async (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      produto: product.produto,
      categoria: product.categoria,
      description: product.description,
      descricao_card: product.descricao_card || '',
      como_vendo: product.como_vendo,
      duracao: product.duracao,
      dono: product.dono,
      valor: product.valor,
      status: product.status,
      o_que_entrego: (product as any).o_que_entrego || '',
      escopo: product.escopo || '',
      duracao_media: product.duracao_media || '',
      time_envolvido: product.time_envolvido || '',
      formato_entrega: product.formato_entrega || '',
      descricao_completa: product.descricao_completa || '',
      para_quem_serve: (product as any).para_quem_serve || '',
      como_entrega_valor: (product as any).como_entrega_valor || '',
      entregaveis_relacionados: (product as any).entregaveis_relacionados || '',
      stack_digital: (product as any).stack_digital || '',
      bonus_kpi: (product as any).bonus_kpi || '',
      garantia_especifica: (product as any).garantia_especifica || '',
      kpi_principal: (product as any).kpi_principal || '',
      tempo_meta_kpi: (product as any).tempo_meta_kpi || '',
      pitch: (product as any).pitch || false,
      bpmn: (product as any).bpmn || false,
      playbook: (product as any).playbook || false,
      icp: (product as any).icp || false,
      pricing: (product as any).pricing || false,
      certificacao: (product as any).certificacao || false,
      pitch_url: (product as any).pitch_url || '',
      bpmn_url: (product as any).bpmn_url || '',
      playbook_url: (product as any).playbook_url || '',
      icp_url: (product as any).icp_url || '',
      pricing_url: (product as any).pricing_url || '',
      certificacao_url: (product as any).certificacao_url || '',
      case_1_name: (product as any).case_1_name || '',
      case_1_unidade_responsavel: (product as any).case_1_unidade_responsavel || '',
      case_1_responsavel_projeto: (product as any).case_1_responsavel_projeto || '',
      case_1_documento_url: (product as any).case_1_documento_url || '',
      case_2_name: (product as any).case_2_name || '',
      case_2_unidade_responsavel: (product as any).case_2_unidade_responsavel || '',
      case_2_responsavel_projeto: (product as any).case_2_responsavel_projeto || '',
      case_2_documento_url: (product as any).case_2_documento_url || '',
      markup: product.markup || 1,
      use_case_map_1_name: product.use_case_map_1_name || 'Use Case Map - Cliente sem Investimento',
      use_case_map_2_name: product.use_case_map_2_name || 'Use Case Map - Cliente com Investimento'
    });
    setSpicedData(product.spiced_data || {
      situation: { objetivo: "", perguntas: "", observar: "" },
      pain: { objetivo: "", perguntas: "", observar: "" },
      impact: { objetivo: "", perguntas: "", observar: "" },
      criticalEvent: { objetivo: "", perguntas: "", observar: "" },
      decision: { objetivo: "", perguntas: "", observar: "" }
    });
    setSpicedData2((product as any).spiced_data_2 || {
      situation: { objetivo: "", perguntas: "", observar: "" },
      pain: { objetivo: "", perguntas: "", observar: "" },
      impact: { objetivo: "", perguntas: "", observar: "" },
      criticalEvent: { objetivo: "", perguntas: "", observar: "" },
      decision: { objetivo: "", perguntas: "", observar: "" }
    });
    setComoEntregoDados(product.como_entrego_dados || []);
    setUseCaseMap1Data(product.use_case_map_1_data || {
      problema: '', persona: '', alternativa: '', why: '', frequencia: ''
    });
    setUseCaseMap2Data(product.use_case_map_2_data || {
      problema: '', persona: '', alternativa: '', why: '', frequencia: ''
    });
    
    // Calcular time envolvido e valor automaticamente
    const timeEnvolvido = await calculateTimeEnvolvido(product.id);
    const faturamentoSemDesconto = await calculateFaturamentoSemDesconto(product.id);
    setProductForm(prev => ({
      ...prev, 
      time_envolvido: timeEnvolvido,
      valor: faturamentoSemDesconto.toFixed(2)
    }));
    
    setIsProductDialogOpen(true);
  };

  // Função para calcular time envolvido automaticamente
  const calculateTimeEnvolvido = async (productId: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('product_positions')
        .select(`
          *,
          positions (nome)
        `)
        .eq('product_id', productId);
      
      if (error) throw error;
      
      const roleNames = data?.map(allocation => allocation.positions?.nome || '').filter(name => name).join(', ') || '';
      return roleNames;
    } catch (error) {
      console.error('Erro ao calcular time envolvido:', error);
      return '';
    }
  };

  // Função para calcular faturamento sem desconto
  const calculateFaturamentoSemDesconto = async (productId: string, productMarkup?: number): Promise<number> => {
    try {
      const { data: positions, error: positionsError } = await supabase
        .from('product_positions')
        .select(`
          *,
          positions (cph)
        `)
        .eq('product_id', productId);
      
      if (positionsError) throw positionsError;
      
      // Buscar markup do produto se não foi fornecido
      let markup = productMarkup;
      if (!markup) {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('markup')
          .eq('id', productId)
          .single();
        
        if (productError) throw productError;
        markup = product?.markup || 1;
      }
      
      const totalCSP = positions?.reduce((total, pp) => {
        return total + (pp.horas_alocadas * (pp.positions?.cph || 0));
      }, 0) || 0;
      
      return totalCSP * markup;
    } catch (error) {
      console.error('Erro ao calcular faturamento sem desconto:', error);
      return 0;
    }
  };

  // Função para atualizar o time envolvido e valor quando as posições mudarem
  const handlePositionsChange = async (productId: string) => {
    if (editingProduct) {
      const timeEnvolvido = await calculateTimeEnvolvido(productId);
      const faturamentoSemDesconto = await calculateFaturamentoSemDesconto(productId);
      setProductForm({
        ...productForm, 
        time_envolvido: timeEnvolvido,
        valor: faturamentoSemDesconto.toFixed(2)
      });
      
      // Também atualizar no banco de dados
      await supabase
        .from('products')
        .update({ 
          time_envolvido: timeEnvolvido,
          valor: faturamentoSemDesconto.toFixed(2)
        })
        .eq('id', productId);
        
      // Atualizar cache para os cards
      setCalculatedValues(prev => ({
        ...prev,
        [productId]: faturamentoSemDesconto
      }));
      
      // Recarregar produtos para atualizar a lista
      fetchProducts();
    }
  };

  // Filtrar produtos
  useEffect(() => {
    let filtered = products;
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.categoria === categoryFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => product.status === statusFilter);
    }
    
    setFilteredProducts(filtered);
  }, [products, categoryFilter, statusFilter]);

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({
      produto: '',
      categoria: 'saber',
      description: '',
      descricao_card: '',
      como_vendo: '',
      duracao: '',
      dono: '',
      valor: '',
      status: 'Disponível',
      o_que_entrego: '',
      escopo: '',
      duracao_media: '',
      time_envolvido: '',
      formato_entrega: '',
      descricao_completa: '',
      para_quem_serve: '',
      como_entrega_valor: '',
      entregaveis_relacionados: '',
      stack_digital: '',
      bonus_kpi: '',
      garantia_especifica: '',
      kpi_principal: '',
      tempo_meta_kpi: '',
      pitch: false,
      bpmn: false,
      playbook: false,
      icp: false,
      pricing: false,
      certificacao: false,
      pitch_url: '',
      bpmn_url: '',
      playbook_url: '',
      icp_url: '',
      pricing_url: '',
      certificacao_url: '',
      case_1_name: '',
      case_1_unidade_responsavel: '',
      case_1_responsavel_projeto: '',
      case_1_documento_url: '',
      case_2_name: '',
      case_2_unidade_responsavel: '',
      case_2_responsavel_projeto: '',
      case_2_documento_url: '',
      markup: 1,
      use_case_map_1_name: 'Use Case Map - Cliente sem Investimento',
      use_case_map_2_name: 'Use Case Map - Cliente com Investimento'
    });
    setSpicedData({
      situation: { objetivo: "", perguntas: "", observar: "" },
      pain: { objetivo: "", perguntas: "", observar: "" },
      impact: { objetivo: "", perguntas: "", observar: "" },
      criticalEvent: { objetivo: "", perguntas: "", observar: "" },
      decision: { objetivo: "", perguntas: "", observar: "" }
    });
    setSpicedData2({
      situation: { objetivo: "", perguntas: "", observar: "" },
      pain: { objetivo: "", perguntas: "", observar: "" },
      impact: { objetivo: "", perguntas: "", observar: "" },
      criticalEvent: { objetivo: "", perguntas: "", observar: "" },
      decision: { objetivo: "", perguntas: "", observar: "" }
    });
    setComoEntregoDados([]);
    setUseCaseMap1Data({
      problema: '', persona: '', alternativa: '', why: '', frequencia: ''
    });
    setUseCaseMap2Data({
      problema: '', persona: '', alternativa: '', why: '', frequencia: ''
    });
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
      <Layout showHeader={true}>
        <div className="text-center animate-fade-in">Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={true}>
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Administração</h1>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="positions">Posições</TabsTrigger>
            <TabsTrigger value="support">Materiais de Apoio</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
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
                        <TabsList className="grid w-full grid-cols-5">
                          <TabsTrigger value="basico">Informações Básicas</TabsTrigger>
                          <TabsTrigger value="vendas">Vendas e Entrega</TabsTrigger>
                          <TabsTrigger value="use-cases">Use Case Maps</TabsTrigger>
                          <TabsTrigger value="materiais">Materiais de Treinamento</TabsTrigger>
                          <TabsTrigger value="posicoes">Posições e DRE</TabsTrigger>
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
                              <Label htmlFor="valor">Valor (Automático)</Label>
                              <Input
                                id="valor"
                                value={productForm.valor ? formatCurrency(productForm.valor) : ''}
                                readOnly
                                className="bg-muted"
                                placeholder="Será calculado automaticamente baseado no DRE"
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
                            <div>
                              <Label htmlFor="duracao">Duração</Label>
                              <Input
                                id="duracao"
                                value={productForm.duracao}
                                onChange={(e) => setProductForm({...productForm, duracao: e.target.value})}
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
                          </div>
                          
                          <div>
                            <Label htmlFor="descricao_card">Descrição do Card</Label>
                            <Textarea
                              id="descricao_card"
                              value={productForm.descricao_card}
                              onChange={(e) => setProductForm({...productForm, descricao_card: e.target.value})}
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
                          
                          <div>
                            <Label htmlFor="time_envolvido">Time Envolvido (Automático)</Label>
                            <Input
                              id="time_envolvido"
                              value={productForm.time_envolvido}
                              readOnly
                              className="bg-muted"
                              placeholder="Será preenchido automaticamente com base nas posições alocadas"
                            />
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
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="para_quem_serve">Para quem serve</Label>
                              <Textarea
                                id="para_quem_serve"
                                value={productForm.para_quem_serve}
                                onChange={(e) => setProductForm({...productForm, para_quem_serve: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="como_entrega_valor">Como entregar valor</Label>
                              <Textarea
                                id="como_entrega_valor"
                                value={productForm.como_entrega_valor}
                                onChange={(e) => setProductForm({...productForm, como_entrega_valor: e.target.value})}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="description">ICP (Ideal Customer Profile)</Label>
                            <Textarea
                              id="description"
                              value={productForm.description}
                              onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                              rows={5}
                              placeholder="Descreva o perfil do cliente ideal para este produto..."
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="entregaveis_relacionados">Entregáveis relacionados</Label>
                            <Textarea
                              id="entregaveis_relacionados"
                              value={productForm.entregaveis_relacionados}
                              onChange={(e) => setProductForm({...productForm, entregaveis_relacionados: e.target.value})}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="stack_digital">Stack digital</Label>
                            <Textarea
                              id="stack_digital"
                              value={productForm.stack_digital}
                              onChange={(e) => setProductForm({...productForm, stack_digital: e.target.value})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="bonus_kpi">Bônus KPI</Label>
                              <Input
                                id="bonus_kpi"
                                value={productForm.bonus_kpi}
                                onChange={(e) => setProductForm({...productForm, bonus_kpi: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="garantia_especifica">Garantia específica</Label>
                              <Input
                                id="garantia_especifica"
                                value={productForm.garantia_especifica}
                                onChange={(e) => setProductForm({...productForm, garantia_especifica: e.target.value})}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="kpi_principal">KPI Principal</Label>
                              <Input
                                id="kpi_principal"
                                value={productForm.kpi_principal}
                                onChange={(e) => setProductForm({...productForm, kpi_principal: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="tempo_meta_kpi">Tempo meta KPI</Label>
                              <Input
                                id="tempo_meta_kpi"
                                value={productForm.tempo_meta_kpi}
                                onChange={(e) => setProductForm({...productForm, tempo_meta_kpi: e.target.value})}
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="vendas" className="space-y-4">
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
                            <Label htmlFor="description">Como eu entrego?</Label>
                            <Textarea
                              id="description"
                              value={productForm.description}
                              onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                              rows={3}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="o_que_entrego">O que entrego</Label>
                            <Textarea
                              id="o_que_entrego"
                              value={productForm.o_que_entrego}
                              onChange={(e) => setProductForm({...productForm, o_que_entrego: e.target.value})}
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

                        <TabsContent value="use-cases" className="space-y-4">
                          <div className="space-y-8">
                            {/* Use Case Map 1 e SPICED 1 Unificados */}
                            <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                              <h3 className="font-semibold text-lg">Use Case Map 1 e SPICED</h3>
                              
                              <div>
                                <Label htmlFor="use_case_map_1_name">Nome do Primeiro Use Case Map</Label>
                                <Input
                                  id="use_case_map_1_name"
                                  value={productForm.use_case_map_1_name}
                                  onChange={(e) => setProductForm({...productForm, use_case_map_1_name: e.target.value})}
                                  placeholder="Ex: Use Case Map - Cliente sem Investimento"
                                />
                              </div>
                              
                              <UseCaseMap
                                title={productForm.use_case_map_1_name}
                                data={useCaseMap1Data}
                                onChange={setUseCaseMap1Data}
                                readOnly={false}
                              />
                              
                              <div>
                                <Label>Metodologia SPICED para {productForm.use_case_map_1_name}</Label>
                                <SpicedTable 
                                  data={spicedData} 
                                  onChange={setSpicedData}
                                />
                              </div>
                            </div>

                            {/* Use Case Map 2 e SPICED 2 Unificados */}
                            <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                              <h3 className="font-semibold text-lg">Use Case Map 2 e SPICED</h3>
                              
                              <div>
                                <Label htmlFor="use_case_map_2_name">Nome do Segundo Use Case Map</Label>
                                <Input
                                  id="use_case_map_2_name"
                                  value={productForm.use_case_map_2_name}
                                  onChange={(e) => setProductForm({...productForm, use_case_map_2_name: e.target.value})}
                                  placeholder="Ex: Use Case Map - Cliente com Investimento"
                                />
                              </div>
                              
                              <UseCaseMap
                                title={productForm.use_case_map_2_name}
                                data={useCaseMap2Data}
                                onChange={setUseCaseMap2Data}
                                readOnly={false}
                              />
                              
                              <div>
                                <Label>Metodologia SPICED para {productForm.use_case_map_2_name}</Label>
                                <SpicedTable 
                                  data={spicedData2} 
                                  onChange={setSpicedData2}
                                />
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="materiais" className="space-y-4">
                          {editingProduct && (
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-semibold mb-4">Materiais de Vendas</h4>
                                <SalesMaterials productId={editingProduct.id} readOnly={false} />
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-4">Materiais Operacionais</h4>
                                <OperationalMaterials 
                                  productId={editingProduct.id} 
                                  readOnly={false} 
                                  showDeliveryInfo={false}
                                />
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-4">Materiais de Treinamento</h4>
                                <TrainingMaterialsOnly productId={editingProduct.id} readOnly={false} />
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-4">
                            <h4 className="font-semibold">URLs de Documentos (Legado)</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="pitch_url">Pitch URL</Label>
                                <Input
                                  id="pitch_url"
                                  value={productForm.pitch_url}
                                  onChange={(e) => setProductForm({...productForm, pitch_url: e.target.value})}
                                  placeholder="Link teste"
                                />
                              </div>
                              <div>
                                <Label htmlFor="bpmn_url">BPMN URL</Label>
                                <Input
                                  id="bpmn_url"
                                  value={productForm.bpmn_url}
                                  onChange={(e) => setProductForm({...productForm, bpmn_url: e.target.value})}
                                  placeholder="Link teste"
                                />
                              </div>
                              <div>
                                <Label htmlFor="playbook_url">Playbook URL</Label>
                                <Input
                                  id="playbook_url"
                                  value={productForm.playbook_url}
                                  onChange={(e) => setProductForm({...productForm, playbook_url: e.target.value})}
                                  placeholder="Link teste"
                                />
                              </div>
                              <div>
                                <Label htmlFor="pricing_url">Pricing URL</Label>
                                <Input
                                  id="pricing_url"
                                  value={productForm.pricing_url}
                                  onChange={(e) => setProductForm({...productForm, pricing_url: e.target.value})}
                                  placeholder="Link teste"
                                />
                              </div>
                              <div>
                                <Label htmlFor="certificacao_url">Certificação URL</Label>
                                <Input
                                  id="certificacao_url"
                                  value={productForm.certificacao_url}
                                  onChange={(e) => setProductForm({...productForm, certificacao_url: e.target.value})}
                                  placeholder="Link teste"
                                />
                              </div>
                              <div>
                                <Label htmlFor="icp_url">ICP URL</Label>
                                <Input
                                  id="icp_url"
                                  value={productForm.icp_url}
                                  onChange={(e) => setProductForm({...productForm, icp_url: e.target.value})}
                                  placeholder="URL do documento ICP"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 mt-6">
                            <h4 className="font-semibold">Case 1</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="case_1_name">Nome do Case 1</Label>
                                <Input
                                  id="case_1_name"
                                  value={productForm.case_1_name}
                                  onChange={(e) => setProductForm({...productForm, case_1_name: e.target.value})}
                                  placeholder="Case XPTO"
                                />
                              </div>
                              <div>
                                <Label htmlFor="case_1_unidade_responsavel">Unidade Responsável</Label>
                                <Input
                                  id="case_1_unidade_responsavel"
                                  value={productForm.case_1_unidade_responsavel}
                                  onChange={(e) => setProductForm({...productForm, case_1_unidade_responsavel: e.target.value})}
                                  placeholder="Colli & Co"
                                />
                              </div>
                              <div>
                                <Label htmlFor="case_1_responsavel_projeto">Responsável Projeto</Label>
                                <Input
                                  id="case_1_responsavel_projeto"
                                  value={productForm.case_1_responsavel_projeto}
                                  onChange={(e) => setProductForm({...productForm, case_1_responsavel_projeto: e.target.value})}
                                  placeholder="Rafael Corazza"
                                />
                              </div>
                              <div>
                                <Label htmlFor="case_1_documento_url">URL do Documento</Label>
                                <Input
                                  id="case_1_documento_url"
                                  value={productForm.case_1_documento_url}
                                  onChange={(e) => setProductForm({...productForm, case_1_documento_url: e.target.value})}
                                  placeholder="Link teste"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 mt-6">
                            <h4 className="font-semibold">Case 2</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="case_2_name">Nome do Case 2</Label>
                                <Input
                                  id="case_2_name"
                                  value={productForm.case_2_name}
                                  onChange={(e) => setProductForm({...productForm, case_2_name: e.target.value})}
                                  placeholder="Case XPTO 2"
                                />
                              </div>
                              <div>
                                <Label htmlFor="case_2_unidade_responsavel">Unidade Responsável</Label>
                                <Input
                                  id="case_2_unidade_responsavel"
                                  value={productForm.case_2_unidade_responsavel}
                                  onChange={(e) => setProductForm({...productForm, case_2_unidade_responsavel: e.target.value})}
                                  placeholder="Colli & Co"
                                />
                              </div>
                              <div>
                                <Label htmlFor="case_2_responsavel_projeto">Responsável Projeto</Label>
                                <Input
                                  id="case_2_responsavel_projeto"
                                  value={productForm.case_2_responsavel_projeto}
                                  onChange={(e) => setProductForm({...productForm, case_2_responsavel_projeto: e.target.value})}
                                  placeholder="Rafael Corazza"
                                />
                              </div>
                              <div>
                                <Label htmlFor="case_2_documento_url">URL do Documento</Label>
                                <Input
                                  id="case_2_documento_url"
                                  value={productForm.case_2_documento_url}
                                  onChange={(e) => setProductForm({...productForm, case_2_documento_url: e.target.value})}
                                  placeholder="Link teste"
                                />
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="posicoes" className="space-y-4">
                          {editingProduct ? (
                            <ProductPositions 
                              productId={editingProduct.id} 
                              readOnly={false}
                              initialMarkup={productForm.markup}
                              onMarkupChange={(markup) => setProductForm({...productForm, markup})}
                              onPositionsChange={() => handlePositionsChange(editingProduct.id)}
                            />
                          ) : (
                            <div className="text-center p-8 text-muted-foreground">
                              <p>As posições só podem ser configuradas após o produto ser criado.</p>
                              <p>Salve o produto primeiro e depois edite-o para adicionar posições.</p>
                            </div>
                          )}
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
                <div className="flex gap-4 mb-6">
                  <div>
                    <Label htmlFor="categoryFilter">Filtrar por Categoria</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="saber">SABER</SelectItem>
                        <SelectItem value="ter">TER</SelectItem>
                        <SelectItem value="executar">EXECUTAR</SelectItem>
                        <SelectItem value="potencializar">POTENCIALIZAR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="statusFilter">Filtrar por Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="Disponível">Disponível</SelectItem>
                        <SelectItem value="Em produção">Em produção</SelectItem>
                        <SelectItem value="Em homologação">Em homologação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="relative hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <CardTitle className="text-lg leading-tight pr-2">{product.produto}</CardTitle>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant={
                                product.categoria === 'saber' ? 'default' :
                                product.categoria === 'ter' ? 'secondary' :
                                product.categoria === 'executar' ? 'outline' :
                                'default'
                              } className="text-xs">
                                {product.categoria.toUpperCase()}
                              </Badge>
                              <Badge variant={
                                product.status === 'Disponível' ? 'default' :
                                product.status === 'Em produção' ? 'secondary' :
                                'outline'
                              } className="text-xs">
                                {product.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {product.descricao_card && (
                            <p className="text-sm text-content line-clamp-2">
                              {product.descricao_card}
                            </p>
                          )}
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="font-bold text-foreground">Valor:</span>
                              <span className="font-normal text-content">
                                {calculatedValues[product.id] && calculatedValues[product.id] > 0 
                                  ? formatCurrency(calculatedValues[product.id]) 
                                  : "A definir"
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-bold text-foreground">Duração:</span>
                              <span className="text-content">{product.duracao}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-bold text-foreground">Dono:</span>
                              <span className="text-content">{product.dono}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positions">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Posições</CardTitle>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Posição
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {positions.map((position) => (
                    <Card key={position.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-foreground">{position.nome}</h3>
                          <div className="text-sm text-content">
                            CPH: R$ {position.cph.toFixed(2)} • 
                            Investimento Total: R$ {position.investimento_total.toFixed(2)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
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

          <TabsContent value="support">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Materiais de Apoio</CardTitle>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Material
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {supportMaterials.map((material) => (
                    <Card key={material.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-foreground">{material.nome_arquivo}</h3>
                          <p className="text-sm text-content">{material.url_direcionamento}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
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

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isTableAvailable && settings && Object.entries(settings).map(([key, value]) => (
                  <div key={key}>
                    <Label htmlFor={key}>{key}</Label>
                    <Textarea
                      id={key}
                      value={value}
                      onChange={(e) => updateSetting(key, e.target.value)}
                      className="mt-1"
                    />
                  </div>
                ))}
                {!isTableAvailable && (
                  <p className="text-muted-foreground">
                    Configurações não disponíveis no momento.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;