import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock } from "lucide-react";

const StatusReport = () => {
  const statusData = [
    {
      id: "1",
      produto: "Diagnóstico de Mídia Paga (Meta e Google Ads)",
      categoria: "Saber",
      duracao: "15-30",
      dono: "Paulo Barros",
      pitch: true,
      bpmn: true,
      playbook: false,
      icp: true,
      pricing: false,
      certificacao: false,
      status: "Em produção"
    },
    {
      id: "2", 
      produto: "E-commerce",
      categoria: "Ter",
      duracao: "45-60",
      dono: "Oriana Finta",
      pitch: false,
      bpmn: false,
      playbook: true,
      icp: false,
      certificacao: true,
      pricing: true,
      status: "Disponível"
    },
    {
      id: "3",
      produto: "Profissional de Google Ads",
      categoria: "Executar",
      duracao: "30-45",
      dono: "Maria Silva",
      pitch: true,
      bpmn: true,
      playbook: true,
      icp: true,
      pricing: false,
      certificacao: false,
      status: "Em homologação"
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "Disponível": { variant: "default" as const, color: "bg-green-100 text-green-800" },
      "Em produção": { variant: "secondary" as const, color: "bg-blue-100 text-blue-800" },
      "Em homologação": { variant: "outline" as const, color: "bg-yellow-100 text-yellow-800" }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig["Disponível"];
  };

  const getCategoryColor = (categoria: string) => {
    const colors = {
      "Saber": "saber",
      "Ter": "ter", 
      "Executar": "executar",
      "Potencializar": "potencializar"
    };
    return colors[categoria as keyof typeof colors] || "saber";
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
          <p className="text-gray-600">Painel administrativo para controle de produtos e status</p>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duração (dias)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dono
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pitch
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BPMN
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Playbook
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ICP
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pricing
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certificação
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statusData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.produto}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant="secondary"
                        className="text-white"
                        style={{backgroundColor: `hsl(var(--${getCategoryColor(item.categoria)}))`}}
                      >
                        {item.categoria}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.duracao}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.dono}</td>
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
      </div>
    </section>
  );
};

export default StatusReport;