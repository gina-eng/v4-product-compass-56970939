import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CloudUpload,
  Save,
  Sparkles,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  LOCAL_PREVIEW_EMAIL,
  isLocalPreviewAuthEnabled,
} from "@/lib/auth";
import { StepIndicator } from "@/features/cases/components/StepIndicator";
import { Step1Identification } from "@/features/cases/steps/Step1Identification";
import { Step2Classification } from "@/features/cases/steps/Step2Classification";
import { Step3Context } from "@/features/cases/steps/Step3Context";
import { Step4Strategy } from "@/features/cases/steps/Step4Strategy";
import { Step5Results } from "@/features/cases/steps/Step5Results";
import { Step6Evidence } from "@/features/cases/steps/Step6Evidence";
import { STEPS } from "@/features/cases/options";
import { emptyCase } from "@/features/cases/types";
import type { CaseRecord } from "@/features/cases/types";
import { getCase, upsertCase } from "@/features/cases/storage";
import {
  computeFinalStatus,
  getStepCompletion,
  isStepReachable,
  validateStep,
} from "@/features/cases/validation";
import type { StepCompletion } from "@/features/cases/validation";
import { formatRelativeDate } from "@/features/cases/format";

const CaseForm = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const [record, setRecord] = useState<CaseRecord>(() => emptyCase());
  const [showStepErrors, setShowStepErrors] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const seedEmail = async () => {
      let email = "";
      if (isLocalPreviewAuthEnabled()) {
        email = LOCAL_PREVIEW_EMAIL;
      } else {
        const { data } = await supabase.auth.getSession();
        email = data.session?.user.email ?? "";
      }

      if (id) {
        const existing = await getCase(id);
        if (existing) {
          setRecord(existing);
          return;
        }
      }
      setRecord((prev) => ({ ...prev, ownerEmail: email || prev.ownerEmail }));
    };
    void seedEmail();
  }, [id]);

  useEffect(() => {
    if (!record.ownerEmail) return;
    if (submitted) return;
    const handle = window.setTimeout(() => {
      void upsertCase(record).then((saved) => setLastSavedAt(saved.updatedAt)).catch((err) => console.error("Erro ao auto-salvar:", err));
    }, 600);
    return () => window.clearTimeout(handle);
  }, [record, submitted]);

  const update = (patch: Partial<CaseRecord>) => {
    setRecord((prev) => ({ ...prev, ...patch }));
  };

  const currentValidation = useMemo(
    () => validateStep(record.currentStep, record),
    [record],
  );

  const completion = useMemo(() => {
    const map: Record<number, StepCompletion> = {};
    STEPS.forEach((s) => {
      map[s.id] = getStepCompletion(s.id, record);
    });
    return map;
  }, [record]);

  const completeCount = useMemo(
    () => Object.values(completion).filter((s) => s === "complete").length,
    [completion],
  );

  const overallProgress = Math.round((completeCount / STEPS.length) * 100);

  const goToStep = (step: number) => {
    if (step < 1 || step > STEPS.length) return;
    if (step > record.currentStep && !currentValidation.isValid) {
      setShowStepErrors(true);
      return;
    }
    if (!isStepReachable(step, record) && step > record.currentStep) {
      setShowStepErrors(true);
      return;
    }
    setShowStepErrors(false);
    setRecord((prev) => ({ ...prev, currentStep: step }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    if (!currentValidation.isValid) {
      setShowStepErrors(true);
      toast({
        variant: "destructive",
        title: "Faltam campos obrigatórios",
        description: "Revise os campos destacados antes de continuar.",
      });
      return;
    }
    if (record.currentStep === STEPS.length) {
      handleSubmit();
      return;
    }
    goToStep(record.currentStep + 1);
  };

  const handleSaveDraft = async () => {
    try {
      const saved = await upsertCase({ ...record, status: "rascunho" });
      setLastSavedAt(saved.updatedAt);
      toast({ title: "Rascunho salvo", description: "Você pode retomar este case a qualquer momento." });
    } catch (err) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: err instanceof Error ? err.message : "" });
    }
  };

  const handleSubmit = async () => {
    for (let i = 1; i <= STEPS.length; i += 1) {
      if (!validateStep(i, record).isValid) {
        toast({
          variant: "destructive",
          title: `Etapa ${i} incompleta`,
          description: "Volte e preencha os campos obrigatórios para finalizar o registro.",
        });
        setRecord((prev) => ({ ...prev, currentStep: i }));
        setShowStepErrors(true);
        return;
      }
    }
    const finalStatus = computeFinalStatus(record);
    try {
      await upsertCase({ ...record, status: finalStatus });
      setSubmitted(true);
      toast({
        title: "Case registrado!",
        description:
          finalStatus === "completo"
            ? "Já está disponível na base."
            : "Registrado sem evidência — fica pendente de curadoria.",
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Erro ao registrar case", description: err instanceof Error ? err.message : "" });
    }
  };

  if (submitted) {
    const finalStatus = computeFinalStatus(record);
    return (
      <Layout>
        <section className="mx-auto flex max-w-2xl flex-col items-center gap-5 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ter/10 text-ter">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Case registrado</h1>
            <p className="text-sm text-muted-foreground">
              {finalStatus === "completo"
                ? "Tudo certo. O case já está disponível para outros investidores e para a Zyman AI."
                : "Registrado, mas sem evidência. Fica pendente de curadoria — adicione um link quando puder para destravá-lo."}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link to={`/cases/${record.id}`}>Ver case publicado</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/cases">Voltar para lista</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/cases/novo">Registrar outro</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  const stepMeta = STEPS[record.currentStep - 1];
  const isLastStep = record.currentStep === STEPS.length;

  return (
    <Layout>
      <section className="space-y-6 animate-fade-in">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1.5">
            <Link
              to="/cases"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar para Zyman AI (Cases)
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Registrar novo case
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Cases viram munição comercial e alimentam a Zyman AI. Quanto mais estruturada a
              entrada, mais útil a saída.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Progresso
              </p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-32 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-foreground">{overallProgress}%</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSaveDraft}>
              <Save className="mr-1.5 h-3.5 w-3.5" /> Salvar rascunho
            </Button>
          </div>
        </header>

        <StepIndicator
          currentStep={record.currentStep}
          completion={completion}
          onJump={goToStep}
        />

        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                Etapa {record.currentStep} de {STEPS.length}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">{stepMeta.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{stepMeta.subtitle}</p>
            </div>
            {lastSavedAt && (
              <div className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1 text-[11px] text-muted-foreground sm:flex">
                <CloudUpload className="h-3 w-3" />
                Salvo {formatRelativeDate(lastSavedAt)}
              </div>
            )}
          </div>

          {record.currentStep === 1 && (
            <div className="space-y-8">
              <Step1Identification
                record={record}
                errors={showStepErrors ? currentValidation.errors : {}}
                update={update}
              />
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Classificação do case
                </span>
                <span className="h-px flex-1 bg-border/60" />
              </div>
              <Step2Classification
                record={record}
                errors={showStepErrors ? currentValidation.errors : {}}
                update={update}
              />
            </div>
          )}
          {record.currentStep === 2 && (
            <Step3Context
              record={record}
              errors={showStepErrors ? currentValidation.errors : {}}
              update={update}
            />
          )}
          {record.currentStep === 3 && (
            <Step4Strategy
              record={record}
              errors={showStepErrors ? currentValidation.errors : {}}
              update={update}
            />
          )}
          {record.currentStep === 4 && (
            <Step5Results
              record={record}
              errors={showStepErrors ? currentValidation.errors : {}}
              update={update}
            />
          )}
          {record.currentStep === 5 && (
            <Step6Evidence
              record={record}
              errors={showStepErrors ? currentValidation.errors : {}}
              update={update}
            />
          )}
        </div>

        <div className="sticky bottom-3 z-30 flex flex-col items-stretch gap-2 rounded-2xl border border-border/70 bg-card/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            disabled={record.currentStep === 1}
            onClick={() => goToStep(record.currentStep - 1)}
            className="justify-start"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Anterior
          </Button>
          <div className="flex items-center gap-2">
            {!isLastStep ? (
              <Button onClick={handleNext}>
                Próxima etapa
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                <Sparkles className="mr-1.5 h-4 w-4" /> Finalizar registro
              </Button>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CaseForm;
