import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SECTORS } from "@/features/consultants/options";
import {
  getConsultant,
  upsertConsultant,
} from "@/features/consultants/storage";
import type { Consultant } from "@/features/consultants/types";

const EMPTY: Consultant = {
  id: "",
  name: "",
  headline: "",
  city: "",
  state: "",
  email: "",
  linkedinUrl: "",
  photoUrl: "",
  unit: "",
  primarySector: "",
  secondarySector: "",
  professionalProfile: "",
  painsTackled: "",
  valueAreas: "",
  highlightProjects: "",
  competencies: "",
  education: "",
  languages: "",
};

const REQUIRED_FIELDS: { key: keyof Consultant; label: string }[] = [
  { key: "name", label: "Nome" },
  { key: "headline", label: "Especialidade" },
  { key: "city", label: "Cidade" },
  { key: "state", label: "Estado" },
  { key: "email", label: "E-mail" },
  { key: "linkedinUrl", label: "LinkedIn" },
  { key: "photoUrl", label: "URL da foto" },
  { key: "unit", label: "Unidade" },
  { key: "primarySector", label: "Setor principal" },
  { key: "secondarySector", label: "Setor complementar" },
  { key: "professionalProfile", label: "Perfil profissional" },
  { key: "painsTackled", label: "Dores que sei atacar" },
  { key: "valueAreas", label: "Áreas onde mais gero valor" },
  { key: "highlightProjects", label: "Projetos destaque" },
  { key: "competencies", label: "Competências" },
  { key: "education", label: "Formação" },
  { key: "languages", label: "Idiomas" },
];

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const isValidUrl = (s: string) => {
  try {
    new URL(s.trim());
    return true;
  } catch {
    return false;
  }
};

