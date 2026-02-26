import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Edit, Plus, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createEmptyScoreMap,
  createSlug,
  MAX_PLATFORM_USEFUL_LINKS,
  normalizeScoreInput,
  normalizeScoreMap,
  normalizeUrl,
  normalizeUsefulLinks,
  operationalCapacityCriteria,
  PlatformScoreMap,
  PlatformUsefulLink,
  strategicPotentialCriteria,
} from "@/lib/platforms";

interface PlatformRecord {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: string;
  client_logo_url: string | null;
  short_description: string | null;
  general_description: string | null;
  gtm_maturity: string | null;
  icp_recommended: string | null;
  practical_applications: string | null;
  benefits_and_advantages: string | null;
  client_benefits: string | null;
  unit_benefits: string | null;
  partnership_regulations: string | null;
  base_pricing: string | null;
  commission_and_invoicing: string | null;
  how_to_hire: string | null;
  technical_commercial_support: string | null;
  forum_url: string | null;
  request_form_url: string | null;
  useful_links: unknown;
  operational_capacity_scores: unknown;
  strategic_potential_scores: unknown;
}

interface PlatformFormState {
  name: string;
  category: string;
  status: string;
  client_logo_url: string;
  short_description: string;
  general_description: string;
  gtm_maturity: string;
  icp_recommended: string;
  practical_applications: string;
  benefits_and_advantages: string;
  client_benefits: string;
  unit_benefits: string;
  partnership_regulations: string;
  base_pricing: string;
  commission_and_invoicing: string;
  how_to_hire: string;
  technical_commercial_support: string;
  forum_url: string;
  request_form_url: string;
  useful_links: PlatformUsefulLink[];
  operational_capacity_scores: PlatformScoreMap;
  strategic_potential_scores: PlatformScoreMap;
}

type PlatformRow = Database["public"]["Tables"]["platforms"]["Row"];
const stackDigitalRequestFormSettingKey = "stack_digital_request_form_url";
const stackDigitalRequestFormFallbackUrl = "https://forms.gle/solicitacao-contratacao-stack-digital";

const createEmptyPlatformForm = (): PlatformFormState => ({
  name: "",
  category: "Geral",
  status: "Ativa",
  client_logo_url: "",
  short_description: "",
  general_description: "",
  gtm_maturity: "",
  icp_recommended: "",
  practical_applications: "",
  benefits_and_advantages: "",
  client_benefits: "",
  unit_benefits: "",
  partnership_regulations: "",
  base_pricing: "",
  commission_and_invoicing: "",
  how_to_hire: "",
  technical_commercial_support: "",
  forum_url: "",
  request_form_url: "",
  useful_links: Array.from({ length: MAX_PLATFORM_USEFUL_LINKS }, () => ({ label: "", url: "" })),
  operational_capacity_scores: createEmptyScoreMap(operationalCapacityCriteria),
  strategic_potential_scores: createEmptyScoreMap(strategicPotentialCriteria),
});

const toPlatformRecord = (value: PlatformRow): PlatformRecord => ({
  id: String(value.id),
  name: String(value.name || ""),
  slug: String(value.slug || ""),
  category: String(value.category || "Geral"),
  status: String(value.status || "Ativa"),
  client_logo_url: typeof value.client_logo_url === "string" ? value.client_logo_url : null,
  short_description: typeof value.short_description === "string" ? value.short_description : null,
  general_description: typeof value.general_description === "string" ? value.general_description : null,
  gtm_maturity: typeof value.gtm_maturity === "string" ? value.gtm_maturity : null,
  icp_recommended: typeof value.icp_recommended === "string" ? value.icp_recommended : null,
  practical_applications:
    typeof value.practical_applications === "string" ? value.practical_applications : null,
  benefits_and_advantages:
    typeof value.benefits_and_advantages === "string" ? value.benefits_and_advantages : null,
  client_benefits: typeof value.client_benefits === "string" ? value.client_benefits : null,
  unit_benefits: typeof value.unit_benefits === "string" ? value.unit_benefits : null,
  partnership_regulations:
    typeof value.partnership_regulations === "string" ? value.partnership_regulations : null,
  base_pricing: typeof value.base_pricing === "string" ? value.base_pricing : null,
  commission_and_invoicing:
    typeof value.commission_and_invoicing === "string" ? value.commission_and_invoicing : null,
  how_to_hire: typeof value.how_to_hire === "string" ? value.how_to_hire : null,
  technical_commercial_support:
    typeof value.technical_commercial_support === "string" ? value.technical_commercial_support : null,
  forum_url: typeof value.forum_url === "string" ? value.forum_url : null,
  request_form_url: typeof value.request_form_url === "string" ? value.request_form_url : null,
  useful_links: value.useful_links,
  operational_capacity_scores: value.operational_capacity_scores,
  strategic_potential_scores: value.strategic_potential_scores,
});

