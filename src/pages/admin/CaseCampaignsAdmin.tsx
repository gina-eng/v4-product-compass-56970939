import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  campaignStatus,
  countCasesByCampaign,
  createCampaign,
  deleteCampaign,
  formatCampaignDate,
  listCampaigns,
  setCampaignArchived,
  updateCampaign,
  type CampaignStatus,
  type CaseCampaign,
  type CaseCampaignInput,
} from "@/features/campaigns/storage";
import { Archive, ArchiveRestore, Check, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Paleta fixa: classes estáticas para o Tailwind gerar as cores dos swatches.
const COLOR_PRESETS: { value: string; label: string; className: string }[] = [
  { value: "#9F1239", label: "Bordô", className: "bg-[#9F1239]" },
  { value: "#EA580C", label: "Laranja", className: "bg-[#EA580C]" },
  { value: "#CA8A04", label: "Amarelo", className: "bg-[#CA8A04]" },
  { value: "#16A34A", label: "Verde", className: "bg-[#16A34A]" },
  { value: "#0891B2", label: "Ciano", className: "bg-[#0891B2]" },
  { value: "#2563EB", label: "Azul", className: "bg-[#2563EB]" },
  { value: "#7C3AED", label: "Roxo", className: "bg-[#7C3AED]" },
  { value: "#111827", label: "Preto", className: "bg-[#111827]" },
];

const STATUS_META: Record<CampaignStatus, { label: string; className: string }> = {
  vigente: { label: "Vigente", className: "border-ter/40 bg-ter/10 text-ter" },
  agendada: { label: "Agendada", className: "border-primary/30 bg-primary/5 text-primary" },
  encerrada: { label: "Encerrada", className: "border-border bg-muted text-muted-foreground" },
  arquivada: {
    label: "Arquivada",
    className: "border-dashed border-border bg-background text-muted-foreground",
  },
};

const emptyForm: CaseCampaignInput = {
  name: "",
  description: "",
  color: "",
  startsAt: "",
  endsAt: "",
};

const toForm = (c: CaseCampaign): CaseCampaignInput => ({
  name: c.name,
  description: c.description,
  color: c.color,
  startsAt: c.startsAt,
  endsAt: c.endsAt,
});

// Mensagem amigável para erros conhecidos do Postgres; cai na mensagem crua nos demais.
const friendlyError = (err: unknown): string => {
  const code = (err as { code?: string } | null)?.code;
  if (code === "23505") return "Já existe uma campanha com esse nome.";
  if (code === "23503")
    return "Campanhas com cases vinculados não podem ser excluídas — arquive.";
  return err instanceof Error ? err.message : (err as { message?: string })?.message ?? "";
};

const CampaignFormFields = ({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string;
  value: CaseCampaignInput;
  onChange: (next: CaseCampaignInput) => void;
}) => (
  <div className="grid gap-4 sm:grid-cols-2">
    <div className="space-y-1.5 sm:col-span-2">
      <Label htmlFor={`${idPrefix}-name`}>
        Nome <span className="text-primary">*</span>
      </Label>
      <Input
        id={`${idPrefix}-name`}
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        placeholder="Ex.: Black Friday 2026"
      />
    </div>
    <div className="space-y-1.5 sm:col-span-2">
      <Label htmlFor={`${idPrefix}-description`}>Descrição</Label>
      <Textarea
        id={`${idPrefix}-description`}
        rows={2}
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        placeholder="Que tipo de case entra nesta campanha?"
      />
    </div>
    <div className="space-y-1.5">
      <Label htmlFor={`${idPrefix}-starts`}>
        Início <span className="text-primary">*</span>
      </Label>
      <Input
        id={`${idPrefix}-starts`}
        type="date"
        value={value.startsAt}
        onChange={(e) => onChange({ ...value, startsAt: e.target.value })}
      />
    </div>
    <div className="space-y-1.5">
      <Label htmlFor={`${idPrefix}-ends`}>
        Fim <span className="text-primary">*</span>
      </Label>
      <Input
        id={`${idPrefix}-ends`}
        type="date"
        value={value.endsAt}
        min={value.startsAt || undefined}
        onChange={(e) => onChange({ ...value, endsAt: e.target.value })}
      />
    </div>
    <div className="space-y-1.5 sm:col-span-2">
      <span className="text-sm font-medium leading-none" id={`${idPrefix}-color-label`}>
        Cor
      </span>
      <div
        className="flex flex-wrap items-center gap-2"
        role="radiogroup"
        aria-labelledby={`${idPrefix}-color-label`}
      >
        <button
          type="button"
          role="radio"
          aria-checked={!value.color}
          onClick={() => onChange({ ...value, color: "" })}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs transition-all",
            !value.color
              ? "border-primary/60 bg-primary/5 font-semibold"
              : "border-border/70 bg-background text-muted-foreground hover:border-primary/40",
          )}
        >
          Sem cor
        </button>
        {COLOR_PRESETS.map((preset) => {
          const selected = value.color.toLowerCase() === preset.value.toLowerCase();
          return (
            <button
              type="button"
              key={preset.value}
              role="radio"
              aria-checked={selected}
              aria-label={preset.label}
              title={preset.label}
              onClick={() => onChange({ ...value, color: preset.value })}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all",
                preset.className,
                selected ? "border-foreground ring-2 ring-primary/30" : "border-transparent",
              )}
            >
              {selected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

const CaseCampaignsAdmin = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<CaseCampaign[]>([]);
  const [caseCounts, setCaseCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [newCampaign, setNewCampaign] = useState<CaseCampaignInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<CaseCampaign | null>(null);
  const [editingForm, setEditingForm] = useState<CaseCampaignInput>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<CaseCampaign | null>(null);

  const refresh = async () => {
    setLoading(true);
    const [list, counts] = await Promise.all([listCampaigns(), countCasesByCampaign()]);
    setCampaigns(list);
    setCaseCounts(counts);
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  // Retorna a mensagem de erro (ou null se ok) para exibir em toast.
  const validateForm = (form: CaseCampaignInput): string | null => {
    if (!form.name.trim()) return "Informe o nome da campanha.";
    if (!form.startsAt || !form.endsAt) return "Informe as datas de início e fim.";
    if (form.endsAt < form.startsAt) return "A data de fim precisa ser igual ou posterior ao início.";
    return null;
  };

  const handleCreate = async () => {
    const problem = validateForm(newCampaign);
    if (problem) {
      toast({ variant: "destructive", title: "Revise a campanha", description: problem });
      return;
    }
    setSaving(true);
    try {
      await createCampaign(newCampaign);
      setNewCampaign(emptyForm);
      await refresh();
      toast({ title: "Campanha criada" });
    } catch (err) {
      toast({ variant: "destructive", title: "Erro ao criar", description: friendlyError(err) });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (c: CaseCampaign) => {
    setEditing(c);
    setEditingForm(toForm(c));
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    const problem = validateForm(editingForm);
    if (problem) {
      toast({ variant: "destructive", title: "Revise a campanha", description: problem });
      return;
    }
    setSaving(true);
    try {
      await updateCampaign(editing.id, editingForm);
      setEditing(null);
      await refresh();
      toast({ title: "Campanha atualizada" });
    } catch (err) {
      toast({ variant: "destructive", title: "Erro ao atualizar", description: friendlyError(err) });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleArchive = async (c: CaseCampaign) => {
    const archive = !c.archivedAt;
    try {
      await setCampaignArchived(c.id, archive);
      await refresh();
      toast({ title: archive ? "Campanha arquivada" : "Campanha desarquivada" });
    } catch (err) {
      toast({ variant: "destructive", title: "Erro ao atualizar", description: friendlyError(err) });
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteCampaign(pendingDelete.id);
      setPendingDelete(null);
      await refresh();
      toast({ title: "Campanha excluída" });
    } catch (err) {
      setPendingDelete(null);
      toast({ variant: "destructive", title: "Erro ao excluir", description: friendlyError(err) });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-5xl space-y-6 py-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Campanhas especiais</h1>
          <p className="text-sm text-muted-foreground">
            Campanhas (ex.: Black Friday) para marcar cases. Cada campanha só aparece no formulário
            de cases durante o seu período — se precisar coletar cases atrasados, estenda a data de
            fim. Campanhas arquivadas somem do formulário, mas os cases vinculados continuam
            marcados.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nova campanha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CampaignFormFields idPrefix="new-campaign" value={newCampaign} onChange={setNewCampaign} />
            <div className="flex justify-end">
              <Button onClick={() => void handleCreate()} disabled={saving}>
                <Plus className="mr-1.5 h-4 w-4" /> Criar campanha
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Campanhas cadastradas ({campaigns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : campaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma campanha cadastrada ainda.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Cases</TableHead>
                    <TableHead className="w-36 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => {
                    const status = STATUS_META[campaignStatus(c)];
                    const count = caseCounts[c.id] ?? 0;
                    const canDelete = count === 0;
                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full bg-muted-foreground/30"
                              // Cor salva pelo admin — valor dinâmico.
                              style={c.color ? { backgroundColor: c.color } : undefined}
                              aria-hidden
                            />
                            <div className="min-w-0">
                              <p className="font-medium">{c.name}</p>
                              {c.description && (
                                <p className="line-clamp-1 text-xs text-muted-foreground">
                                  {c.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {formatCampaignDate(c.startsAt)} – {formatCampaignDate(c.endsAt)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold",
                              status.className,
                            )}
                          >
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{count}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(c)}
                              aria-label={`Editar ${c.name}`}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => void handleToggleArchive(c)}
                              aria-label={c.archivedAt ? `Desarquivar ${c.name}` : `Arquivar ${c.name}`}
                              title={c.archivedAt ? "Desarquivar" : "Arquivar"}
                            >
                              {c.archivedAt ? (
                                <ArchiveRestore className="h-4 w-4" />
                              ) : (
                                <Archive className="h-4 w-4" />
                              )}
                            </Button>
                            {/* span segura o title: botão desabilitado não recebe hover. */}
                            <span
                              title={
                                canDelete
                                  ? "Excluir"
                                  : "Campanhas com cases vinculados não podem ser excluídas — arquive."
                              }
                            >
                              <Button
                                size="icon"
                                variant="ghost"
                                disabled={!canDelete}
                                onClick={() => setPendingDelete(c)}
                                aria-label={`Excluir ${c.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar campanha</DialogTitle>
            <DialogDescription>
              Estender a data de fim reabre a campanha no formulário de cases.
            </DialogDescription>
          </DialogHeader>
          <CampaignFormFields idPrefix="edit-campaign" value={editingForm} onChange={setEditingForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={() => void handleSaveEdit()} disabled={saving}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir campanha?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.name}" será excluída permanentemente. Nenhum case está vinculado a
              ela.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default CaseCampaignsAdmin;
