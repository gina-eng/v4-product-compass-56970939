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
import ComoEntregoDisplay from "@/components/ComoEntregoDisplay";

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
    <div className="spacing-section">
      {/* Informações Operacionais */}
      {(productData?.o_que_entrego || productData?.como_entrego_dados?.length) && (
        <div className="spacing-card">
          <ComoEntregoDisplay 
            description={productData.o_que_entrego || ""}
            deliverySteps={productData.como_entrego_dados || []}
            title="Como eu entrego?"
          />
        </div>
      )}

      {/* Header com botão de adicionar */}
      <div className="flex items-center justify-between">
        <h4 className="text-title-card">Materiais Operacionais</h4>
        {!readOnly && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
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
                    <SelectContent className="z-50 bg-background">
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
                <div className="flex justify-end space-x-2 pt-4">
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
      </div>

      {/* Lista de materiais */}
      {materials.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-body text-muted-foreground">
            Nenhum material operacional cadastrado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {materials.map((material) => (
            <Card key={material.id} className="h-fit">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-body-small">
                        Operacional
                      </Badge>
                      {material.formato && (
                        <Badge variant="outline" className="text-body-small">
                          {material.formato === 'gravado' ? '🎥 Gravado' : '📄 Material'}
                        </Badge>
                      )}
                    </div>
                    <h5 className="text-title-sub leading-tight mb-2 pr-2">{material.name}</h5>
                    {material.description && (
                      <p className="text-body-small mb-2 leading-relaxed">{material.description}</p>
                    )}
                    <a 
                      href={material.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-body-small text-primary hover:underline break-all"
                    >
                      {material.url}
                    </a>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(material.url, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    {!readOnly && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(material)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(material.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OperationalMaterials;