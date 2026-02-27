import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowUpRight, LayoutGrid, List, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/formatters";
import { calculateFaturamentoFromData } from "@/lib/productCalculations";
import certificationMedal from "@/assets/certificate-medal-svgrepo-com.svg";

interface PortfolioItem {
  id: string;
  name: string;
  baseName: string;
  variationName: string;
  groupKey: string;
  description: string;
  category: string;
  status: string;
  valorBase: string;
  certificacao: boolean;
}

interface PortfolioGroup {
  groupKey: string;
  baseName: string;
  products: PortfolioItem[];
}

type PortfolioItemWithoutVariationData = Omit<
  PortfolioItem,
  "baseName" | "variationName" | "groupKey"
>;

const validCategoryFilters = [
  "all",
  "destrava_receita",
  "saber",
  "ter",
  "executar",
  "potencializar",
] as const;
type CategoryFilter = (typeof validCategoryFilters)[number];

const normalizeCategoryFilter = (value: string | null): CategoryFilter => {
  const normalized = value?.toLowerCase() ?? "all";
  return validCategoryFilters.includes(normalized as CategoryFilter)
    ? (normalized as CategoryFilter)
    : "all";
};

const categoryLabelMap: Record<string, string> = {
  destrava_receita: "DESTRAVA RECEITA",
  saber: "SABER",
  ter: "TER",
  executar: "EXECUTAR",
  potencializar: "POTENCIALIZAR",
};

const categoryToneMap: Record<string, string> = {
  destrava_receita: "bg-primary/10 text-primary",
  saber: "bg-saber/10 text-saber",
  ter: "bg-ter/10 text-ter",
  executar: "bg-executar/10 text-executar",
  potencializar: "bg-potencializar/10 text-potencializar",
};

const statusToneMap: Record<string, string> = {
  Disponível: "bg-green-100 text-green-800",
  "Em produção": "bg-amber-100 text-amber-800",
};

const defaultVariationLabel = "Padrão";

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const extractVariationCandidate = (name: string) => {
  const trimmedName = name.trim();
  const separators = [" - ", " | ", " – ", " — "];

  for (const separator of separators) {
    const splitIndex = trimmedName.lastIndexOf(separator);
    if (splitIndex <= 0 || splitIndex >= trimmedName.length - separator.length) {
      continue;
    }

    const baseName = trimmedName.slice(0, splitIndex).trim();
    const variationName = trimmedName.slice(splitIndex + separator.length).trim();

    if (baseName && variationName) {
      return { baseName, variationName, isCandidate: true };
    }
  }

  const parenthesesMatch = trimmedName.match(/^(.*)\s\(([^()]+)\)$/);
  if (parenthesesMatch) {
    const baseName = parenthesesMatch[1]?.trim();
    const variationName = parenthesesMatch[2]?.trim();

    if (baseName && variationName) {
      return { baseName, variationName, isCandidate: true };
    }
  }

  return {
    baseName: trimmedName,
    variationName: defaultVariationLabel,
    isCandidate: false,
  };
};

const appendVariationMetadata = (
  items: PortfolioItemWithoutVariationData[]
): PortfolioItem[] => {
  const candidates = items.map((item) => {
    const variationCandidate = extractVariationCandidate(item.name);
    const candidateGroupKey = `${item.category}:${normalizeText(variationCandidate.baseName)}`;
    return { item, variationCandidate, candidateGroupKey };
  });

  const candidateGroupCounts = new Map<string, number>();
  candidates.forEach(({ variationCandidate, candidateGroupKey }) => {
    if (!variationCandidate.isCandidate) return;

    candidateGroupCounts.set(
      candidateGroupKey,
      (candidateGroupCounts.get(candidateGroupKey) ?? 0) + 1
    );
  });

  return candidates.map(({ item, variationCandidate, candidateGroupKey }) => {
    const shouldSplitVariation =
      variationCandidate.isCandidate &&
      (candidateGroupCounts.get(candidateGroupKey) ?? 0) > 1;

    const baseName = shouldSplitVariation ? variationCandidate.baseName : item.name;

    return {
      ...item,
      baseName,
      variationName: shouldSplitVariation
        ? variationCandidate.variationName
        : defaultVariationLabel,
      groupKey: `${item.category}:${normalizeText(baseName)}`,
    };
  });
};

