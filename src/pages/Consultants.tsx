import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Building2, Filter, MapPin, Search, Sparkles, X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listConsultants } from "@/features/consultants/storage";
import { SECTORS } from "@/features/consultants/options";
import type { Consultant } from "@/features/consultants/types";

const ALL = "__all__";

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const ConsultantCard = ({
  consultant,
  onOpen,
}: {
  consultant: Consultant;
  onOpen: () => void;
}) => {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKey}
      className="group cursor-pointer overflow-hidden border-border/80 bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-muted">
        {consultant.photoUrl ? (
          <img
            src={consultant.photoUrl}
            alt={consultant.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary">
            {initialsOf(consultant.name)}
          </div>
        )}
        <span className="absolute right-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-full border border-white/50 bg-rose-300/35 px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_4px_12px_-2px_rgba(244,63,94,0.35)] ring-1 ring-inset ring-white/20 backdrop-blur-md backdrop-saturate-150">
          <Briefcase className="h-3 w-3 shrink-0" />
          <span className="truncate">{consultant.primarySector}</span>
        </span>
      </div>

      <CardContent className="flex flex-col gap-2 p-4">
        <h3 className="truncate text-base font-semibold text-foreground">
          {consultant.name}
        </h3>

        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
          {consultant.headline}
        </p>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {consultant.city}/{consultant.state}
          </span>
        </div>

        {consultant.unit && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{consultant.unit}</span>
          </div>
        )}

        {consultant.competencies && (
          <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground/90">
            {(() => {
              const items = consultant.competencies
                .split(/\n|·/)
                .map((s) => s.replace(/^[\s*\-•]+/, "").trim())
                .filter(Boolean);
              const visible = items.slice(0, 2).join(" · ");
              const remaining = Math.max(0, items.length - 2);
              return (
                <>
                  {visible}
                  {remaining > 0 && (
                    <span className="text-primary"> · +{remaining}</span>
                  )}
                </>
              );
            })()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const Consultants = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>(ALL);
  const [unitFilter, setUnitFilter] = useState<string>(ALL);
  const [cityFilter, setCityFilter] = useState<string>(ALL);
  const [consultants, setConsultants] = useState<Consultant[]>([]);

  useEffect(() => {
    void listConsultants().then(setConsultants);
  }, []);

  const unitOptions = useMemo(() => {
    const set = new Set<string>();
    consultants.forEach((c) => {
      if (c.unit) set.add(c.unit);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [consultants]);

  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    consultants.forEach((c) => {
      if (c.city) set.add(`${c.city}/${c.state}`);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [consultants]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return consultants.filter((c) => {
      if (
        sectorFilter !== ALL &&
        c.primarySector !== sectorFilter &&
        c.secondarySector !== sectorFilter
      )
        return false;
      if (unitFilter !== ALL && c.unit !== unitFilter) return false;
      if (cityFilter !== ALL && `${c.city}/${c.state}` !== cityFilter) return false;
      if (!term) return true;
      const haystack = [
        c.name,
        c.headline,
        c.primarySector,
        c.secondarySector ?? "",
        c.city,
        c.state,
        c.unit ?? "",
        c.competencies,
        c.painsTackled,
        c.valueAreas,
        c.professionalProfile,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [consultants, search, sectorFilter, unitFilter, cityFilter]);

  const hasActiveFilters =
    Boolean(search) ||
    sectorFilter !== ALL ||
    unitFilter !== ALL ||
    cityFilter !== ALL;

  const clearFilters = () => {
    setSearch("");
    setSectorFilter(ALL);
    setUnitFilter(ALL);
    setCityFilter(ALL);
  };

  return (
    <Layout>
      <section className="space-y-8 animate-fade-in">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3 w-3" /> Rede V4
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Consultores Certificados
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Banco de consultores credenciados pela rede. Filtre por setor ou busque por
            competência, cidade ou nome — clique no card para ver o CV completo.
          </p>
        </header>

        <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, setor, competência, cidade…"
                className="pl-9"
              />
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-3.5 w-3.5" /> Limpar
              </Button>
            )}
          </div>

          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Setor (principal ou secundário)" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={ALL}>Todos os setores</SelectItem>
                {SECTORS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={unitFilter}
              onValueChange={setUnitFilter}
              disabled={unitOptions.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unidade" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={ALL}>Todas as unidades</SelectItem>
                {unitOptions.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={cityFilter}
              onValueChange={setCityFilter}
              disabled={cityOptions.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={ALL}>Todas as cidades</SelectItem>
                {cityOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            <strong className="text-foreground">{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "consultor encontrado" : "consultores encontrados"}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Filter className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                Nenhum consultor com esses filtros
              </h3>
              <p className="max-w-md text-xs text-muted-foreground">
                Tente afrouxar os critérios ou limpar os filtros para ver mais resultados.
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((c) => (
              <ConsultantCard
                key={c.id}
                consultant={c}
                onOpen={() => navigate(`/consultores/${c.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Consultants;
