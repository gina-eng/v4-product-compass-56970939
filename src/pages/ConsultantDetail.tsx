import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  Briefcase,
  Building2,
  CheckCircle2,
  GraduationCap,
  Languages,
  Mail,
  MapPin,
  Sparkles,
  Target,
  UserCircle2,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getConsultant } from "@/features/consultants/storage";
import type { Consultant } from "@/features/consultants/types";
import { cn } from "@/lib/utils";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
  >
    <path
      fill="#25D366"
      d="M16 0C7.16 0 0 7.16 0 16c0 2.82.74 5.58 2.15 8.01L0 32l8.2-2.15A15.92 15.92 0 0 0 16 32c8.84 0 16-7.16 16-16S24.84 0 16 0Z"
    />
    <path
      fill="#fff"
      d="M23.47 19.36c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.51-.16-.73.16-.21.32-.83 1.05-1.02 1.27-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.6-1.6-.96-.86-1.6-1.93-1.79-2.25-.19-.32-.02-.5.14-.66.14-.14.32-.38.48-.57.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.57-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.55-.73-.56-.19-.01-.4-.01-.62-.01-.21 0-.57.08-.86.4-.3.32-1.13 1.1-1.13 2.69 0 1.59 1.16 3.13 1.32 3.34.16.21 2.28 3.48 5.52 4.88.77.33 1.37.53 1.84.68.77.25 1.47.21 2.03.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.39.19-1.53-.08-.13-.3-.21-.62-.37Z"
    />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
  >
    <path fill="#0A66C2" d="M27 0H5a5 5 0 0 0-5 5v22a5 5 0 0 0 5 5h22a5 5 0 0 0 5-5V5a5 5 0 0 0-5-5Z" />
    <path
      fill="#fff"
      d="M9.4 12.3h3.7v12H9.4v-12Zm1.85-5.9a2.15 2.15 0 1 1 0 4.3 2.15 2.15 0 0 1 0-4.3ZM15.3 12.3h3.55v1.65h.05c.5-.94 1.7-1.94 3.5-1.94 3.74 0 4.43 2.46 4.43 5.66v6.63h-3.7v-5.88c0-1.4-.03-3.2-1.95-3.2-1.95 0-2.25 1.52-2.25 3.1v5.98H15.3v-12Z"
    />
  </svg>
);

