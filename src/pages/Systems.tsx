import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cog, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingStates";

interface SystemConnection {
  id: string;
  nome_sistema: string;
  valor_entregue: string;
  link_redirecionamento: string;
}

const Systems = () => {
  const [systems, setSystems] = useState<SystemConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystems();
  }, []);

  const fetchSystems = async () => {
    try {
      const { data, error } = await supabase
        .from("systems")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSystems((data || []) as SystemConnection[]);
    } catch (error) {
      console.error("Erro ao carregar sistemas:", error);
      setSystems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="space-y-8 animate-fade-in">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Sistemas</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acesse os sistemas conectados e navegue para cada ambiente.
          </p>
        </header>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : systems.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {systems.map((system) => (
              <Card
                key={system.id}
                className="border-border/80 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardHeader>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Cog className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">{system.nome_sistema}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {system.valor_entregue}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(system.link_redirecionamento, "_blank")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Acessar Sistema
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </section>
    </Layout>
  );
};

export default Systems;
