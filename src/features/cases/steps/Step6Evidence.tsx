import { ExternalLink, FileText, Mic, Monitor } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldShell } from "../components/FieldShell";
import type { CaseRecord } from "../types";

interface StepProps {
  record: CaseRecord;
  errors: Record<string, string>;
  update: (patch: Partial<CaseRecord>) => void;
}

const LinkField = ({
  icon: Icon,
  label,
  value,
  onChange,
  error,
  description,
}: {
  icon: typeof Monitor;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  description: string;
}) => (
  <div className="rounded-xl border border-border/70 bg-background p-4">
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-2">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      {value && (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground transition-colors hover:text-primary"
          aria-label="Abrir link"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  </div>
);

export const Step6Evidence = ({ record, errors, update }: StepProps) => {
  const hasAnyEvidence = Boolean(
    record.dashboardUrl || record.presentationUrl || record.testimonialUrl,
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-foreground">
        <p className="font-semibold">Última etapa.</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Cases com evidências comprováveis ganham prioridade nas buscas. Sem nenhum link, o case
          é registrado com a flag <span className="font-semibold">"Sem evidência"</span> e fica
          pendente de curadoria.
        </p>
      </div>

      <div className="space-y-3">
        <LinkField
          icon={Monitor}
          label="Link do dashboard de resultado"
          description="Looker, Metabase, Power BI, planilha pública etc."
          value={record.dashboardUrl}
          onChange={(v) => update({ dashboardUrl: v })}
          error={errors.dashboardUrl}
        />
        <LinkField
          icon={FileText}
          label="Link da apresentação completa do case"
          description="Slide deck, PDF, Notion, doc compartilhado."
          value={record.presentationUrl}
          onChange={(v) => update({ presentationUrl: v })}
          error={errors.presentationUrl}
        />
        <LinkField
          icon={Mic}
          label="Link de gravação de chamada com cliente / depoimento"
          description="Vídeo, podcast, gravação de reunião."
          value={record.testimonialUrl}
          onChange={(v) => update({ testimonialUrl: v })}
          error={errors.testimonialUrl}
        />
      </div>

      {!hasAnyEvidence && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-400/5 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
          Nenhum link informado — o case será marcado como{" "}
          <span className="font-semibold">"Sem evidência"</span>. Você ainda pode finalizar o
          registro.
        </div>
      )}

      <FieldShell
        label="Observações finais"
        hint="Espaço para qualquer contexto que não coube nas perguntas anteriores."
      >
        <Textarea
          rows={4}
          value={record.finalNotes}
          onChange={(e) => update({ finalNotes: e.target.value })}
        />
      </FieldShell>
    </div>
  );
};
