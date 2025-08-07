import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const StatusReport = () => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [statusData, setStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');
        
        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        const formattedData = data?.map(product => ({
          id: product.id,
          produto: product.produto,
          categoria: product.categoria,
          duracao: product.duracao,
          dono: product.dono,
          pitch: product.pitch,
          bpmn: product.bpmn,
          playbook: product.playbook,
          icp: product.icp,
          pricing: product.pricing,
          certificacao: product.certificacao,
          status: product.status
        })) || [];
        
        setStatusData(formattedData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filters = [
    { key: "all", label: "Todos", color: "default" },
    { key: "saber", label: "SABER", color: "saber" },
    { key: "ter", label: "TER", color: "ter" },
    { key: "executar", label: "EXECUTAR", color: "executar" },
    { key: "potencializar", label: "POTENCIALIZAR", color: "potencializar" }
  ];

  const filteredData = activeFilter === "all" 
    ? statusData 
    : statusData.filter(item => item.categoria === activeFilter);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "Disponível": { variant: "default" as const, color: "bg-green-100 text-green-800" },
      "Em produção": { variant: "secondary" as const, color: "bg-purple-100 text-purple-800" },
      "Em homologação": { variant: "outline" as const, color: "bg-yellow-100 text-yellow-800" }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig["Disponível"];
  };

  const getCategoryColor = (categoria: string) => {
    const colors = {
      "saber": "saber",
      "ter": "ter", 
      "executar": "executar",
      "potencializar": "potencializar"
    };
    return colors[categoria as keyof typeof colors] || "saber";
  };

  const getCategoryLabel = (categoria: string) => {
    const labels = {
      "saber": "SABER",
      "ter": "TER", 
      "executar": "EXECUTAR",
      "potencializar": "POTENCIALIZAR"
    };
    return labels[categoria as keyof typeof labels] || categoria.toUpperCase();
  };

  const StatusIcon = ({ value }: { value: boolean }) => (
    value ? (
      <Check className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-red-400" />
    )
  );

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Portfólio Status Report</h2>
          <p className="text-muted-foreground mb-8 text-justify">Painel administrativo para controle de produtos e status</p>
          
          {/* Filtros */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {filters.map((filter) => (
              <Button
                key={filter.key}
                variant={activeFilter === filter.key ? filter.color as any : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.key)}
                className="transition-all duration-200"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      Duração (dias)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      Dono
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                      Pitch
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                      BPMN
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                      Playbook
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                      ICP
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                      Pricing
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                      Certificação
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-semibold text-foreground leading-5 break-words">
                            {item.produto}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant="secondary"
                          className="text-white"
                          style={{backgroundColor: `hsl(var(--${getCategoryColor(item.categoria)}))`}}
                        >
                          {getCategoryLabel(item.categoria)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{item.duracao}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{item.dono}</td>
                      <td className="px-6 py-4 text-center">
                        <StatusIcon value={item.pitch} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusIcon value={item.bpmn} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusIcon value={item.playbook} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusIcon value={item.icp} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusIcon value={item.pricing} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusIcon value={item.certificacao} />
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status).color}`}>
                          {item.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {!loading && filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum produto encontrado para esta categoria.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default StatusReport;