const buildWhatsappUrl = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/55${digits}`;
};

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

type RichBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

const BULLET_RE = /^\s*[*\-•·]\s+/;

const parseRichText = (raw: string): RichBlock[] => {
  if (!raw) return [];
  const lines = raw.split(/\r?\n/);
  const blocks: RichBlock[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      blocks.push({ kind: "paragraph", text: paragraphBuffer.join(" ").trim() });
      paragraphBuffer = [];
    }
  };
  const flushList = () => {
    if (listBuffer.length > 0) {
      blocks.push({ kind: "list", items: [...listBuffer] });
      listBuffer = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    if (BULLET_RE.test(line)) {
      flushParagraph();
      listBuffer.push(line.replace(BULLET_RE, "").trim());
    } else {
      flushList();
      paragraphBuffer.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
};

const RichText = ({
  text,
  bulletColor = "primary",
}: {
  text: string;
  bulletColor?: "primary" | "value";
}) => {
  const blocks = parseRichText(text);
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-3">
      {blocks.map((block, i) =>
        block.kind === "paragraph" ? (
          <p key={i} className="text-sm leading-relaxed text-foreground">
            {block.text}
          </p>
        ) : (
          <ul key={i} className="space-y-2">
            {block.items.map((item, j) => (
              <li
                key={j}
                className="flex gap-2.5 text-sm leading-relaxed text-foreground"
              >
                <span
                  className={cn(
                    "mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full",
                    bulletColor === "value" ? "bg-emerald-500" : "bg-primary",
                  )}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
};

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Briefcase;
  title: string;
  children: React.ReactNode;
}) => (
  <Card className="overflow-hidden border-border/70">
    <div className="flex items-center gap-3 border-b border-primary/15 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-5 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/15 text-primary shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-sm font-semibold uppercase tracking-[0.06em] text-primary md:text-[15px]">
        {title}
      </h2>
    </div>
    <CardContent className="p-5">{children}</CardContent>
  </Card>
);

const ConsultantDetail = () => {
  const { id } = useParams();
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void getConsultant(id).then((c) => {
      if (cancelled) return;
      setConsultant(c ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Carregando consultor…
        </div>
      </Layout>
    );
  }

  if (!consultant) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
          <h1 className="text-xl font-semibold text-foreground">
            Consultor não encontrado
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            O consultor que você procura não está cadastrado ou o link está incorreto.
          </p>
          <Button asChild>
            <Link to="/consultores">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Voltar para consultores
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="space-y-5 animate-fade-in">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
          <Link to="/consultores">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Consultores Certificados
          </Link>
        </Button>

        <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-muted/40">
          <CardContent className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:gap-6">
            <div className="mx-auto aspect-[3/4] w-40 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-primary/10 shadow-md md:mx-0 md:w-40 lg:w-44">
              {consultant.photoUrl ? (
                <img
                  src={consultant.photoUrl}
                  alt={consultant.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-primary">
                  {initialsOf(consultant.name)}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-[28px]">
                  {consultant.name}
                </h1>
                <p className="text-sm text-muted-foreground md:text-base">
                  {consultant.headline}
                </p>
                {consultant.unit && (
                  <p className="inline-flex items-center gap-1.5 pt-0.5 text-xs font-medium text-foreground/80">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    {consultant.unit}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border/60 py-2.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Setor principal
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    <Briefcase className="h-3.5 w-3.5" />
                    {consultant.primarySector}
                  </span>
                </div>
                {consultant.secondarySector && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Setor complementar
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                      <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                      {consultant.secondarySector}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {consultant.city}/{consultant.state}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {consultant.email}
                </span>
                {consultant.linkedinUrl && (
                  <Button asChild variant="outline" size="sm" className="h-7 px-2.5 text-xs">
                    <a
                      href={consultant.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LinkedInIcon className="mr-1.5 h-3.5 w-3.5" /> LinkedIn
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Section icon={UserCircle2} title="Perfil Profissional">
          <RichText text={consultant.professionalProfile} />
        </Section>

        <Section icon={Briefcase} title="Experiência Setorial">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Setor principal
                </span>
                <span className="text-sm font-semibold text-primary">
                  {consultant.primarySector}
                </span>
              </div>
              {consultant.primarySectorExperience ? (
                <RichText text={consultant.primarySectorExperience} />
              ) : (
                <p className="text-sm italic text-muted-foreground/70">
                  Descrição da experiência ainda não preenchida.
                </p>
              )}
            </div>
            {consultant.secondarySector && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Setor complementar
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {consultant.secondarySector}
                  </span>
                </div>
                {consultant.secondarySectorExperience ? (
                  <RichText text={consultant.secondarySectorExperience} />
                ) : (
                  <p className="text-sm italic text-muted-foreground/70">
                    Descrição da experiência ainda não preenchida.
                  </p>
                )}
              </div>
            )}
          </div>
        </Section>

        <Section icon={Sparkles} title="Projetos Destaque">
          <RichText text={consultant.highlightProjects} />
        </Section>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section icon={Target} title="Dores que sei atacar">
            <RichText text={consultant.painsTackled} bulletColor="primary" />
          </Section>

          <Section icon={CheckCircle2} title="Áreas onde mais gero valor">
            <RichText text={consultant.valueAreas} bulletColor="value" />
          </Section>
        </div>

        <Section icon={Award} title="Competências e Áreas de Atuação">
          <RichText text={consultant.competencies} bulletColor="primary" />
        </Section>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section icon={GraduationCap} title="Formação">
            <RichText text={consultant.education} bulletColor="primary" />
          </Section>

          <Section icon={Languages} title="Idiomas">
            <RichText text={consultant.languages} bulletColor="primary" />
          </Section>
        </div>
      </section>
    </Layout>
  );
};

export default ConsultantDetail;
