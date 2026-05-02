import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Award,
  Building2,
  Calendar,
  Handshake,
  Layers,
  TrendingUp,
  UserCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SALES_MODELS } from "../options";
import type { CaseRecord } from "../types";

const SALES_LABEL = Object.fromEntries(SALES_MODELS.map((m) => [m.value, m.label]));

const MONTH_LABELS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const formatMonthLabel = (key: string) => {
  const [year, month] = key.split("-");
  const m = Number(month) - 1;
  const yy = year.slice(2);
  return `${MONTH_LABELS[m]}/${yy}`;
};

type MonthlyPoint = { key: string; label: string; total: number };

type RankRow = {
  name: string;
  total: number;
  thisMonth: number;
  prevMonth: number;
  delta: number;
};

type CategoryRow = {
  name: string;
  total: number;
  thisMonth: number;
};

type Stats = {
  monthly: MonthlyPoint[];
  totalAll: number;
  thisMonth: number;
  prevMonth: number;
  growthPct: number | null;
  unitsThisMonth: number;
  ownersThisMonth: number;
  unitRanking: RankRow[];
  ownerRanking: RankRow[];
  segmentDistribution: CategoryRow[];
  salesModelDistribution: CategoryRow[];
  currentMonthLabel: string;
  prevMonthLabel: string;
};

