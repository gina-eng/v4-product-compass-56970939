import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface TierWtpDisplayRow {
  tier: string;
  annualRevenue: string;
  wtpMartech: string;
  media: string;
  tech: string;
  service: string;
}

const fallbackTierWtpRows: TierWtpDisplayRow[] = [
  {
    tier: "Tiny",
    annualRevenue: "< R$ 1.2M",
    wtpMartech: "12 - 15%",
    media: "55%",
    tech: "15%",
    service: "30%",
  },
  {
    tier: "Small",
    annualRevenue: "> R$ 1.2M < R$ 2.4M",
    wtpMartech: "12 - 15%",
    media: "55%",
    tech: "15%",
    service: "30%",
  },
  {
    tier: "Medium (-)",
    annualRevenue: "> R$ 2.4M < R$ 10M",
    wtpMartech: "10 - 12%",
    media: "55%",
    tech: "20%",
    service: "25%",
  },
  {
    tier: "Medium (=)",
    annualRevenue: "> R$ 10M < R$ 25M",
    wtpMartech: "8 - 10%",
    media: "55%",
    tech: "20%",
    service: "25%",
  },
  {
    tier: "Medium (+)",
    annualRevenue: "> R$ 25M < R$ 50M",
    wtpMartech: "8 - 10%",
    media: "55%",
    tech: "20%",
    service: "25%",
  },
  {
    tier: "Large",
    annualRevenue: "> R$ 50M < R$ 200M",
    wtpMartech: "7 - 10%",
    media: "50%",
    tech: "25%",
    service: "25%",
  },
  {
    tier: "Large'",
    annualRevenue: "> R$ 200M < R$ 480M",
    wtpMartech: "4 - 7%",
    media: "50%",
    tech: "25%",
    service: "25%",
  },
  {
    tier: "Enterprise",
    annualRevenue: "> R$ 480M",
    wtpMartech: "3 - 6%",
    media: "45%",
    tech: "30%",
    service: "25%",
  },
];

const formatPercentage = (value: number) => {
  const isInteger = Number.isInteger(value);
  return `${isInteger ? value.toString() : value.toFixed(2)}%`;
};

const TierWtpDefinition = () => {
  const [tierWtpRows, setTierWtpRows] = useState<TierWtpDisplayRow[]>(fallbackTierWtpRows);

  useEffect(() => {
    const fetchTierWtpRows = async () => {
      try {
        const { data, error } = await supabase
          .from("tier_wtp_definitions")
          .select("*")
          .order("sort_order", { ascending: true });

        if (error) throw error;
        if (!data?.length) return;

        const mappedRows: TierWtpDisplayRow[] = data.map((row) => ({
          tier: row.tier_label,
          annualRevenue: row.annual_revenue_label,
          wtpMartech: row.wtp_martech_label,
          media: formatPercentage(row.media_pct),
          tech: formatPercentage(row.tech_pct),
          service: formatPercentage(row.service_pct),
        }));

        setTierWtpRows(mappedRows);
      } catch (error) {
        console.error("Erro ao carregar definição de TIER/WTP:", error);
      }
    };

    fetchTierWtpRows();
  }, []);

  return (
    <Layout>
      <section className="space-y-6 animate-fade-in">
        <div className="space-y-4">
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Visão Geral
            </Link>
          </Button>

          <header>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Definição de TIER e WTP
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">
              Segmentação ideal dos clientes por faixa de receita anual, com os percentuais de WTP
              Martech e distribuição de investimento entre Mídia, Tech e Serviço.
            </p>
          </header>
        </div>

        <Card className="border-border/80 bg-card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Definição Ideal dos Clientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              A classificação por TIER considera receita anual e direciona o percentual recomendado
              de WTP Martech para cada perfil.
            </p>
            <p>
              Essa referência padroniza decisões comerciais e garante consistência na alocação entre
              Mídia, Tech e Serviço.
            </p>
          </CardContent>
        </Card>

        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow className="border-b-0 bg-primary hover:bg-primary">
                <TableHead className="h-14 border-r border-primary-foreground/20 text-sm font-semibold text-primary-foreground">
                  Tier
                </TableHead>
                <TableHead className="h-14 border-r border-primary-foreground/20 text-sm font-semibold text-primary-foreground">
                  Annual Revenue
                </TableHead>
                <TableHead className="h-14 border-r border-primary-foreground/20 text-sm font-semibold text-primary-foreground">
                  WTP Martech
                </TableHead>
                <TableHead className="h-14 border-r border-primary-foreground/20 text-sm font-semibold text-primary-foreground">
                  Mídia
                </TableHead>
                <TableHead className="h-14 border-r border-primary-foreground/20 text-sm font-semibold text-primary-foreground">
                  Tech
                </TableHead>
                <TableHead className="h-14 text-sm font-semibold text-primary-foreground">
                  Serviço
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tierWtpRows.map((row, index) => (
                <TableRow
                  key={row.tier}
                  className={[
                    "border-border/70 hover:bg-transparent",
                    index % 2 === 0 ? "bg-muted/35" : "bg-card",
                  ].join(" ")}
                >
                  <TableCell className="border-r border-border/70 font-semibold text-foreground">
                    {row.tier}
                  </TableCell>
                  <TableCell className="border-r border-border/70 text-content">
                    {row.annualRevenue}
                  </TableCell>
                  <TableCell className="border-r border-border/70 text-content">
                    {row.wtpMartech}
                  </TableCell>
                  <TableCell className="border-r border-border/70 text-content">{row.media}</TableCell>
                  <TableCell className="border-r border-border/70 text-content">{row.tech}</TableCell>
                  <TableCell className="text-content">{row.service}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </Layout>
  );
};

export default TierWtpDefinition;
