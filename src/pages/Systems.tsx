import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cog, Database, ShieldCheck } from "lucide-react";

const systemsAreas = [
  {
    title: "Integrações",
    description: "Gerencie conexões e fluxos entre as ferramentas do ecossistema.",
    icon: Database,
  },
  {
    title: "Configurações Técnicas",
    description: "Centralize parâmetros operacionais e padrões da plataforma.",
    icon: Cog,
  },
  {
    title: "Governança",
    description: "Acompanhe acessos, regras e políticas de uso dos sistemas.",
    icon: ShieldCheck,
  },
];

const Systems = () => {
  return (
    <Layout>
      <section className="space-y-8 animate-fade-in">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Sistemas</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Nova página dedicada para módulos e gestão técnica dos sistemas.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {systemsAreas.map((area) => (
            <Card
              key={area.title}
              className="border-border/80 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardHeader>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <area.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">{area.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{area.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Systems;
