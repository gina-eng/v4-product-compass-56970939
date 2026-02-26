import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { ArrowRight, BookMarked, Network, Package, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Index = () => {
  const { settings } = useSiteSettings();

  const homeCards = [
    {
      title: "Portfólio de Produtos",
      description: "Visualize produtos em cards e lista, com busca e filtros por categoria e status.",
      href: "/portfolio-produtos",
      icon: Package,
      cta: "Acessar",
    },
    {
      title: "Sistemas Operacionais",
      description: "Gerencie estrutura de produtos, posições, materiais e configurações da operação.",
      href: "/sistemas",
      icon: Settings2,
      cta: "Acessar",
    },
    {
      title: "Stack Digital",
      description: "Centralize plataformas da stack parceira com score operacional, links úteis e avaliação.",
      href: "/stack-digital",
      icon: Network,
      cta: "Acessar",
    },
    {
      title: "Artefatos",
      description: "Consulte artefatos e materiais de apoio para execução padronizada no dia a dia.",
      href: "/materiais-apoio",
      icon: BookMarked,
      cta: "Acessar",
    },
  ];

  const stepCards = [
    {
      code: "S",
      title: "SABER",
      subtitle: settings.saber_subtitle,
      description: settings.saber_description,
      tone: "border-saber/40 bg-saber/5 text-saber",
    },
    {
      code: "T",
      title: "TER",
      subtitle: settings.ter_subtitle,
      description: settings.ter_description,
      tone: "border-ter/40 bg-ter/5 text-ter",
    },
    {
      code: "E",
      title: "EXECUTAR",
      subtitle: settings.executar_subtitle,
      description: settings.executar_description,
      tone: "border-executar/40 bg-executar/5 text-executar",
    },
    {
      code: "P",
      title: "POTENCIALIZAR",
      subtitle: settings.potencializar_subtitle,
      description: settings.potencializar_description,
      tone: "border-potencializar/40 bg-potencializar/5 text-potencializar",
    },
  ];

  return (
    <Layout>
      <section className="space-y-10 animate-fade-in">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Visão Geral</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Selecione uma área para continuar.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {homeCards.map((item) => (
            <Card
              key={item.title}
              className="border-border/80 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardHeader>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                <Button asChild className="w-full justify-between rounded-xl">
                  <Link to={item.href}>
                    {item.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="space-y-5">
          <header>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {settings.step_title}
            </h2>
            <div className="mt-2 max-w-4xl space-y-3 text-sm leading-relaxed text-muted-foreground">
              {settings.step_description.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stepCards.map((item) => (
              <Card key={item.title} className={`border ${item.tone}`}>
                <CardHeader className="space-y-2">
                  <p className="text-sm font-semibold">
                    {item.code} - {item.title}
                  </p>
                  <CardTitle className="text-base text-foreground">"{item.subtitle}"</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </section>
    </Layout>
  );
};

export default Index;
