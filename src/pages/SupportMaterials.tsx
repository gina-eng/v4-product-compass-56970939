import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";

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

  const handleOpenMaterial = (url: string) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <div>Carregando materiais...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Materiais de Apoio
          </h1>
          <p className="text-muted-foreground">
            Recursos padronizados para uso recorrente
          </p>
        </div>

        {materials.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum material encontrado
                </h3>
                <p className="text-muted-foreground">
                  Não há materiais de apoio adicionados ainda.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <Card key={material.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{material.nome_arquivo}</CardTitle>
                  <CardDescription>
                    Adicionado em {new Date(material.created_at).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleOpenMaterial(material.url_direcionamento)}
                    className="w-full"
                    variant="outline"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Acessar Material
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportMaterials;