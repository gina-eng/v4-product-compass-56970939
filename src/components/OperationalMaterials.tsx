import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ExternalLink, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import ComoEntregoTable from "@/components/ComoEntregoTable";

interface Material {
  id: string;
  name: string;
  type: 'operacional';
  url: string;
  description?: string;
  formato?: 'gravado' | 'material';
}

interface OperationalMaterialsProps {
  productId: string;
  readOnly?: boolean;
  productData?: {
    o_que_entrego?: string;
    como_entrego_dados?: any[];
  };
  positions?: any[];
}

const OperationalMaterials = ({ productId, readOnly = false, productData, positions }: OperationalMaterialsProps) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
    formato: "material" as 'gravado' | 'material'
  });

  useEffect(() => {
    fetchMaterials();
  }, [productId]);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('training_materials')
        .select('*')
        .eq('product_id', productId)
        .eq('type', 'operacional')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMaterials((data || []) as Material[]);
    } catch (error) {
      console.error('Erro ao buscar materiais operacionais:', error);
      toast.error('Erro ao carregar materiais operacionais');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.url) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingMaterial) {
        const { error } = await supabase
          .from('training_materials')
          .update({
            name: formData.name,
            url: formData.url,
            description: formData.description || null,
            formato: formData.formato
          })
          .eq('id', editingMaterial.id);

        if (error) throw error;
        toast.success('Material operacional atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('training_materials')
          .insert({
            product_id: productId,
            name: formData.name,
            type: 'operacional',
            url: formData.url,
            description: formData.description || null,
            formato: formData.formato
          });

        if (error) throw error;
        toast.success('Material operacional adicionado com sucesso');
      }

      setDialogOpen(false);
      setEditingMaterial(null);
      setFormData({ name: "", url: "", description: "", formato: "material" });
      fetchMaterials();
    } catch (error) {
      console.error('Erro ao salvar material:', error);
      toast.error('Erro ao salvar material operacional');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este material operacional?')) return;

    try {
      const { error } = await supabase
        .from('training_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Material operacional excluído com sucesso');
      fetchMaterials();
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      toast.error('Erro ao excluir material operacional');
    }
  };

  const openEditDialog = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      url: material.url,
      description: material.description || "",
      formato: material.formato || "material"
    });
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingMaterial(null);
    setFormData({ name: "", url: "", description: "", formato: "material" });
    setDialogOpen(true);
  };

  if (loading) {
    return <div>Carregando materiais operacionais...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Informações para Operar</CardTitle>
        {!readOnly && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingMaterial ? 'Editar Material' : 'Novo Material Operacional'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Material *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Manual de Operação - Produto X"
                  />
                </div>
                <div>
                  <Label htmlFor="formato">Formato *</Label>
                  <Select value={formData.formato} onValueChange={(value) => setFormData(prev => ({ ...prev, formato: value as 'gravado' | 'material' }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gravado">Material Gravado (Vídeo)</SelectItem>
                      <SelectItem value="material">Material Físico (PPT, PDF, etc.)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="url">URL do Material *</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição opcional do material"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    {editingMaterial ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {/* Informações Operacionais */}
        {(productData?.o_que_entrego || productData?.como_entrego_dados?.length) && (
          <div className="space-y-4 mb-6">
            {productData.o_que_entrego && (
              <div>
                <span className="text-sm font-bold text-foreground">"O que entrego"</span>
                <div className="text-sm mt-2 text-content whitespace-pre-line leading-relaxed">{productData.o_que_entrego}</div>
              </div>
            )}
            
            {productData.como_entrego_dados && productData.como_entrego_dados.length > 0 && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-bold text-foreground mb-4">Etapas de Entrega</h4>
                <ComoEntregoTable 
                  data={productData.como_entrego_dados || []} 
                  readOnly={true}
                  positions={positions || []}
                />
              </div>
            )}
          </div>
        )}

        {/* Materiais Operacionais */}
        <div>
          <h4 className="font-bold text-foreground mb-4">Materiais Operacionais</h4>
          {materials.length === 0 ? (
            <p className="text-content text-center py-8">
              Nenhum material operacional cadastrado para este produto.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((material) => (
                <Card key={material.id} className="h-fit">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="mb-2">
                          Operacional
                        </Badge>
                        {material.formato && (
                          <Badge variant="outline" className="mb-2 text-xs">
                            {material.formato === 'gravado' ? '🎥 Gravado' : '📄 Material'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(material.url, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {!readOnly && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(material)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(material.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-base leading-tight">{material.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {material.description && (
                      <p className="text-sm text-content mb-3 leading-relaxed">{material.description}</p>
                    )}
                    <a 
                      href={material.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline break-all"
                    >
                      {material.url}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationalMaterials;