import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";
import { Layout } from "@/components/Layout";
import { LoadingSpinner, EmptyState } from "@/components/LoadingStates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SupportMaterial {
  id: string;
  nome_arquivo: string;
  url_direcionamento: string;
  created_at: string;
}

const SupportMaterials = () => {
  const [materials, setMaterials] = useState<SupportMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('support_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os materiais de apoio.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Materiais de Apoio</h1>
            <p className="text-muted-foreground mt-2">
              Recursos padronizados para uso recorrente
            </p>
          </div>
        </div>

        {materials.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum material encontrado"
            description="Ainda não há materiais de apoio disponíveis. Entre em contato com o administrador para mais informações."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <Card key={material.id} className="card-hover animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {material.nome_arquivo}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Adicionado em {new Date(material.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full hover-scale"
                    onClick={() => window.open(material.url_direcionamento, '_blank')}
                    variant="outline"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Acessar Material
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SupportMaterials;