const ProductPortfolio = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [statusFilter, setStatusFilter] = useState<string>("Disponível");
  const [certificationFilter, setCertificationFilter] = useState<"all" | "required">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [products, setProducts] = useState<PortfolioItem[]>([]);
  const [selectedVariationByGroup, setSelectedVariationByGroup] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const activeFilter = normalizeCategoryFilter(searchParams.get("categoria"));

  const handleCategoryFilterChange = (value: string) => {
    const nextCategory = normalizeCategoryFilter(value);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("categoria", nextCategory);
    setSearchParams(nextParams, { replace: true });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("updated_at", { ascending: false });

        if (error) {
          console.error("Error fetching products:", error);
          return;
        }

        if (!data) {
          setProducts([]);
          return;
        }

        const productsWithMetrics: PortfolioItemWithoutVariationData[] = await Promise.all(
          data.map(async (product) => {
            const { data: positions, error: positionsError } = await supabase
              .from("product_positions")
              .select(
                `
                *,
                positions (*)
              `
              )
              .eq("product_id", product.id);

            if (positionsError) {
              console.error("Error fetching positions:", positionsError);
            }

            let faturamentoSemDesconto = 0;

            if (positions && positions.length > 0) {
              const productData = {
                markup: Number(product.markup) || 1,
                markup_overhead: Number(product.markup_overhead) || 1,
                categoria: product.categoria,
                usa_dedicacao: product.usa_dedicacao || false,
              };

              const nivelDedicacao =
                product.usa_dedicacao && product.categoria === "executar" ? 0.1 : 1;

              faturamentoSemDesconto = calculateFaturamentoFromData(
                positions,
                productData,
                nivelDedicacao
              );
            }

            return {
              id: product.id,
              name: product.produto,
              description: product.descricao_card?.trim() || product.description || "",
              category: product.categoria,
              status: product.status === "Em homologação" ? "Em produção" : product.status,
              valorBase: faturamentoSemDesconto > 0 ? faturamentoSemDesconto.toString() : "A definir",
              certificacao: Boolean(product.certificacao),
            };
          })
        );

        setProducts(appendVariationMetadata(productsWithMetrics));
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(
    () =>
      products
        .filter((product) => statusFilter === "all" || product.status === statusFilter)
        .filter((product) => certificationFilter === "all" || product.certificacao)
        .filter((product) => activeFilter === "all" || product.category === activeFilter)
        .filter((product) => {
          if (!searchTerm.trim()) return true;
          const normalizedSearch = searchTerm.toLowerCase();
          return (
            product.name?.toLowerCase().includes(normalizedSearch) ||
            product.baseName?.toLowerCase().includes(normalizedSearch) ||
            (product.variationName !== defaultVariationLabel &&
              product.variationName?.toLowerCase().includes(normalizedSearch)) ||
            product.description?.toLowerCase().includes(normalizedSearch)
          );
        }),
    [products, statusFilter, certificationFilter, activeFilter, searchTerm]
  );

  const groupedProducts = useMemo<PortfolioGroup[]>(() => {
    const groups = new Map<string, PortfolioGroup>();

    filteredProducts.forEach((product) => {
      const existingGroup = groups.get(product.groupKey);

      if (existingGroup) {
        existingGroup.products.push(product);
        return;
      }

      groups.set(product.groupKey, {
        groupKey: product.groupKey,
        baseName: product.baseName,
        products: [product],
      });
    });

    return Array.from(groups.values());
  }, [filteredProducts]);

  const getSelectedProduct = (group: PortfolioGroup) => {
    const selectedId = selectedVariationByGroup[group.groupKey];
    return group.products.find((product) => product.id === selectedId) ?? group.products[0];
  };

  const getVariationOptionLabel = (product: PortfolioItem, hasVariations: boolean) => {
    if (!hasVariations) return product.name;
    if (product.variationName !== defaultVariationLabel) return product.variationName;
    return product.name;
  };

  const handleViewDetails = (product: PortfolioItem) => {
    const slug = product.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    navigate(`/produto/${slug}`, { state: { productId: product.id } });
  };

  return (
    <section className="space-y-6 animate-fade-in">
      <header>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Painel de Portfólio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Central de acompanhamento dos produtos e serviços cadastrados.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_220px_220px_220px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por produto ou descrição..."
            className="h-11 rounded-xl border-border/80 bg-white pl-10 shadow-sm"
          />
        </div>

        <Select value={activeFilter} onValueChange={handleCategoryFilterChange}>
          <SelectTrigger className="h-11 rounded-xl border-border/80 bg-white shadow-sm">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            <SelectItem value="destrava_receita">DESTRAVA RECEITA</SelectItem>
            <SelectItem value="saber">SABER</SelectItem>
            <SelectItem value="ter">TER</SelectItem>
            <SelectItem value="executar">EXECUTAR</SelectItem>
            <SelectItem value="potencializar">POTENCIALIZAR</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11 rounded-xl border-border/80 bg-white shadow-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="Disponível">Disponível</SelectItem>
            <SelectItem value="Em produção">Em produção</SelectItem>
          </SelectContent>
        </Select>

        <Select value={certificationFilter} onValueChange={(value) => setCertificationFilter(value as "all" | "required")}>
          <SelectTrigger className="h-11 rounded-xl border-border/80 bg-white shadow-sm">
            <SelectValue placeholder="Certificação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="required">Somente com certificação</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-white p-1 shadow-sm">
          <Button
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="sm"
            className="h-9 rounded-lg px-3"
            onClick={() => setViewMode("cards")}
          >
            <LayoutGrid className="h-4 w-4" />
            Cards
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            className="h-9 rounded-lg px-3"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
            Lista
          </Button>
        </div>
      </div>

      {viewMode === "cards" ? (
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.45)]">
          {loading && (
            <div className="py-10 text-center text-sm text-muted-foreground">Carregando produtos...</div>
          )}

          {!loading && groupedProducts.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Nenhum produto encontrado para os filtros selecionados.
            </div>
          )}

          {!loading && groupedProducts.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {groupedProducts.map((group) => {
                const selectedProduct = getSelectedProduct(group);
                const hasVariations = group.products.length > 1;

                return (
                  <Card
                    key={group.groupKey}
                    className="h-full border-border/80 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <CardHeader className="space-y-3 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-2">
                          {selectedProduct.certificacao && (
                            <img
                              src={certificationMedal}
                              alt="Produto com certificação obrigatória"
                              className="mt-0.5 h-7 w-7 shrink-0"
                            />
                          )}
                          <CardTitle className="line-clamp-2 text-base leading-tight">
                            {group.baseName}
                          </CardTitle>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg border-border/80 bg-white px-2.5"
                          onClick={() => handleViewDetails(selectedProduct)}
                        >
                          Abrir
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        <Badge
                          variant="secondary"
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryToneMap[selectedProduct.category] || "bg-muted text-foreground"}`}
                        >
                          {categoryLabelMap[selectedProduct.category] ||
                            selectedProduct.category.toUpperCase()}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusToneMap[selectedProduct.status] || "bg-muted text-foreground"}`}
                        >
                          {selectedProduct.status}
                        </Badge>
                        {hasVariations && (
                          <Badge
                            variant="outline"
                            className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          >
                            {group.products.length} variações
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                      {hasVariations && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Variação
                          </p>
                          <Select
                            value={selectedProduct.id}
                            onValueChange={(value) =>
                              setSelectedVariationByGroup((prev) => ({
                                ...prev,
                                [group.groupKey]: value,
                              }))
                            }
                          >
                            <SelectTrigger className="h-9 rounded-lg border-border/80 bg-white text-xs">
                              <SelectValue placeholder="Selecione a variação" />
                            </SelectTrigger>
                            <SelectContent>
                              {group.products.map((variationProduct) => (
                                <SelectItem
                                  key={variationProduct.id}
                                  value={variationProduct.id}
                                  className="text-xs"
                                >
                                  {getVariationOptionLabel(variationProduct, hasVariations)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {selectedProduct.description || "Sem descrição curta"}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-muted-foreground">Valor base</span>
                        <span className="font-semibold text-foreground">
                          {selectedProduct.valorBase === "A definir"
                            ? "A definir"
                            : formatCurrency(selectedProduct.valorBase)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_14px_30px_-24px_rgba(15,23,42,0.45)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-muted/55">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Categoria</th>
                  <th className="px-4 py-3 font-semibold">Produto</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Valor Base</th>
                  <th className="px-4 py-3 font-semibold">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {loading && (
                  <tr>
                    <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={5}>
                      Carregando produtos...
                    </td>
                  </tr>
                )}

                {!loading && groupedProducts.length === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={5}>
                      Nenhum produto encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}

                {!loading &&
                  groupedProducts.map((group) => {
                    const selectedProduct = getSelectedProduct(group);
                    const hasVariations = group.products.length > 1;

                    return (
                      <tr key={group.groupKey} className="bg-white transition-colors hover:bg-muted/25">
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryToneMap[selectedProduct.category] || "bg-muted text-foreground"}`}
                          >
                            {categoryLabelMap[selectedProduct.category] ||
                              selectedProduct.category.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <p className="max-w-[280px] truncate text-sm font-semibold text-foreground">
                            {group.baseName}
                          </p>
                          {hasVariations && (
                            <div className="mt-2 w-[240px]">
                              <Select
                                value={selectedProduct.id}
                                onValueChange={(value) =>
                                  setSelectedVariationByGroup((prev) => ({
                                    ...prev,
                                    [group.groupKey]: value,
                                  }))
                                }
                              >
                                <SelectTrigger className="h-9 rounded-lg border-border/80 bg-white text-xs">
                                  <SelectValue placeholder="Selecione a variação" />
                                </SelectTrigger>
                                <SelectContent>
                                  {group.products.map((variationProduct) => (
                                    <SelectItem
                                      key={variationProduct.id}
                                      value={variationProduct.id}
                                      className="text-xs"
                                    >
                                      {getVariationOptionLabel(variationProduct, hasVariations)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusToneMap[selectedProduct.status] || "bg-muted text-foreground"}`}
                          >
                            {selectedProduct.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-foreground">
                          {selectedProduct.valorBase === "A definir"
                            ? "A definir"
                            : formatCurrency(selectedProduct.valorBase)}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-lg border-border/80 bg-white px-3"
                            onClick={() => handleViewDetails(selectedProduct)}
                          >
                            Abrir
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductPortfolio;
