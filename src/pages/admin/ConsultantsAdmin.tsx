import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Pencil,
  Plus,
  
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import {
  deleteConsultant,
  listConsultants,
} from "@/features/consultants/storage";
import type { Consultant } from "@/features/consultants/types";

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const ConsultantsAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Consultant | null>(null);

  const refresh = async () => {
    const list = await listConsultants();
    setConsultants(list);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return consultants;
    return consultants.filter((c) =>
      [
        c.name,
        c.headline,
        c.primarySector,
        c.secondarySector ?? "",
        c.unit ?? "",
        c.city,
        c.state,
        c.email,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [consultants, search]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteConsultant(pendingDelete.id);
      toast({ title: "Consultor removido", description: pendingDelete.name });
      setPendingDelete(null);
      await refresh();
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao remover consultor",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <section className="space-y-6 animate-fade-in">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
          <Link to="/admin">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Área administrativa
          </Link>
        </Button>

        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
              <Users className="h-3 w-3" /> Admin
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Consultores Certificados
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Cadastre, edite e remova consultores. Os dados ficam disponíveis em
              /consultores para todos os usuários autenticados.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link to="/admin/consultores/novo">
                <Plus className="mr-1.5 h-4 w-4" /> Novo consultor
              </Link>
            </Button>
          </div>
        </header>

        <div className="rounded-2xl border border-border/70 bg-card p-3 shadow-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, unidade, setor, cidade…"
              className="pl-9"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "consultor cadastrado" : "consultores cadastrados"}
        </p>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {search
                    ? "Nenhum consultor encontrado"
                    : "Nenhum consultor cadastrado"}
                </h3>
                <p className="max-w-md text-xs text-muted-foreground">
                  {search
                    ? "Tente outro termo de busca."
                    : "Cadastre o primeiro consultor para que ele apareça em /consultores."}
                </p>
              </div>
              {!search && (
                <Button asChild size="sm">
                  <Link to="/admin/consultores/novo">
                    <Plus className="mr-1.5 h-4 w-4" /> Cadastrar consultor
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <Card key={c.id} className="border-border/70">
                <CardContent className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-primary/10">
                    {c.photoUrl ? (
                      <img
                        src={c.photoUrl}
                        alt={c.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
                        {initialsOf(c.name)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <h3 className="truncate text-sm font-semibold text-foreground">
                        {c.name}
                      </h3>
                      {c.unit && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Building2 className="h-3 w-3" /> {c.unit}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.headline}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {c.primarySector}
                      {c.secondarySector ? ` · ${c.secondarySector}` : ""} ·{" "}
                      {c.city}/{c.state}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 md:flex-nowrap">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs"
                    >
                      <Link to={`/consultores/${c.id}`}>
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Ver
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs"
                      onClick={() => navigate(`/admin/consultores/${c.id}/editar`)}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setPendingDelete(c)}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir consultor?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete &&
                `O cadastro de "${pendingDelete.name}" será removido permanentemente. Essa ação não pode ser desfeita.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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

export default ConsultantsAdmin;