const computeStats = (records: CaseRecord[]): Stats => {
  const published = records.filter((r) => r.status !== "rascunho");

  const now = new Date();
  const currentKey = monthKey(now);
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevKey = monthKey(prevDate);

  // Janelas de 12 meses (mês atual incluso)
  const monthlyMap = new Map<string, number>();
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyMap.set(monthKey(d), 0);
  }

  const unitAgg = new Map<string, { total: number; thisMonth: number; prevMonth: number }>();
  const ownerAgg = new Map<string, { total: number; thisMonth: number; prevMonth: number }>();
  const segmentAgg = new Map<string, { total: number; thisMonth: number }>();
  const salesAgg = new Map<string, { total: number; thisMonth: number }>();

  const bumpCategory = (
    map: Map<string, { total: number; thisMonth: number }>,
    key: string,
    isThis: boolean,
  ) => {
    const cur = map.get(key) ?? { total: 0, thisMonth: 0 };
    cur.total += 1;
    if (isThis) cur.thisMonth += 1;
    map.set(key, cur);
  };

  const bumpRank = (
    map: Map<string, { total: number; thisMonth: number; prevMonth: number }>,
    key: string,
    isThis: boolean,
    isPrev: boolean,
  ) => {
    const cur = map.get(key) ?? { total: 0, thisMonth: 0, prevMonth: 0 };
    cur.total += 1;
    if (isThis) cur.thisMonth += 1;
    if (isPrev) cur.prevMonth += 1;
    map.set(key, cur);
  };

  for (const r of published) {
    const date = new Date(r.createdAt || r.updatedAt);
    if (Number.isNaN(date.getTime())) continue;
    const key = monthKey(date);
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + 1);
    }
    const isThis = key === currentKey;
    const isPrev = key === prevKey;

    const unit = (r.v4Unit || "Sem unidade").trim();
    bumpRank(unitAgg, unit, isThis, isPrev);

    const owner = (r.ownerEmail || "Sem operador").trim().toLowerCase();
    bumpRank(ownerAgg, owner, isThis, isPrev);

    const segment = (r.segment || "Não informado").trim();
    bumpCategory(segmentAgg, segment, isThis);

    const salesKey = r.salesModel ? SALES_LABEL[r.salesModel] ?? r.salesModel : "Não informado";
    bumpCategory(salesAgg, salesKey, isThis);
  }

  const monthly: MonthlyPoint[] = Array.from(monthlyMap.entries()).map(([key, total]) => ({
    key,
    label: formatMonthLabel(key),
    total,
  }));

  const thisMonth = monthlyMap.get(currentKey) ?? 0;
  const prevMonth = monthlyMap.get(prevKey) ?? 0;
  const growthPct =
    prevMonth === 0
      ? thisMonth > 0
        ? null
        : 0
      : Math.round(((thisMonth - prevMonth) / prevMonth) * 100);

  const toRows = (
    map: Map<string, { total: number; thisMonth: number; prevMonth: number }>,
  ): RankRow[] =>
    Array.from(map.entries())
      .map(([name, v]) => ({
        name,
        total: v.total,
        thisMonth: v.thisMonth,
        prevMonth: v.prevMonth,
        delta: v.thisMonth - v.prevMonth,
      }))
      .sort((a, b) => {
        if (b.thisMonth !== a.thisMonth) return b.thisMonth - a.thisMonth;
        return b.total - a.total;
      });

  const unitRanking = toRows(unitAgg).slice(0, 10);
  const ownerRanking = toRows(ownerAgg).slice(0, 10);

  const toCategoryRows = (
    map: Map<string, { total: number; thisMonth: number }>,
  ): CategoryRow[] =>
    Array.from(map.entries())
      .map(([name, v]) => ({ name, total: v.total, thisMonth: v.thisMonth }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

  const segmentDistribution = toCategoryRows(segmentAgg);
  const salesModelDistribution = toCategoryRows(salesAgg);

  // Unidades/operadores únicos no mês atual
  const unitsThisMonth = Array.from(unitAgg.values()).filter((v) => v.thisMonth > 0).length;
  const ownersThisMonth = Array.from(ownerAgg.values()).filter((v) => v.thisMonth > 0).length;

  return {
    monthly,
    totalAll: published.length,
    thisMonth,
    prevMonth,
    growthPct,
    unitsThisMonth,
    ownersThisMonth,
    unitRanking,
    ownerRanking,
    segmentDistribution,
    salesModelDistribution,
    currentMonthLabel: formatMonthLabel(currentKey),
    prevMonthLabel: formatMonthLabel(prevKey),
  };
};

const KpiCard = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: React.ReactNode;
  icon: typeof Calendar;
  tone?: "default" | "primary" | "value";
}) => (
  <Card>
    <CardContent className="flex items-start gap-3 p-4">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm",
          tone === "primary" && "border-primary/20 bg-primary/10 text-primary",
          tone === "value" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
          tone === "default" && "border-border/60 bg-muted text-foreground",
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-bold leading-tight tracking-tight text-foreground">
          {value}
        </p>
        {hint && (
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{hint}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

const SectionTitle = ({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Calendar;
  title: string;
  subtitle?: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary shadow-sm">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-[0.06em] text-primary">
        {title}
      </h3>
      {subtitle && (
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      )}
    </div>
  </div>
);

const RankingTable = ({
  rows,
  emptyText,
  formatName,
}: {
  rows: RankRow[];
  emptyText: string;
  formatName?: (name: string) => string;
}) => {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
        {emptyText}
      </p>
    );
  }
  const maxThisMonth = Math.max(...rows.map((r) => r.thisMonth), 1);
  return (
    <div className="overflow-hidden rounded-lg border border-border/60">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left">#</th>
            <th className="px-3 py-2 text-left">Nome</th>
            <th className="px-3 py-2 text-right">Mês atual</th>
            <th className="px-3 py-2 text-right">Mês anterior</th>
            <th className="px-3 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const pct = (row.thisMonth / maxThisMonth) * 100;
            const positive = row.delta > 0;
            const negative = row.delta < 0;
            return (
              <tr
                key={row.name}
                className="border-t border-border/60 transition-colors hover:bg-muted/20"
              >
                <td className="px-3 py-2 font-semibold text-muted-foreground">
                  {i + 1}
                </td>
                <td className="px-3 py-2">
                  <div className="space-y-1">
                    <p className="truncate font-medium text-foreground">
                      {formatName ? formatName(row.name) : row.name}
                    </p>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-right">
                  <span className="font-semibold text-foreground">{row.thisMonth}</span>
                  {row.delta !== 0 && (
                    <span
                      className={cn(
                        "ml-1.5 text-[10px] font-bold",
                        positive && "text-emerald-600",
                        negative && "text-rose-600",
                      )}
                    >
                      {positive ? "+" : ""}
                      {row.delta}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right text-muted-foreground">
                  {row.prevMonth}
                </td>
                <td className="px-3 py-2 text-right font-semibold text-foreground">
                  {row.total}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const CategoryChart = ({ rows }: { rows: CategoryRow[] }) => {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
        Sem dados suficientes para esta visualização.
      </p>
    );
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            horizontal={false}
          />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={160}
            tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            formatter={(value: number) => [`${value} cases`, "Total"]}
          />
          <Bar dataKey="total" radius={[0, 4, 4, 0]}>
            {rows.map((_, i) => (
              <Cell key={i} fill="hsl(var(--primary))" fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const formatGrowth = (pct: number | null) => {
  if (pct === null) return "Novo este mês";
  if (pct > 0) return `+${pct}% vs mês anterior`;
  if (pct < 0) return `${pct}% vs mês anterior`;
  return "Estável vs mês anterior";
};

const growthTone = (pct: number | null) => {
  if (pct === null || pct > 0) return "text-emerald-600";
  if (pct < 0) return "text-rose-600";
  return "text-muted-foreground";
};

const obfuscateEmail = (email: string) => {
  if (!email.includes("@")) return email;
  const [local, domain] = email.split("@");
  return `${local}@${domain}`;
};

export const CasesRanking = ({ cases }: { cases: CaseRecord[] }) => {
  const stats = useMemo(() => computeStats(cases), [cases]);

  if (stats.totalAll === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            Sem dados para o ranking
          </h3>
          <p className="max-w-md text-xs text-muted-foreground">
            Quando os primeiros cases forem publicados, o ranking de unidades e a
            evolução mensal aparecem aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={`Cases em ${stats.currentMonthLabel}`}
          value={stats.thisMonth}
          hint={
            <span className={growthTone(stats.growthPct)}>
              {formatGrowth(stats.growthPct)}
            </span>
          }
          icon={Calendar}
          tone="primary"
        />
        <KpiCard
          label="Total publicado"
          value={stats.totalAll}
          hint="Acumulado desde o início"
          icon={Award}
          tone="default"
        />
        <KpiCard
          label={`Unidades engajadas em ${stats.currentMonthLabel}`}
          value={stats.unitsThisMonth}
          hint="Unidades que publicaram pelo menos 1 case no mês"
          icon={Building2}
          tone="value"
        />
        <KpiCard
          label={`Operadores ativos em ${stats.currentMonthLabel}`}
          value={stats.ownersThisMonth}
          hint="Pessoas distintas que publicaram no mês"
          icon={UserCircle2}
          tone="default"
        />
      </div>

      <Card className="overflow-hidden">
        <CardContent className="space-y-4 p-5">
          <SectionTitle
            icon={TrendingUp}
            title="Evolução mensal"
            subtitle="Cases publicados nos últimos 12 meses"
          />
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.monthly}
                margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  formatter={(value: number) => [`${value} cases`, "Publicados"]}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ fill: "hsl(var(--primary))", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="space-y-4 p-5">
          <SectionTitle
            icon={Building2}
            title="Top unidades engajadas"
            subtitle={`Ordenado por publicações em ${stats.currentMonthLabel}`}
          />
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.unitRanking}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  formatter={(value: number) => [`${value} cases`, "Mês atual"]}
                />
                <Bar dataKey="thisMonth" radius={[0, 4, 4, 0]}>
                  {stats.unitRanking.map((_, i) => (
                    <Cell key={i} fill="hsl(var(--primary))" fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <RankingTable
            rows={stats.unitRanking}
            emptyText="Nenhuma unidade publicou cases ainda."
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardContent className="space-y-4 p-5">
            <SectionTitle
              icon={Layers}
              title="Cases por segmento"
              subtitle="Top 10 segmentos com mais cases publicados"
            />
            <CategoryChart rows={stats.segmentDistribution} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="space-y-4 p-5">
            <SectionTitle
              icon={Handshake}
              title="Cases por modelo de venda"
              subtitle="Distribuição entre os modelos de venda"
            />
            <CategoryChart rows={stats.salesModelDistribution} />
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="space-y-4 p-5">
          <SectionTitle
            icon={UserCircle2}
            title="Top operadores"
            subtitle={`Pessoas que mais publicaram em ${stats.currentMonthLabel}`}
          />
          <RankingTable
            rows={stats.ownerRanking}
            emptyText="Nenhum operador publicou cases ainda."
            formatName={obfuscateEmail}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CasesRanking;