const Field = ({
  label,
  required,
  children,
  hint,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
  error?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold">
      {label}
      {required && <span className="ml-1 text-destructive">*</span>}
    </Label>
    {children}
    {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}
  </div>
);

const ConsultantFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<Consultant>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Consultant, string>>>({});

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      const existing = await getConsultant(id);
      if (cancelled) return;
      if (existing) {
        setForm({
          ...EMPTY,
          ...existing,
          unit: existing.unit ?? "",
          secondarySector: existing.secondarySector ?? "",
          photoUrl: existing.photoUrl ?? "",
        });
      } else {
        toast({
          title: "Consultor não encontrado",
          description: "Voltando para a lista.",
          variant: "destructive",
        });
        navigate("/admin/consultores");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate, toast]);

  const update = <K extends keyof Consultant>(key: K, value: Consultant[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof Consultant, string>> = {};
    for (const { key, label } of REQUIRED_FIELDS) {
      const value = (form[key] ?? "") as string;
      if (!value.trim()) next[key] = `${label} é obrigatório`;
    }
    if (form.email.trim() && !isValidEmail(form.email)) {
      next.email = "E-mail inválido";
    }
    if (form.linkedinUrl.trim() && !isValidUrl(form.linkedinUrl)) {
      next.linkedinUrl = "URL inválida";
    }
    if ((form.photoUrl ?? "").trim() && !isValidUrl(form.photoUrl ?? "")) {
      next.photoUrl = "URL inválida";
    }
    if (
      form.primarySector &&
      form.secondarySector &&
      form.primarySector === form.secondarySector
    ) {
      next.secondarySector =
        "Setor complementar deve ser diferente do setor principal";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        title: "Verifique os campos obrigatórios",
        description: "Há campos vazios ou inválidos no formulário.",
        variant: "destructive",
      });
      return;
    }
    try {
      const saved = await upsertConsultant({
        ...form,
        unit: form.unit?.trim() || undefined,
        secondarySector: form.secondarySector?.trim() || undefined,
        photoUrl: form.photoUrl?.trim() || undefined,
      });
      toast({
        title: isEdit ? "Consultor atualizado" : "Consultor cadastrado",
        description: saved.name,
      });
      navigate("/admin/consultores");
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao salvar consultor",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const photoPreview = useMemo(() => {
    const url = (form.photoUrl ?? "").trim();
    return url && isValidUrl(url) ? url : null;
  }, [form.photoUrl]);

  return (
    <Layout>
      <section className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
            <Link to="/admin/consultores">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Consultores · Admin
            </Link>
          </Button>
        </div>

        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isEdit ? "Editar consultor" : "Novo consultor"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Todos os campos marcados com <span className="text-destructive">*</span> são
            obrigatórios.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.06em] text-primary">
                Identidade
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome completo" required error={errors.name}>
                  <Input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Vinicius Scarabello"
                  />
                </Field>

                <Field label="Especialidade" required error={errors.headline}>
                  <Input
                    value={form.headline}
                    onChange={(e) => update("headline", e.target.value)}
                    placeholder="Especialista em Qualidade, Processos…"
                  />
                </Field>

                <Field
                  label="URL da foto"
                  required
                  error={errors.photoUrl}
                  hint="Cole o link público da imagem (ex.: hosted no Drive público, S3 ou Imgur)."
                >
                  <Input
                    value={form.photoUrl ?? ""}
                    onChange={(e) => update("photoUrl", e.target.value)}
                    placeholder="https://…"
                  />
                </Field>

                <Field label="Unidade" required error={errors.unit}>
                  <Input
                    value={form.unit ?? ""}
                    onChange={(e) => update("unit", e.target.value)}
                    placeholder="V4 Jundiaí"
                  />
                </Field>

                <Field label="Cidade" required error={errors.city}>
                  <Input
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Jundiaí"
                  />
                </Field>

                <Field label="Estado (UF)" required error={errors.state}>
                  <Input
                    value={form.state}
                    onChange={(e) => update("state", e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="SP"
                    maxLength={2}
                  />
                </Field>

                <Field label="E-mail" required error={errors.email}>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="nome@empresa.com"
                  />
                </Field>


                <Field
                  label="URL do LinkedIn"
                  required
                  error={errors.linkedinUrl}
                >
                  <Input
                    value={form.linkedinUrl}
                    onChange={(e) => update("linkedinUrl", e.target.value)}
                    placeholder="https://linkedin.com/in/usuario"
                  />
                </Field>
              </div>

              {photoPreview && (
                <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                  <div className="aspect-[3/4] w-20 overflow-hidden rounded-md border border-border/50 bg-background">
                    <img
                      src={photoPreview}
                      alt="Pré-visualização"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pré-visualização da foto.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.06em] text-primary">
                Setor de atuação
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Setor principal" required error={errors.primarySector}>
                  <Select
                    value={form.primarySector}
                    onValueChange={(v) => update("primarySector", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o setor principal" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {SECTORS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  label="Setor complementar"
                  required
                  error={errors.secondarySector}
                >
                  <Select
                    value={form.secondarySector ?? ""}
                    onValueChange={(v) => update("secondarySector", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o setor complementar" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {SECTORS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.06em] text-primary">
                Conteúdo do CV
              </h2>

              <Field
                label="Perfil profissional"
                required
                error={errors.professionalProfile}
                hint="Texto corrido em parágrafos. Pode ter quantos quiser."
              >
                <Textarea
                  rows={6}
                  value={form.professionalProfile}
                  onChange={(e) => update("professionalProfile", e.target.value)}
                  placeholder="Com X anos de experiência…"
                />
              </Field>

              <Field
                label="Dores que sei atacar"
                required
                error={errors.painsTackled}
                hint="Use bullets (* ou -) para virar lista; texto corrido vira parágrafo."
              >
                <Textarea
                  rows={6}
                  value={form.painsTackled}
                  onChange={(e) => update("painsTackled", e.target.value)}
                  placeholder={"* Falta de padronização\n* Baixa utilização de dados…"}
                />
              </Field>

              <Field
                label="Áreas onde mais gero valor"
                required
                error={errors.valueAreas}
                hint="Use bullets (* ou -) para virar lista."
              >
                <Textarea
                  rows={6}
                  value={form.valueAreas}
                  onChange={(e) => update("valueAreas", e.target.value)}
                  placeholder={"* Análise de não conformidades\n* Implementação de planos…"}
                />
              </Field>

              <Field
                label="Projetos destaque"
                required
                error={errors.highlightProjects}
                hint="Pode adicionar um ou múltiplos cases. Use linhas em branco para separar."
              >
                <Textarea
                  rows={10}
                  value={form.highlightProjects}
                  onChange={(e) => update("highlightProjects", e.target.value)}
                  placeholder={
                    "Case 1 — Título\n\nProblema: …\n\nSolução entregue: …\n\nResultado: …"
                  }
                />
              </Field>

              <Field
                label="Competências e áreas de atuação"
                required
                error={errors.competencies}
                hint="Uma competência por linha (ou bullets)."
              >
                <Textarea
                  rows={8}
                  value={form.competencies}
                  onChange={(e) => update("competencies", e.target.value)}
                  placeholder={"Estratégia Corporativa\nPlanejamento Financeiro…"}
                />
              </Field>

              <Field
                label="Formação"
                required
                error={errors.education}
                hint="Uma formação por linha (ou bullets)."
              >
                <Textarea
                  rows={5}
                  value={form.education}
                  onChange={(e) => update("education", e.target.value)}
                  placeholder={"* Engenheiro de Produção — UNIP\n* MBA — FGV"}
                />
              </Field>

              <Field
                label="Idiomas"
                required
                error={errors.languages}
                hint="Um idioma por linha. Ex.: Português — Nativo"
              >
                <Textarea
                  rows={4}
                  value={form.languages}
                  onChange={(e) => update("languages", e.target.value)}
                  placeholder={"Português — Nativo\nInglês — Fluente"}
                />
              </Field>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-2">
            <Button asChild variant="outline">
              <Link to="/admin/consultores">Cancelar</Link>
            </Button>
            <Button type="submit">
              <Save className="mr-1.5 h-4 w-4" />
              {isEdit ? "Salvar alterações" : "Cadastrar consultor"}
            </Button>
          </div>
        </form>
      </section>
    </Layout>
  );
};

export default ConsultantFormPage;