const PlatformManagementTab = () => {
  const { toast } = useToast();

  const [platforms, setPlatforms] = useState<PlatformRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<PlatformRecord | null>(null);
  const [form, setForm] = useState<PlatformFormState>(() => createEmptyPlatformForm());
  const [logoPreviewErrorByPlatform, setLogoPreviewErrorByPlatform] = useState<Record<string, boolean>>({});
  const [stackDigitalRequestFormUrl, setStackDigitalRequestFormUrl] = useState(
    stackDigitalRequestFormFallbackUrl
  );
  const [loadingStackDigitalRequestFormUrl, setLoadingStackDigitalRequestFormUrl] = useState(true);
  const [savingStackDigitalRequestFormUrl, setSavingStackDigitalRequestFormUrl] = useState(false);

  const fetchPlatforms = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("platforms")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      const formatted = ((data || []) as PlatformRow[]).map(toPlatformRecord);
      setPlatforms(formatted);
    } catch (error) {
      console.error("Erro ao buscar plataformas:", error);
      toast({
        title: "Erro ao carregar plataformas",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      setPlatforms([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  const fetchStackDigitalRequestFormUrl = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", stackDigitalRequestFormSettingKey)
        .maybeSingle();

      if (error) throw error;

      const settingValue =
        data &&
        typeof data === "object" &&
        "setting_value" in data &&
        typeof (data as { setting_value?: unknown }).setting_value === "string"
          ? (data as { setting_value: string }).setting_value
          : stackDigitalRequestFormFallbackUrl;

      setStackDigitalRequestFormUrl(settingValue);
    } catch (error) {
      console.error("Erro ao buscar link geral de contratação da Stack Digital:", error);
      setStackDigitalRequestFormUrl(stackDigitalRequestFormFallbackUrl);
    } finally {
      setLoadingStackDigitalRequestFormUrl(false);
    }
  }, []);

  useEffect(() => {
    fetchStackDigitalRequestFormUrl();
  }, [fetchStackDigitalRequestFormUrl]);

  const filteredPlatforms = useMemo(() => {
    if (!searchTerm.trim()) return platforms;
    const normalizedSearch = searchTerm.toLowerCase();

    return platforms.filter((platform) => {
      return (
        platform.name.toLowerCase().includes(normalizedSearch) ||
        platform.category.toLowerCase().includes(normalizedSearch) ||
        (platform.short_description || "").toLowerCase().includes(normalizedSearch)
      );
    });
  }, [platforms, searchTerm]);

  const resetForm = () => {
    setEditingPlatform(null);
    setForm(createEmptyPlatformForm());
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (platform: PlatformRecord) => {
    const normalizedLinks = normalizeUsefulLinks(platform.useful_links);
    const linksWithPadding = [...normalizedLinks];
    while (linksWithPadding.length < MAX_PLATFORM_USEFUL_LINKS) {
      linksWithPadding.push({ label: "", url: "" });
    }

    setEditingPlatform(platform);
    setForm({
      name: platform.name,
      category: platform.category || "Geral",
      status: platform.status || "Ativa",
      client_logo_url: platform.client_logo_url || "",
      short_description: platform.short_description || "",
      general_description: platform.general_description || "",
      gtm_maturity: platform.gtm_maturity || "",
      icp_recommended: platform.icp_recommended || "",
      practical_applications: platform.practical_applications || "",
      benefits_and_advantages: platform.benefits_and_advantages || "",
      client_benefits: platform.client_benefits || "",
      unit_benefits: platform.unit_benefits || "",
      partnership_regulations: platform.partnership_regulations || "",
      base_pricing: platform.base_pricing || "",
      commission_and_invoicing: platform.commission_and_invoicing || "",
      how_to_hire: platform.how_to_hire || "",
      technical_commercial_support: platform.technical_commercial_support || "",
      forum_url: platform.forum_url || "",
      request_form_url: platform.request_form_url || "",
      useful_links: linksWithPadding,
      operational_capacity_scores: normalizeScoreMap(
        platform.operational_capacity_scores,
        operationalCapacityCriteria
      ),
      strategic_potential_scores: normalizeScoreMap(
        platform.strategic_potential_scores,
        strategicPotentialCriteria
      ),
    });

    setIsDialogOpen(true);
  };

  const handleFieldChange = <T extends keyof PlatformFormState>(
    field: T,
    value: PlatformFormState[T]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleLinkFieldChange = (
    index: number,
    field: keyof PlatformUsefulLink,
    value: string
  ) => {
    setForm((current) => {
      const nextLinks = [...current.useful_links];
      nextLinks[index] = {
        ...nextLinks[index],
        [field]: value,
      };

      return {
        ...current,
        useful_links: nextLinks,
      };
    });
  };

  const handleScoreFieldChange = (
    scoreType: "operational_capacity_scores" | "strategic_potential_scores",
    key: string,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [scoreType]: {
        ...current[scoreType],
        [key]: normalizeScoreInput(value),
      },
    }));
  };

  const handleSavePlatform = async () => {
    if (!form.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome da plataforma para continuar.",
        variant: "destructive",
      });
      return;
    }

    const usefulLinksPayload = form.useful_links
      .map((link) => ({
        label: link.label.trim(),
        url: normalizeUrl(link.url),
      }))
      .filter((link) => Boolean(link.label) && Boolean(link.url))
      .slice(0, MAX_PLATFORM_USEFUL_LINKS);

    const slug = createSlug(form.name) || `plataforma-${Date.now()}`;
    const normalizedLogo = form.client_logo_url.trim() ? normalizeUrl(form.client_logo_url) : null;
    const normalizedForum = form.forum_url.trim() ? normalizeUrl(form.forum_url) : null;
    const normalizedRequestForm = form.request_form_url.trim()
      ? normalizeUrl(form.request_form_url)
      : null;

    const platformPayload = {
      name: form.name.trim(),
      slug,
      category: form.category.trim() || "Geral",
      status: form.status.trim() || "Ativa",
      client_logo_url: normalizedLogo,
      short_description: form.short_description.trim() || null,
      general_description: form.general_description.trim() || null,
      gtm_maturity: form.gtm_maturity.trim() || null,
      icp_recommended: form.icp_recommended.trim() || null,
      practical_applications: form.practical_applications.trim() || null,
      benefits_and_advantages: form.benefits_and_advantages.trim() || null,
      client_benefits: form.client_benefits.trim() || null,
      unit_benefits: form.unit_benefits.trim() || null,
      partnership_regulations: form.partnership_regulations.trim() || null,
      base_pricing: form.base_pricing.trim() || null,
      commission_and_invoicing: form.commission_and_invoicing.trim() || null,
      how_to_hire: form.how_to_hire.trim() || null,
      technical_commercial_support: form.technical_commercial_support.trim() || null,
      forum_url: normalizedForum,
      request_form_url: normalizedRequestForm,
      useful_links: usefulLinksPayload,
      operational_capacity_scores: form.operational_capacity_scores,
      strategic_potential_scores: form.strategic_potential_scores,
    } as const;

    try {
      let error;

      if (editingPlatform) {
        const { error: updateError } = await supabase
          .from("platforms")
          .update(platformPayload)
          .eq("id", editingPlatform.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("platforms")
          .insert([platformPayload]);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: editingPlatform ? "Plataforma atualizada" : "Plataforma criada",
      });

      setIsDialogOpen(false);
      resetForm();
      fetchPlatforms();
    } catch (error) {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "Erro ao salvar plataforma.";

      console.error("Erro ao salvar plataforma:", error);
      toast({
        title: "Erro ao salvar plataforma",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeletePlatform = async (platformId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta plataforma?")) return;

    try {
      const { error } = await supabase.from("platforms").delete().eq("id", platformId);
      if (error) throw error;

      toast({ title: "Plataforma excluída" });
      fetchPlatforms();
    } catch (error) {
      console.error("Erro ao excluir plataforma:", error);
      toast({
        title: "Erro ao excluir plataforma",
        variant: "destructive",
      });
    }
  };

  const handleLogoPreviewError = (platformId: string) => {
    setLogoPreviewErrorByPlatform((current) => ({
      ...current,
      [platformId]: true,
    }));
  };

  const handleSaveStackDigitalRequestFormUrl = async () => {
    const trimmedLink = stackDigitalRequestFormUrl.trim();

    if (!trimmedLink) {
      toast({
        title: "Link obrigatório",
        description: "Informe o link geral de solicitação para salvar.",
        variant: "destructive",
      });
      return;
    }

    const normalizedLink = normalizeUrl(trimmedLink);
    setSavingStackDigitalRequestFormUrl(true);

    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert(
          {
            setting_key: stackDigitalRequestFormSettingKey,
            setting_value: normalizedLink,
            description: "Link geral do botão Solicitar Contratação da Stack Digital",
          },
          { onConflict: "setting_key" }
        );

      if (error) throw error;

      setStackDigitalRequestFormUrl(normalizedLink);
      toast({ title: "Link geral da Stack Digital atualizado" });
    } catch (error) {
      console.error("Erro ao salvar link geral da Stack Digital:", error);
      toast({
        title: "Erro ao salvar link geral",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setSavingStackDigitalRequestFormUrl(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Stack Digital</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Plataforma
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPlatform ? "Editar plataforma" : "Nova plataforma"}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 pt-2">
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Informações Básicas
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="platform-name">Nome da Plataforma</Label>
                      <Input
                        id="platform-name"
                        value={form.name}
                        onChange={(event) => handleFieldChange("name", event.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="platform-logo">Logo do Cliente (URL)</Label>
                      <Input
                        id="platform-logo"
                        placeholder="https://..."
                        value={form.client_logo_url}
                        onChange={(event) => handleFieldChange("client_logo_url", event.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="platform-category">Categoria</Label>
                      <Input
                        id="platform-category"
                        value={form.category}
                        onChange={(event) => handleFieldChange("category", event.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="platform-status">Status</Label>
                      <Input
                        id="platform-status"
                        value={form.status}
                        onChange={(event) => handleFieldChange("status", event.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="platform-short-description">Descrição Curta do Card</Label>
                    <Textarea
                      id="platform-short-description"
                      rows={3}
                      value={form.short_description}
                      onChange={(event) => handleFieldChange("short_description", event.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="platform-gtm-maturity">Maturidade de GTM</Label>
                    <Input
                      id="platform-gtm-maturity"
                      value={form.gtm_maturity}
                      onChange={(event) => handleFieldChange("gtm_maturity", event.target.value)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="platform-forum-url">Fórum da Plataforma (Google Chat)</Label>
                      <Input
                        id="platform-forum-url"
                        placeholder="https://..."
                        value={form.forum_url}
                        onChange={(event) => handleFieldChange("forum_url", event.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="platform-request-form-url">Formulário de Solicitação de Contratação</Label>
                      <Input
                        id="platform-request-form-url"
                        placeholder="https://..."
                        value={form.request_form_url}
                        onChange={(event) =>
                          handleFieldChange("request_form_url", event.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="platform-general-description">Descrição Geral da Plataforma</Label>
                    <Textarea
                      id="platform-general-description"
                      rows={4}
                      value={form.general_description}
                      onChange={(event) => handleFieldChange("general_description", event.target.value)}
                    />
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Para Que e Quem Serve
                  </h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="platform-icp">ICP Recomendado</Label>
                      <Textarea
                        id="platform-icp"
                        rows={4}
                        value={form.icp_recommended}
                        onChange={(event) => handleFieldChange("icp_recommended", event.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="platform-practical-applications">Aplicações Práticas</Label>
                      <Textarea
                        id="platform-practical-applications"
                        rows={4}
                        value={form.practical_applications}
                        onChange={(event) =>
                          handleFieldChange("practical_applications", event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="platform-benefits-advantages">Benefícios e Vantagens</Label>
                      <Textarea
                        id="platform-benefits-advantages"
                        rows={4}
                        value={form.benefits_and_advantages}
                        onChange={(event) =>
                          handleFieldChange("benefits_and_advantages", event.target.value)
                        }
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Negociação e Parceria
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="platform-client-benefits">Benefício para o Cliente</Label>
                      <Textarea
                        id="platform-client-benefits"
                        rows={4}
                        value={form.client_benefits}
                        onChange={(event) => handleFieldChange("client_benefits", event.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="platform-unit-benefits">Benefício para a Unidade</Label>
                      <Textarea
                        id="platform-unit-benefits"
                        rows={4}
                        value={form.unit_benefits}
                        onChange={(event) => handleFieldChange("unit_benefits", event.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="platform-regulations">Regulamentos da Parceria</Label>
                      <Textarea
                        id="platform-regulations"
                        rows={4}
                        value={form.partnership_regulations}
                        onChange={(event) =>
                          handleFieldChange("partnership_regulations", event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="platform-base-pricing">Precificação Base</Label>
                      <Textarea
                        id="platform-base-pricing"
                        rows={4}
                        value={form.base_pricing}
                        onChange={(event) => handleFieldChange("base_pricing", event.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="platform-commission">Comissionamento e Notas Fiscais</Label>
                      <Textarea
                        id="platform-commission"
                        rows={4}
                        value={form.commission_and_invoicing}
                        onChange={(event) =>
                          handleFieldChange("commission_and_invoicing", event.target.value)
                        }
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Contratação e Suporte
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="platform-how-to-hire">Como Contratar</Label>
                      <Textarea
                        id="platform-how-to-hire"
                        rows={4}
                        value={form.how_to_hire}
                        onChange={(event) => handleFieldChange("how_to_hire", event.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="platform-support">Suporte Técnico e Comercial</Label>
                      <Textarea
                        id="platform-support"
                        rows={4}
                        value={form.technical_commercial_support}
                        onChange={(event) =>
                          handleFieldChange("technical_commercial_support", event.target.value)
                        }
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Links Úteis (até 6)
                  </h3>

                  <div className="space-y-3">
                    {form.useful_links.map((link, index) => (
                      <div key={`platform-link-${index}`} className="grid gap-2 md:grid-cols-2">
                        <Input
                          placeholder={`Título do link ${index + 1}`}
                          value={link.label}
                          onChange={(event) =>
                            handleLinkFieldChange(index, "label", event.target.value)
                          }
                        />
                        <Input
                          placeholder={`URL do link ${index + 1}`}
                          value={link.url}
                          onChange={(event) => handleLinkFieldChange(index, "url", event.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Complexidade Operacional e Potencial Estratégico (0 a 5)
                  </h3>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="border-border/70">
                      <CardHeader>
                        <CardTitle className="text-base">Capacidade Operacional</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {operationalCapacityCriteria.map((criterion) => (
                          <div key={criterion.key} className="grid gap-1">
                            <Label htmlFor={`operational-${criterion.key}`}>{criterion.title}</Label>
                            <Input
                              id={`operational-${criterion.key}`}
                              type="number"
                              min={0}
                              max={5}
                              step={1}
                              value={String(form.operational_capacity_scores[criterion.key] ?? 0)}
                              onChange={(event) =>
                                handleScoreFieldChange(
                                  "operational_capacity_scores",
                                  criterion.key,
                                  event.target.value
                                )
                              }
                            />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-border/70">
                      <CardHeader>
                        <CardTitle className="text-base">Potencial Estratégico</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {strategicPotentialCriteria.map((criterion) => (
                          <div key={criterion.key} className="grid gap-1">
                            <Label htmlFor={`strategic-${criterion.key}`}>{criterion.title}</Label>
                            <Input
                              id={`strategic-${criterion.key}`}
                              type="number"
                              min={0}
                              max={5}
                              step={1}
                              value={String(form.strategic_potential_scores[criterion.key] ?? 0)}
                              onChange={(event) =>
                                handleScoreFieldChange(
                                  "strategic_potential_scores",
                                  criterion.key,
                                  event.target.value
                                )
                              }
                            />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSavePlatform}>{editingPlatform ? "Atualizar" : "Criar"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="stack-digital-request-form-url">Link geral do botão de contratação</Label>
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <Input
                id="stack-digital-request-form-url"
                placeholder="https://..."
                value={stackDigitalRequestFormUrl}
                onChange={(event) => setStackDigitalRequestFormUrl(event.target.value)}
                disabled={loadingStackDigitalRequestFormUrl || savingStackDigitalRequestFormUrl}
              />
              <Button
                onClick={handleSaveStackDigitalRequestFormUrl}
                disabled={loadingStackDigitalRequestFormUrl || savingStackDigitalRequestFormUrl}
                className="h-10 rounded-xl px-5"
              >
                Salvar link
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Esse link alimenta o botão &quot;Solicitar Contratação&quot; no topo da página principal da Stack Digital.
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="platform-search">Buscar na Stack Digital</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="platform-search"
              className="pl-10"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nome, categoria ou descrição..."
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-lg border border-border/70 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Carregando itens da Stack Digital...
          </div>
        ) : filteredPlatforms.length === 0 ? (
          <div className="rounded-lg border border-border/70 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Nenhum item da Stack Digital cadastrado até o momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredPlatforms.map((platform) => (
              <Card key={platform.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-muted/30">
                        {platform.client_logo_url && !logoPreviewErrorByPlatform[platform.id] ? (
                          <img
                            src={platform.client_logo_url}
                            alt={`Logo de ${platform.name}`}
                            className="h-full w-full object-contain"
                            onError={() => handleLogoPreviewError(platform.id)}
                          />
                        ) : (
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-foreground">{platform.name}</h3>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge variant="secondary">{platform.category || "Geral"}</Badge>
                          <Badge variant="outline">{platform.status || "Ativa"}</Badge>
                        </div>
                      </div>
                    </div>

                    {platform.short_description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">{platform.short_description}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(platform)}
                      title="Editar plataforma"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePlatform(platform.id)}
                      title="Excluir plataforma"
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
  );
};

export default PlatformManagementTab;
