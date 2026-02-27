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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Plus, Edit, Trash2, Search, ExternalLink, Copy } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { calculateFaturamentoAncoragem } from "@/lib/productCalculations";
import { Checkbox } from "@/components/ui/checkbox";
import UseCaseMap from "@/components/UseCaseMap";
import PlatformManagementTab from "@/components/admin/PlatformManagementTab";

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
  forum_sobre_produto?: string;
  descricao_completa?: string;
  para_quem_serve?: string;
  como_entrega_valor?: string;
  entregaveis_relacionados?: string;
  pitch?: boolean;
  bpmn?: boolean;
  playbook?: boolean;
  icp?: boolean;
  pricing?: boolean;
  certificacao?: boolean;
  certificacao_destaque_texto?: string;
  certificacao_destaque_link?: string;
  spiced_data: SpicedData;
  spiced_data_2?: SpicedData;
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
  output_cliente: string | null;
  trava: string | null;
  url_direcionamento: string;
  created_at: string;
}

interface AdminSystem {
  id: string;
  nome_sistema: string;
  valor_entregue: string;
  link_redirecionamento: string;
  created_at?: string;
  updated_at?: string;
}

interface TierWtpRange {
  id: string;
  tier_key: string;
  tier_label: string;
  annual_revenue_min_brl: number | null;
  annual_revenue_max_brl: number | null;
  annual_revenue_label: string;
  wtp_martech_min_pct: number;
  wtp_martech_max_pct: number;
  wtp_martech_label: string;
  media_pct: number;
  tech_pct: number;
  service_pct: number;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

interface TierWtpFormState {
  tier_key: string;
  tier_label: string;
  annual_revenue_min_brl: string;
  annual_revenue_max_brl: string;
  annual_revenue_label: string;
  wtp_martech_min_pct: string;
  wtp_martech_max_pct: string;
  wtp_martech_label: string;
  media_pct: string;
  tech_pct: string;
  service_pct: string;
  sort_order: string;
}

type TravaOptionValue =
  | "trava_0"
  | "trava_1"
  | "trava_2"
  | "trava_3"
  | "trava_4"
  | "trava_5"
  | "trava_6"
  | "trava_7";

const TRAVA_OPTIONS: { value: TravaOptionValue; label: string }[] = [
  { value: "trava_0", label: "Trava 0 — Cegueira" },
  { value: "trava_1", label: "Trava 1 — Retenção" },
  { value: "trava_2", label: "Trava 2 — Decisão" },
  { value: "trava_3", label: "Trava 3 — Compromisso" },
  { value: "trava_4", label: "Trava 4 — Qualificação" },
  { value: "trava_5", label: "Trava 5 — Interesse" },
  { value: "trava_6", label: "Trava 6 — Atenção" },
  { value: "trava_7", label: "Trava 7 — Exposição" },
];

const getTravaLabel = (trava: string | null | undefined) => {
  if (!trava) return "Sem trava definida";
  if (trava === "trava_8") return "Trava 1 — Retenção";
  return TRAVA_OPTIONS.find((option) => option.value === trava)?.label || "Sem trava definida";
};

const initialTierWtpForm: TierWtpFormState = {
  tier_key: "",
  tier_label: "",
  annual_revenue_min_brl: "",
  annual_revenue_max_brl: "",
  annual_revenue_label: "",
  wtp_martech_min_pct: "",
  wtp_martech_max_pct: "",
  wtp_martech_label: "",
  media_pct: "",
  tech_pct: "",
  service_pct: "",
  sort_order: "",
};

const Admin = () => {
  const { toast } = useToast();
  const { settings, updateSetting, isTableAvailable } = useSiteSettings();

  const formatCategoryLabel = (category: string) =>
    category.replace(/_/g, " ").toUpperCase();
  
  // Estados para produtos
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
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
    output_cliente: '',
    trava: 'trava_0' as TravaOptionValue,
    url_direcionamento: ''
  });

  // Estados para sistemas
  const [systems, setSystems] = useState<AdminSystem[]>([]);
  const [isSystemDialogOpen, setIsSystemDialogOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<AdminSystem | null>(null);

  // Estados para definição de TIER e WTP
  const [tierWtpRanges, setTierWtpRanges] = useState<TierWtpRange[]>([]);
  const [isTierWtpDialogOpen, setIsTierWtpDialogOpen] = useState(false);
  const [editingTierWtpRange, setEditingTierWtpRange] = useState<TierWtpRange | null>(null);
  const [tierWtpForm, setTierWtpForm] = useState<TierWtpFormState>(initialTierWtpForm);
  
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
    forum_sobre_produto: '',
    descricao_completa: '',
    para_quem_serve: '',
    como_entrega_valor: '',
    entregaveis_relacionados: '',
    pitch: false,
    bpmn: false,
    playbook: false,
    icp: false,
    pricing: false,
    certificacao: false,
    certificacao_destaque_texto: '',
    certificacao_destaque_link: '',
    markup: 1,
    usa_dedicacao: false,
    use_case_map_1_name: 'Use Case Map - Cliente sem Investimento',
    use_case_map_2_name: 'Use Case Map - Cliente com Investimento'
  });

  const [positionForm, setPositionForm] = useState({
    nome: '',
    cph: '',
    investimento_total: ''
  });

  const [systemForm, setSystemForm] = useState({
    nome: "",
    valor_entregue: "",
    link_redirecionamento: "",
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
    fetchSystems();
    fetchTierWtpRanges();
  }, []);

  const fetchSupportMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('support_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const formattedData: SupportMaterial[] = (data || []).map((material: any) => ({
        id: material.id,
        nome_arquivo: material.nome_arquivo,
        output_cliente: material.output_cliente ?? null,
        trava: material.trava ?? null,
        url_direcionamento: material.url_direcionamento,
        created_at: material.created_at,
      }));
      setSupportMaterials(formattedData);
    } catch (error) {
      console.error('Erro ao buscar materiais de apoio:', error);
    }
  };

  const fetchSystems = async () => {
    try {
      const { data, error } = await supabase
        .from("systems")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSystems((data || []) as AdminSystem[]);
    } catch (error) {
      console.error("Erro ao buscar sistemas:", error);
    }
  };

  const fetchTierWtpRanges = async () => {
    try {
      const { data, error } = await supabase
        .from("tier_wtp_definitions")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setTierWtpRanges((data || []) as TierWtpRange[]);
    } catch (error) {
      console.error("Erro ao buscar faixas de TIER/WTP:", error);
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
        status: product.status === "Em homologação" ? "Em produção" : product.status,
        o_que_entrego: product.o_que_entrego,
        escopo: product.escopo,
        duracao_media: product.duracao_media,
        time_envolvido: product.time_envolvido,
        formato_entrega: product.formato_entrega,
        forum_sobre_produto: product.forum_sobre_produto,
        descricao_completa: product.descricao_completa,
        para_quem_serve: product.para_quem_serve,
        como_entrega_valor: product.como_entrega_valor,
        entregaveis_relacionados: product.entregaveis_relacionados,
        pitch: product.pitch,
        bpmn: product.bpmn,
        playbook: product.playbook,
        icp: product.icp,
        pricing: product.pricing,
        certificacao: product.certificacao,
        certificacao_destaque_texto: product.certificacao_destaque_texto,
        certificacao_destaque_link: product.certificacao_destaque_link,
        spiced_data: (product.spiced_data as unknown as SpicedData) || {
          situation: { objetivo: "", perguntas: "", observar: "" },
          pain: { objetivo: "", perguntas: "", observar: "" },
          impact: { objetivo: "", perguntas: "", observar: "" },
          criticalEvent: { objetivo: "", perguntas: "", observar: "" },
          decision: { objetivo: "", perguntas: "", observar: "" }
        },
        spiced_data_2: (product.spiced_data_2 as unknown as SpicedData) || {
          situation: { objetivo: "", perguntas: "", observar: "" },
          pain: { objetivo: "", perguntas: "", observar: "" },
          impact: { objetivo: "", perguntas: "", observar: "" },
          criticalEvent: { objetivo: "", perguntas: "", observar: "" },
          decision: { objetivo: "", perguntas: "", observar: "" }
        },
        como_entrego_dados: (product.como_entrego_dados as unknown as ComoEntregoItem[]) || [],
        markup: product.markup,
        usa_dedicacao: product.usa_dedicacao || false,
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
        
        // Atualizar o campo valor no banco se estiver desatualizado
        if (product.valor !== calculatedValue.toFixed(2)) {
          await supabase
            .from('products')
            .update({ valor: calculatedValue.toFixed(2) })
            .eq('id', product.id);
        }
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
      
      // Recalcular e atualizar CPH se necessário (migração para 160 horas)
      if (data) {
        for (const position of data) {
          const cphCorreto = (position.investimento_total / 160).toFixed(2);
          if (position.cph.toFixed(2) !== cphCorreto) {
            await supabase
              .from('positions')
              .update({ cph: parseFloat(cphCorreto) })
              .eq('id', position.id);
            position.cph = parseFloat(cphCorreto);
          }
        }
      }
      
      setPositions(data || []);
    } catch (error) {
      console.error('Erro ao buscar posições:', error);
    }
  };

  // Handlers para posições
  const handleEditPosition = (position: Position) => {
    setEditingPosition(position);
    // Recalcular o CPH com 160 horas ao editar
    const cphRecalculado = (position.investimento_total / 160).toFixed(2);
    setPositionForm({
      nome: position.nome,
      cph: cphRecalculado,
      investimento_total: position.investimento_total.toString()
    });
    setIsPositionDialogOpen(true);
  };

  const handleDeletePosition = async (positionId: string) => {
    try {
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('id', positionId);

      if (error) throw error;
      await fetchPositions();
      toast({
        title: "Posição excluída com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao excluir posição:', error);
      toast({
        title: "Erro ao excluir posição",
        variant: "destructive",
      });
    }
  };

  const handleSavePosition = async () => {
    try {
      // Garantir que o CPH está correto (160 horas)
      const cphCorreto = parseFloat(positionForm.investimento_total) / 160;
      
      const positionData = {
        nome: positionForm.nome,
        cph: cphCorreto,
        investimento_total: parseFloat(positionForm.investimento_total)
      };

      if (editingPosition) {
        const { error } = await supabase
          .from('positions')
          .update(positionData)
          .eq('id', editingPosition.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('positions')
          .insert([positionData]);

        if (error) throw error;
      }

      await fetchPositions();
      setIsPositionDialogOpen(false);
      setEditingPosition(null);
      setPositionForm({ nome: '', cph: '', investimento_total: '' });
      
      toast({
        title: editingPosition ? "Posição atualizada com sucesso!" : "Posição criada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar posição:', error);
      toast({
        title: "Erro ao salvar posição",
        variant: "destructive",
      });
    }
  };

  const resetSupportForm = () => {
    setEditingSupportMaterial(null);
    setSupportForm({
      nome_arquivo: "",
      output_cliente: "",
      trava: "trava_0",
      url_direcionamento: "",
    });
  };

  const handleEditSupportMaterial = (material: SupportMaterial) => {
    const normalizedTrava =
      material.trava === "trava_8"
        ? "trava_1"
        : TRAVA_OPTIONS.some((option) => option.value === material.trava)
          ? (material.trava as TravaOptionValue)
          : "trava_0";

    setEditingSupportMaterial(material);
    setSupportForm({
      nome_arquivo: material.nome_arquivo,
      output_cliente: material.output_cliente || "",
      trava: normalizedTrava,
      url_direcionamento: material.url_direcionamento,
    });
    setIsSupportDialogOpen(true);
  };

  const handleDeleteSupportMaterial = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este artefato?")) return;

    try {
      const { error } = await supabase
        .from("support_materials")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchSupportMaterials();
      toast({
        title: "Artefato excluído com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao excluir artefato:", error);
      toast({
        title: "Erro ao excluir artefato",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateSupportMaterial = async (id: string) => {
    try {
      const { data: original, error: fetchError } = await supabase
        .from("support_materials")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !original) throw fetchError;

      const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...payload } = original;

      const { error: insertError } = await supabase
        .from("support_materials")
        .insert([
          {
            ...payload,
            nome_arquivo: `Copy - ${original.nome_arquivo}`,
          },
        ]);

      if (insertError) throw insertError;

      await fetchSupportMaterials();
      toast({
        title: "Artefato duplicado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao duplicar artefato:", error);
      toast({
        title: "Erro ao duplicar artefato",
        variant: "destructive",
      });
    }
  };

  const handleSaveSupportMaterial = async () => {
    const nomeArquivo = supportForm.nome_arquivo.trim();
    const outputCliente = supportForm.output_cliente.trim();
    const trava = supportForm.trava;
    const linkInput = supportForm.url_direcionamento.trim();

    if (!nomeArquivo || !outputCliente || !trava || !linkInput) {
      toast({
        title: "Preencha todos os campos",
        description: "Nome, output, trava e link são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const normalizedLink = /^https?:\/\//i.test(linkInput)
      ? linkInput
      : `https://${linkInput}`;

    try {
      new URL(normalizedLink);
    } catch {
      toast({
        title: "Link inválido",
        description: "Informe uma URL válida para redirecionamento.",
        variant: "destructive",
      });
      return;
    }

    try {
      const supportPayload = {
        nome_arquivo: nomeArquivo,
        output_cliente: outputCliente,
        trava,
        url_direcionamento: normalizedLink,
      };

      let error;
      if (editingSupportMaterial) {
        const { error: updateError } = await supabase
          .from("support_materials")
          .update(supportPayload as any)
          .eq("id", editingSupportMaterial.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("support_materials")
          .insert([supportPayload as any]);
        error = insertError;
      }

      if (error) throw error;

      await fetchSupportMaterials();
      setIsSupportDialogOpen(false);
      resetSupportForm();

      toast({
        title: editingSupportMaterial
          ? "Artefato atualizado com sucesso!"
          : "Artefato criado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar artefato:", error);
      toast({
        title: "Erro ao salvar artefato",
        variant: "destructive",
      });
    }
  };

  const resetSystemForm = () => {
    setEditingSystem(null);
    setSystemForm({
      nome: "",
      valor_entregue: "",
      link_redirecionamento: "",
    });
  };

  const handleEditSystem = (system: AdminSystem) => {
    setEditingSystem(system);
    setSystemForm({
      nome: system.nome_sistema,
      valor_entregue: system.valor_entregue,
      link_redirecionamento: system.link_redirecionamento,
    });
    setIsSystemDialogOpen(true);
  };

  const handleDeleteSystem = async (systemId: string) => {
    if (!confirm("Tem certeza que deseja excluir este sistema?")) return;

    try {
      const { error } = await supabase
        .from("systems")
        .delete()
        .eq("id", systemId);

      if (error) throw error;

      await fetchSystems();
      toast({
        title: "Sistema excluído com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao excluir sistema:", error);
      toast({
        title: "Erro ao excluir sistema",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateSystem = async (systemId: string) => {
    try {
      const { data: original, error: fetchError } = await supabase
        .from("systems")
        .select("*")
        .eq("id", systemId)
        .single();

      if (fetchError || !original) throw fetchError;

      const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...payload } = original;

      const { error: insertError } = await supabase
        .from("systems")
        .insert([
          {
            ...payload,
            nome_sistema: `Copy - ${original.nome_sistema}`,
          },
        ]);

      if (insertError) throw insertError;

      await fetchSystems();
      toast({
        title: "Sistema duplicado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao duplicar sistema:", error);
      toast({
        title: "Erro ao duplicar sistema",
        variant: "destructive",
      });
    }
  };

  const handleSaveSystem = async () => {
    const nome = systemForm.nome.trim();
    const valorEntregue = systemForm.valor_entregue.trim();
    const linkInput = systemForm.link_redirecionamento.trim();

    if (!nome || !valorEntregue || !linkInput) {
      toast({
        title: "Preencha todos os campos",
        description: "Nome, valor entregue e link são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const normalizedLink = /^https?:\/\//i.test(linkInput)
      ? linkInput
      : `https://${linkInput}`;

    try {
      new URL(normalizedLink);
    } catch {
      toast({
        title: "Link inválido",
        description: "Informe uma URL válida para redirecionamento.",
        variant: "destructive",
      });
      return;
    }

    const systemPayload = {
      nome_sistema: nome,
      valor_entregue: valorEntregue,
      link_redirecionamento: normalizedLink,
    };

    try {
      let error;
      if (editingSystem) {
        const { error: updateError } = await supabase
          .from("systems")
          .update(systemPayload)
          .eq("id", editingSystem.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("systems")
          .insert([systemPayload]);
        error = insertError;
      }

      if (error) throw error;

      await fetchSystems();
      setIsSystemDialogOpen(false);
      resetSystemForm();

      toast({
        title: editingSystem ? "Sistema atualizado com sucesso!" : "Sistema criado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar sistema:", error);
      toast({
        title: "Erro ao salvar sistema",
        variant: "destructive",
      });
    }
  };

  const resetTierWtpForm = () => {
    setEditingTierWtpRange(null);
    setTierWtpForm(initialTierWtpForm);
  };

  const handleEditTierWtpRange = (range: TierWtpRange) => {
    setEditingTierWtpRange(range);
    setTierWtpForm({
      tier_key: range.tier_key,
      tier_label: range.tier_label,
      annual_revenue_min_brl:
        range.annual_revenue_min_brl === null ? "" : range.annual_revenue_min_brl.toString(),
      annual_revenue_max_brl:
        range.annual_revenue_max_brl === null ? "" : range.annual_revenue_max_brl.toString(),
      annual_revenue_label: range.annual_revenue_label,
      wtp_martech_min_pct: range.wtp_martech_min_pct.toString(),
      wtp_martech_max_pct: range.wtp_martech_max_pct.toString(),
      wtp_martech_label: range.wtp_martech_label,
      media_pct: range.media_pct.toString(),
      tech_pct: range.tech_pct.toString(),
      service_pct: range.service_pct.toString(),
      sort_order: range.sort_order.toString(),
    });
    setIsTierWtpDialogOpen(true);
  };

  const handleDeleteTierWtpRange = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta faixa de TIER/WTP?")) return;

    try {
      const { error } = await supabase
        .from("tier_wtp_definitions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchTierWtpRanges();
      toast({
        title: "Faixa excluída com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao excluir faixa de TIER/WTP:", error);
      toast({
        title: "Erro ao excluir faixa",
        variant: "destructive",
      });
    }
  };

  const handleSaveTierWtpRange = async () => {
    const tierKeyNormalized = tierWtpForm.tier_key
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    const tierLabel = tierWtpForm.tier_label.trim();
    const annualRevenueLabel = tierWtpForm.annual_revenue_label.trim();
    const wtpMartechLabel = tierWtpForm.wtp_martech_label.trim();
    const annualRevenueMin = tierWtpForm.annual_revenue_min_brl.trim();
    const annualRevenueMax = tierWtpForm.annual_revenue_max_brl.trim();
    const wtpMin = tierWtpForm.wtp_martech_min_pct.trim();
    const wtpMax = tierWtpForm.wtp_martech_max_pct.trim();
    const mediaPct = tierWtpForm.media_pct.trim();
    const techPct = tierWtpForm.tech_pct.trim();
    const servicePct = tierWtpForm.service_pct.trim();
    const sortOrder = tierWtpForm.sort_order.trim();

    if (
      !tierKeyNormalized ||
      !tierLabel ||
      !annualRevenueLabel ||
      !wtpMartechLabel ||
      !wtpMin ||
      !wtpMax ||
      !mediaPct ||
      !techPct ||
      !servicePct ||
      !sortOrder
    ) {
      toast({
        title: "Preencha os campos obrigatórios",
        description: "Tier, labels, percentuais e ordem são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const annualRevenueMinValue = annualRevenueMin ? parseFloat(annualRevenueMin) : null;
    const annualRevenueMaxValue = annualRevenueMax ? parseFloat(annualRevenueMax) : null;
    const wtpMinValue = parseFloat(wtpMin);
    const wtpMaxValue = parseFloat(wtpMax);
    const mediaPctValue = parseFloat(mediaPct);
    const techPctValue = parseFloat(techPct);
    const servicePctValue = parseFloat(servicePct);
    const sortOrderValue = parseInt(sortOrder, 10);

    if (
      [wtpMinValue, wtpMaxValue, mediaPctValue, techPctValue, servicePctValue, sortOrderValue].some(
        (value) => Number.isNaN(value),
      ) ||
      (annualRevenueMinValue !== null && Number.isNaN(annualRevenueMinValue)) ||
      (annualRevenueMaxValue !== null && Number.isNaN(annualRevenueMaxValue))
    ) {
      toast({
        title: "Valores inválidos",
        description: "Verifique os campos numéricos antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    if (wtpMinValue > wtpMaxValue) {
      toast({
        title: "Faixa de WTP inválida",
        description: "O valor mínimo de WTP não pode ser maior que o máximo.",
        variant: "destructive",
      });
      return;
    }

    if (
      annualRevenueMinValue !== null &&
      annualRevenueMaxValue !== null &&
      annualRevenueMinValue >= annualRevenueMaxValue
    ) {
      toast({
        title: "Faixa de receita inválida",
        description: "A receita mínima deve ser menor que a receita máxima.",
        variant: "destructive",
      });
      return;
    }

    const splitTotal = mediaPctValue + techPctValue + servicePctValue;
    if (Math.abs(splitTotal - 100) > 0.01) {
      toast({
        title: "Distribuição inválida",
        description: "A soma de Mídia, Tech e Serviço deve ser 100%.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      tier_key: tierKeyNormalized,
      tier_label: tierLabel,
      annual_revenue_min_brl: annualRevenueMinValue,
      annual_revenue_max_brl: annualRevenueMaxValue,
      annual_revenue_label: annualRevenueLabel,
      wtp_martech_min_pct: wtpMinValue,
      wtp_martech_max_pct: wtpMaxValue,
      wtp_martech_label: wtpMartechLabel,
      media_pct: mediaPctValue,
      tech_pct: techPctValue,
      service_pct: servicePctValue,
      sort_order: sortOrderValue,
    };

    try {
      let error;
      if (editingTierWtpRange) {
        const { error: updateError } = await supabase
          .from("tier_wtp_definitions")
          .update(payload)
          .eq("id", editingTierWtpRange.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("tier_wtp_definitions")
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      await fetchTierWtpRanges();
      setIsTierWtpDialogOpen(false);
      resetTierWtpForm();

      toast({
        title: editingTierWtpRange
          ? "Faixa de TIER/WTP atualizada com sucesso!"
          : "Faixa de TIER/WTP criada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar faixa de TIER/WTP:", error);
      toast({
        title: "Erro ao salvar faixa",
        description:
          "Verifique se não existe tier_key ou sort_order duplicado e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSaveProduct = async () => {
    try {
      const forumLinkInput = productForm.forum_sobre_produto.trim();
      let normalizedForumLink: string | null = null;

      if (forumLinkInput) {
        const forumCandidate = /^https?:\/\//i.test(forumLinkInput)
          ? forumLinkInput
          : `https://${forumLinkInput}`;

        try {
          const parsedForumUrl = new URL(forumCandidate);
          normalizedForumLink = parsedForumUrl.toString();
        } catch {
          toast({
            title: "Link inválido",
            description: "Informe uma URL válida para o Fórum no Google Chat.",
            variant: "destructive",
          });
          return;
        }
      }

      const productData = {
        produto: productForm.produto,
        categoria: productForm.categoria as
          | "destrava_receita"
          | "saber"
          | "ter"
          | "executar"
          | "potencializar",
        description: productForm.description,
        descricao_card: productForm.descricao_card || null,
        como_vendo: productForm.como_vendo,
        duracao: productForm.duracao,
        dono: productForm.dono,
        valor: productForm.valor,
        status: productForm.status as "Disponível" | "Em produção",
        o_que_entrego: productForm.o_que_entrego || '',
        escopo: productForm.escopo || null,
        duracao_media: productForm.duracao_media || null,
        time_envolvido: productForm.time_envolvido || null,
        formato_entrega: productForm.formato_entrega || null,
        forum_sobre_produto: normalizedForumLink,
        descricao_completa: productForm.descricao_completa || null,
        para_quem_serve: productForm.para_quem_serve || null,
        como_entrega_valor: productForm.como_entrega_valor || null,
        entregaveis_relacionados: productForm.entregaveis_relacionados || null,
        pitch: productForm.pitch,
        bpmn: productForm.bpmn,
        playbook: productForm.playbook,
        icp: productForm.icp,
        pricing: productForm.pricing,
        certificacao: productForm.certificacao,
        certificacao_destaque_texto: productForm.certificacao
          ? productForm.certificacao_destaque_texto || null
          : null,
        certificacao_destaque_link: productForm.certificacao
          ? productForm.certificacao_destaque_link || null
          : null,
        spiced_data: spicedData,
        spiced_data_2: spicedData2,
        como_entrego_dados: comoEntregoDados,
        markup: productForm.markup,
        usa_dedicacao: productForm.usa_dedicacao,
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

      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
          ? ((error as { message: string }).message || "").trim()
          : "";

      const errorCode =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code?: unknown }).code === "string"
          ? (error as { code: string }).code
          : "";

      const forumColumnMissing =
        (errorCode === "PGRST204" || errorCode === "42703") &&
        errorMessage.toLowerCase().includes("forum_sobre_produto");

      toast({
        title: "Erro",
        description: forumColumnMissing
          ? "O campo 'Forum sobre Produto' ainda nao existe no banco. Aplique a migration mais recente e tente novamente."
          : (errorMessage || "Erro ao salvar produto"),
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
      status: product.status === "Em homologação" ? "Em produção" : product.status,
      o_que_entrego: (product as any).o_que_entrego || '',
      escopo: product.escopo || '',
      duracao_media: product.duracao_media || '',
      time_envolvido: product.time_envolvido || '',
      formato_entrega: product.formato_entrega || '',
      forum_sobre_produto: product.forum_sobre_produto || '',
      descricao_completa: product.descricao_completa || '',
      para_quem_serve: (product as any).para_quem_serve || '',
      como_entrega_valor: (product as any).como_entrega_valor || '',
      entregaveis_relacionados: (product as any).entregaveis_relacionados || '',
      pitch: (product as any).pitch || false,
      bpmn: (product as any).bpmn || false,
      playbook: (product as any).playbook || false,
      icp: (product as any).icp || false,
      pricing: (product as any).pricing || false,
      certificacao: (product as any).certificacao || false,
      certificacao_destaque_texto: (product as any).certificacao_destaque_texto || '',
      certificacao_destaque_link: (product as any).certificacao_destaque_link || '',
      markup: product.markup || 1,
      usa_dedicacao: (product as any).usa_dedicacao || false,
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
    setSpicedData2(product.spiced_data_2 || {
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

  // Função para calcular faturamento sem desconto (DEPRECATED - usar calculateFaturamentoAncoragem)
  const calculateFaturamentoSemDesconto = async (productId: string, _productMarkup?: number): Promise<number> => {
    return await calculateFaturamentoAncoragem(productId);
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
      
      // Recalcular produtos para atualizar valores
      await fetchProducts();
    }
  };

  // Filtrar produtos
  useEffect(() => {
    let filtered = products;

    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (normalizedSearch) {
      filtered = filtered.filter((product) => {
        const searchableContent =
          `${product.produto} ${product.description ?? ''} ${product.descricao_card ?? ''}`.toLowerCase();
        return searchableContent.includes(normalizedSearch);
      });
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.categoria === categoryFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => product.status === statusFilter);
    }
    
    setFilteredProducts(filtered);
  }, [products, categoryFilter, statusFilter, searchTerm]);

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
      forum_sobre_produto: '',
      descricao_completa: '',
      para_quem_serve: '',
      como_entrega_valor: '',
      entregaveis_relacionados: '',
      pitch: false,
      bpmn: false,
      playbook: false,
      icp: false,
      pricing: false,
      certificacao: false,
      certificacao_destaque_texto: '',
      certificacao_destaque_link: '',
      markup: 1,
      usa_dedicacao: false,
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

  const handleDuplicateProduct = async (id: string) => {
    try {
      const { data: original, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !original) throw fetchError;

      const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...payload } = original;

      const { data: duplicatedProduct, error: insertError } = await supabase
        .from("products")
        .insert([
          {
            ...payload,
            produto: `Copy - ${original.produto}`,
          } as any,
        ])
        .select("id")
        .single();

      if (insertError) throw insertError;

      if (!duplicatedProduct?.id) {
        throw new Error("Não foi possível obter o ID do produto duplicado.");
      }

      const { data: relatedPositions, error: relatedPositionsError } = await supabase
        .from("product_positions")
        .select("*")
        .eq("product_id", id);

      if (relatedPositionsError) {
        await supabase.from("products").delete().eq("id", duplicatedProduct.id);
        throw relatedPositionsError;
      }

      const { data: relatedMaterials, error: relatedMaterialsError } = await supabase
        .from("training_materials")
        .select("*")
        .eq("product_id", id);

      if (relatedMaterialsError) {
        await supabase.from("products").delete().eq("id", duplicatedProduct.id);
        throw relatedMaterialsError;
      }

      if ((relatedPositions || []).length > 0) {
        const duplicatedPositions = (relatedPositions || []).map((row) => {
          const { id: _rowId, created_at: _rowCreatedAt, updated_at: _rowUpdatedAt, ...positionPayload } = row;
          return {
            ...positionPayload,
            product_id: duplicatedProduct.id,
          };
        });

        const { error: duplicatePositionsError } = await supabase
          .from("product_positions")
          .insert(duplicatedPositions as any);

        if (duplicatePositionsError) {
          await supabase.from("products").delete().eq("id", duplicatedProduct.id);
          throw duplicatePositionsError;
        }
      }

      if ((relatedMaterials || []).length > 0) {
        const duplicatedMaterials = (relatedMaterials || []).map((row) => {
          const { id: _rowId, created_at: _rowCreatedAt, updated_at: _rowUpdatedAt, ...materialPayload } = row;
          return {
            ...materialPayload,
            product_id: duplicatedProduct.id,
          };
        });

        const { error: duplicateMaterialsError } = await supabase
          .from("training_materials")
          .insert(duplicatedMaterials as any);

        if (duplicateMaterialsError) {
          await supabase.from("products").delete().eq("id", duplicatedProduct.id);
          throw duplicateMaterialsError;
        }
      }

      await fetchProducts();
      toast({
        title: "Sucesso",
        description: `Produto duplicado com ${(relatedPositions || []).length} posições e ${(relatedMaterials || []).length} materiais relacionados.`,
      });
    } catch (error) {
      console.error("Erro ao duplicar produto:", error);
      toast({
        title: "Erro",
        description: "Erro ao duplicar produto",
        variant: "destructive",
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
          <h1 className="text-3xl font-bold">Área Administrativa</h1>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="platforms">Stack Digital</TabsTrigger>
            <TabsTrigger value="positions">Posições</TabsTrigger>
            <TabsTrigger value="support">Artefatos</TabsTrigger>
            <TabsTrigger value="systems">Sistemas Operacionais</TabsTrigger>
            <TabsTrigger value="tier-wtp">TIER e WTP</TabsTrigger>
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
                                  <SelectItem value="destrava_receita">DESTRAVA RECEITA</SelectItem>
                                  <SelectItem value="saber">SABER</SelectItem>
                                  <SelectItem value="ter">TER</SelectItem>
                                  <SelectItem value="executar">EXECUTAR</SelectItem>
                                  <SelectItem value="potencializar">POTENCIALIZAR</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Campo Usa Dedicação */}
                            <div className="col-span-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="usa_dedicacao"
                                  checked={productForm.usa_dedicacao}
                                  onCheckedChange={(checked) => 
                                    setProductForm({...productForm, usa_dedicacao: checked as boolean})
                                  }
                                />
                                <div className="grid gap-1.5 leading-none">
                                  <Label 
                                    htmlFor="usa_dedicacao" 
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    Permite configurar nível de dedicação
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    Habilita o seletor de dedicação nos cards e na DRE (recomendado para produtos EXECUTAR)
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Campo Destaque de Certificação */}
                            <div className="col-span-2 space-y-3 rounded-lg border border-border/70 p-4">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="certificacao"
                                  checked={productForm.certificacao}
                                  onCheckedChange={(checked) =>
                                    setProductForm({...productForm, certificacao: checked as boolean})
                                  }
                                />
                                <div className="grid gap-1.5 leading-none">
                                  <Label
                                    htmlFor="certificacao"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    Exibir destaque de certificação na página do produto
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    Ative apenas para produtos que precisam mostrar chamada especial de certificação.
                                  </p>
                                </div>
                              </div>

                              {productForm.certificacao && (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="certificacao_destaque_texto">Texto de destaque</Label>
                                    <Textarea
                                      id="certificacao_destaque_texto"
                                      value={productForm.certificacao_destaque_texto}
                                      onChange={(e) =>
                                        setProductForm({
                                          ...productForm,
                                          certificacao_destaque_texto: e.target.value,
                                        })
                                      }
                                      placeholder="Ex: Este produto inclui certificação oficial com aplicação prática."
                                      rows={3}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="certificacao_destaque_link">Link de redirecionamento</Label>
                                    <Input
                                      id="certificacao_destaque_link"
                                      value={productForm.certificacao_destaque_link}
                                      onChange={(e) =>
                                        setProductForm({
                                          ...productForm,
                                          certificacao_destaque_link: e.target.value,
                                        })
                                      }
                                      placeholder="https://..."
                                    />
                                  </div>
                                </div>
                              )}
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
                            <div className="col-span-2">
                              <Label htmlFor="forum_sobre_produto">Forum sobre Produto (Google Chat)</Label>
                              <Input
                                id="forum_sobre_produto"
                                value={productForm.forum_sobre_produto}
                                onChange={(e) => setProductForm({...productForm, forum_sobre_produto: e.target.value})}
                                placeholder="Cole aqui o link da sala do Google Chat"
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
                            <Label htmlFor="o_que_entrego">Como entregar</Label>
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
                <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_170px_170px]">
                  <div>
                    <Label htmlFor="searchProducts">Buscar Produtos</Label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="searchProducts"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Buscar por nome ou descrição..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="categoryFilter">Filtrar por Categoria</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="destrava_receita">DESTRAVA RECEITA</SelectItem>
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
                                product.categoria === 'destrava_receita' ? 'outline' :
                                product.categoria === 'saber' ? 'default' :
                                product.categoria === 'ter' ? 'secondary' :
                                product.categoria === 'executar' ? 'outline' :
                                'default'
                              } className="text-xs">
                                {formatCategoryLabel(product.categoria)}
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
                              title="Editar produto"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicateProduct(product.id)}
                              className="h-8 w-8 p-0"
                              title="Duplicar produto"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              title="Excluir produto"
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
                                 {product.valor === "A definir" ? "A definir" : formatCurrency(product.valor)}
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

          <TabsContent value="platforms">
            <PlatformManagementTab />
          </TabsContent>

          <TabsContent value="positions">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Posições</CardTitle>
                  <Button onClick={() => {
                    setEditingPosition(null);
                    setPositionForm({ nome: '', cph: '', investimento_total: '' });
                    setIsPositionDialogOpen(true);
                  }}>
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditPosition(position)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeletePosition(position.id)}
                          >
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
                  <CardTitle>Artefatos</CardTitle>
                  <Button
                    onClick={() => {
                      resetSupportForm();
                      setIsSupportDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Material
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {supportMaterials.length === 0 ? (
                  <div className="rounded-lg border border-border/70 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                    Nenhum artefato cadastrado no momento.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {supportMaterials.map((material) => (
                      <Card key={material.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-2">
                            <h3 className="font-bold text-foreground">{material.nome_arquivo}</h3>
                            <p className="text-sm text-content">{material.output_cliente || "Sem output configurado"}</p>
                            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                              {getTravaLabel(material.trava)}
                            </p>
                            <a
                              href={material.url_direcionamento}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline break-all"
                            >
                              {material.url_direcionamento}
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                            </a>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSupportMaterial(material)}
                              title="Editar artefato"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDuplicateSupportMaterial(material.id)}
                              title="Duplicar artefato"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSupportMaterial(material.id)}
                              title="Excluir artefato"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="systems">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Sistemas Operacionais</CardTitle>
                  <Button
                    onClick={() => {
                      resetSystemForm();
                      setIsSystemDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Sistema
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {systems.length === 0 ? (
                  <div className="rounded-lg border border-border/70 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                    Nenhum sistema cadastrado. Adicione o primeiro para conectar redirecionamentos.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {systems.map((system) => (
                      <Card key={system.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2 min-w-0">
                            <h3 className="font-semibold text-foreground">{system.nome_sistema}</h3>
                            <p className="text-sm text-content">{system.valor_entregue}</p>
                            <a
                              href={system.link_redirecionamento}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline break-all"
                            >
                              {system.link_redirecionamento}
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                            </a>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSystem(system)}
                              title="Editar sistema"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDuplicateSystem(system.id)}
                              title="Duplicar sistema"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSystem(system.id)}
                              title="Excluir sistema"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tier-wtp">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center gap-3">
                  <div>
                    <CardTitle>Definição de TIER e WTP</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Cadastre e edite as faixas de receita, WTP e distribuição de investimento.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      resetTierWtpForm();
                      setIsTierWtpDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Faixa
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {tierWtpRanges.length === 0 ? (
                  <div className="rounded-lg border border-border/70 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                    Nenhuma faixa cadastrada no momento.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-border/70">
                    <Table className="min-w-[920px]">
                      <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableHead>Tier</TableHead>
                          <TableHead>Annual Revenue</TableHead>
                          <TableHead>WTP Martech</TableHead>
                          <TableHead>Mídia</TableHead>
                          <TableHead>Tech</TableHead>
                          <TableHead>Serviço</TableHead>
                          <TableHead className="text-right">Editar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tierWtpRanges.map((range) => (
                          <TableRow key={range.id}>
                            <TableCell className="font-semibold text-foreground">{range.tier_label}</TableCell>
                            <TableCell className="text-content">{range.annual_revenue_label}</TableCell>
                            <TableCell className="text-content">{range.wtp_martech_label}</TableCell>
                            <TableCell className="text-content">{range.media_pct}%</TableCell>
                            <TableCell className="text-content">{range.tech_pct}%</TableCell>
                            <TableCell className="text-content">{range.service_pct}%</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditTierWtpRange(range)}
                                title="Editar faixa"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isTableAvailable && settings && Object.entries(settings)
                  .map(([key, value]) => (
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

        {/* Dialog para Posições */}
        <Dialog open={isPositionDialogOpen} onOpenChange={setIsPositionDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingPosition ? 'Editar Posição' : 'Nova Posição'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Posição</Label>
                <Input
                  id="nome"
                  value={positionForm.nome}
                  onChange={(e) => setPositionForm({...positionForm, nome: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="cph">CPH (Custo por Hora)</Label>
                <Input
                  id="cph"
                  type="number"
                  step="0.01"
                  value={positionForm.cph}
                  readOnly
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Calculado automaticamente: Investimento Total ÷ 160 horas
                </p>
              </div>
              <div>
                <Label htmlFor="investimento_total">Investimento Total</Label>
                <Input
                  id="investimento_total"
                  type="number"
                  step="0.01"
                  value={positionForm.investimento_total}
                  onChange={(e) => {
                    const investimento = e.target.value;
                    const cphCalculado = investimento ? (parseFloat(investimento) / 160).toFixed(2) : '';
                    setPositionForm({
                      ...positionForm, 
                      investimento_total: investimento,
                      cph: cphCalculado
                    });
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsPositionDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSavePosition}>
                {editingPosition ? 'Atualizar' : 'Criar'} Posição
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isSupportDialogOpen}
          onOpenChange={(open) => {
            setIsSupportDialogOpen(open);
            if (!open) resetSupportForm();
          }}
        >
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>
                {editingSupportMaterial ? "Editar Artefato" : "Novo Artefato"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="support_nome">Nome do Artefato</Label>
                <Input
                  id="support_nome"
                  value={supportForm.nome_arquivo}
                  onChange={(event) =>
                    setSupportForm((prev) => ({
                      ...prev,
                      nome_arquivo: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="support_output">Output para o Cliente</Label>
                <Textarea
                  id="support_output"
                  value={supportForm.output_cliente}
                  rows={4}
                  onChange={(event) =>
                    setSupportForm((prev) => ({
                      ...prev,
                      output_cliente: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="support_trava">Qual a trava relacionada</Label>
                <Select
                  value={supportForm.trava}
                  onValueChange={(value: TravaOptionValue) =>
                    setSupportForm((prev) => ({ ...prev, trava: value }))
                  }
                >
                  <SelectTrigger id="support_trava">
                    <SelectValue placeholder="Selecione a trava" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAVA_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="support_link">Link de redirecionamento</Label>
                <Input
                  id="support_link"
                  type="url"
                  value={supportForm.url_direcionamento}
                  onChange={(event) =>
                    setSupportForm((prev) => ({
                      ...prev,
                      url_direcionamento: event.target.value,
                    }))
                  }
                  placeholder="https://exemplo.com"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsSupportDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveSupportMaterial}>
                {editingSupportMaterial ? "Atualizar Artefato" : "Criar Artefato"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isSystemDialogOpen}
          onOpenChange={(open) => {
            setIsSystemDialogOpen(open);
            if (!open) resetSystemForm();
          }}
        >
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>
                {editingSystem ? "Editar Sistema" : "Novo Sistema"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="system_nome">Nome do sistema</Label>
                <Input
                  id="system_nome"
                  value={systemForm.nome}
                  onChange={(event) =>
                    setSystemForm((prev) => ({ ...prev, nome: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="system_valor">O que ele entrega de valor</Label>
                <Textarea
                  id="system_valor"
                  value={systemForm.valor_entregue}
                  rows={4}
                  onChange={(event) =>
                    setSystemForm((prev) => ({
                      ...prev,
                      valor_entregue: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="system_link">Link para redirecionamento</Label>
                <Input
                  id="system_link"
                  type="url"
                  value={systemForm.link_redirecionamento}
                  onChange={(event) =>
                    setSystemForm((prev) => ({
                      ...prev,
                      link_redirecionamento: event.target.value,
                    }))
                  }
                  placeholder="https://exemplo.com"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsSystemDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveSystem}>
                {editingSystem ? "Atualizar Sistema" : "Criar Sistema"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isTierWtpDialogOpen}
          onOpenChange={(open) => {
            setIsTierWtpDialogOpen(open);
            if (!open) resetTierWtpForm();
          }}
        >
          <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTierWtpRange ? "Editar Faixa de TIER/WTP" : "Nova Faixa de TIER/WTP"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="tier_key">Tier Key</Label>
                <Input
                  id="tier_key"
                  value={tierWtpForm.tier_key}
                  onChange={(event) =>
                    setTierWtpForm((prev) => ({ ...prev, tier_key: event.target.value }))
                  }
                  placeholder="ex: medium_plus"
                />
              </div>
              <div>
                <Label htmlFor="tier_label">Nome do Tier</Label>
                <Input
                  id="tier_label"
                  value={tierWtpForm.tier_label}
                  onChange={(event) =>
                    setTierWtpForm((prev) => ({ ...prev, tier_label: event.target.value }))
                  }
                  placeholder='ex: Medium (+)'
                />
              </div>

              <div>
                <Label htmlFor="annual_revenue_min_brl">Receita mínima (R$)</Label>
                <Input
                  id="annual_revenue_min_brl"
                  type="number"
                  step="0.01"
                  value={tierWtpForm.annual_revenue_min_brl}
                  onChange={(event) =>
                    setTierWtpForm((prev) => ({
                      ...prev,
                      annual_revenue_min_brl: event.target.value,
                    }))
                  }
                  placeholder="Ex: 2400000"
                />
              </div>
              <div>
                <Label htmlFor="annual_revenue_max_brl">Receita máxima (R$)</Label>
                <Input
                  id="annual_revenue_max_brl"
                  type="number"
                  step="0.01"
                  value={tierWtpForm.annual_revenue_max_brl}
                  onChange={(event) =>
                    setTierWtpForm((prev) => ({
                      ...prev,
                      annual_revenue_max_brl: event.target.value,
                    }))
                  }
                  placeholder="Ex: 10000000"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="annual_revenue_label">Rótulo da faixa de receita</Label>
                <Input
                  id="annual_revenue_label"
                  value={tierWtpForm.annual_revenue_label}
                  onChange={(event) =>
                    setTierWtpForm((prev) => ({
                      ...prev,
                      annual_revenue_label: event.target.value,
                    }))
                  }
                  placeholder="Ex: > R$ 2.4M < R$ 10M"
                />
              </div>

              <div>
                <Label htmlFor="wtp_martech_min_pct">WTP mínimo (%)</Label>
                <Input
                  id="wtp_martech_min_pct"
                  type="number"
                  step="0.01"
                  value={tierWtpForm.wtp_martech_min_pct}
                  onChange={(event) =>
                    setTierWtpForm((prev) => ({
                      ...prev,
                      wtp_martech_min_pct: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="wtp_martech_max_pct">WTP máximo (%)</Label>
                <Input
                  id="wtp_martech_max_pct"
                  type="number"
                  step="0.01"
                  value={tierWtpForm.wtp_martech_max_pct}
                  onChange={(event) =>
                    setTierWtpForm((prev) => ({
                      ...prev,
                      wtp_martech_max_pct: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="wtp_martech_label">Rótulo de WTP Martech</Label>
                <Input
                  id="wtp_martech_label"
                  value={tierWtpForm.wtp_martech_label}
                  onChange={(event) =>
                    setTierWtpForm((prev) => ({
                      ...prev,
                      wtp_martech_label: event.target.value,
                    }))
                  }
                  placeholder="Ex: 10 - 12%"
                />
              </div>

              <div>
                <Label htmlFor="media_pct">Mídia (%)</Label>
                <Input
                  id="media_pct"
                  type="number"
                  step="0.01"
                  value={tierWtpForm.media_pct}
                  onChange={(event) =>
                    setTierWtpForm((prev) => ({ ...prev, media_pct: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="tech_pct">Tech (%)</Label>
                <Input
                  id="tech_pct"
                  type="number"
                  step="0.01"
                  value={tierWtpForm.tech_pct}
                  onChange={(event) =>
                    setTierWtpForm((prev) => ({ ...prev, tech_pct: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="service_pct">Serviço (%)</Label>
                <Input
                  id="service_pct"
                  type="number"
                  step="0.01"
                  value={tierWtpForm.service_pct}
                  onChange={(event) =>
                    setTierWtpForm((prev) => ({ ...prev, service_pct: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="sort_order">Ordem de exibição</Label>
                <Input
                  id="sort_order"
                  type="number"
                  step="1"
                  value={tierWtpForm.sort_order}
                  onChange={(event) =>
                    setTierWtpForm((prev) => ({ ...prev, sort_order: event.target.value }))
                  }
                  placeholder="Ex: 1"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsTierWtpDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTierWtpRange}>
                {editingTierWtpRange ? "Atualizar Faixa" : "Criar Faixa"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Admin;
