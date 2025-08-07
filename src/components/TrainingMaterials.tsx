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

interface TrainingMaterial {
  id: string;
  name: string;
  type: 'comercial' | 'operacional';
  url: string;
  description?: string;
}

interface TrainingMaterialsProps {
  productId: string;
  readOnly?: boolean;
}

const TrainingMaterials = ({ productId, readOnly = false }: TrainingMaterialsProps) => {
  const [materials, setMaterials] = useState<TrainingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<TrainingMaterial | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "" as 'comercial' | 'operacional' | "",
    url: "",
    description: ""
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
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMaterials((data || []) as TrainingMaterial[]);
    } catch (error) {
      console.error('Erro ao buscar materiais de treinamento:', error);
      toast.error('Erro ao carregar materiais de treinamento');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.type || !formData.url) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingMaterial) {
        const { error } = await supabase
          .from('training_materials')
          .update({
            name: formData.name,
            type: formData.type,
            url: formData.url,
            description: formData.description || null
          })
          .eq('id', editingMaterial.id);

        if (error) throw error;
        toast.success('Material de treinamento atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('training_materials')
          .insert({
            product_id: productId,
            name: formData.name,
            type: formData.type,
            url: formData.url,
            description: formData.description || null
          });

        if (error) throw error;
        toast.success('Material de treinamento adicionado com sucesso');
      }

      setDialogOpen(false);
      setEditingMaterial(null);
      setFormData({ name: "", type: "", url: "", description: "" });
      fetchMaterials();
    } catch (error) {
      console.error('Erro ao salvar material:', error);
      toast.error('Erro ao salvar material de treinamento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este material de treinamento?')) return;

    try {
      const { error } = await supabase
        .from('training_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Material de treinamento excluído com sucesso');
      fetchMaterials();
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      toast.error('Erro ao excluir material de treinamento');
    }
  };

  const openEditDialog = (material: TrainingMaterial) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      type: material.type,
      url: material.url,
      description: material.description || ""
    });
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingMaterial(null);
    setFormData({ name: "", type: "", url: "", description: "" });
    setDialogOpen(true);
  };

  if (loading) {
    return <div>Carregando materiais de treinamento...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Materiais de Treinamento e Documentos</CardTitle>
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
                  {editingMaterial ? 'Editar Material' : 'Novo Material de Treinamento'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Material *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Treinamento Comercial - Produto X"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'comercial' | 'operacional' }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="operacional">Operacional</SelectItem>
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
        {materials.length === 0 ? (
          <p className="text-content text-center py-8">
            Nenhum material de treinamento cadastrado para este produto.
          </p>
        ) : (
          <div className="space-y-4">
            {materials.map((material) => (
              <div key={material.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-foreground">{material.name}</h4>
                    <Badge variant={material.type === 'comercial' ? 'default' : 'secondary'}>
                      {material.type === 'comercial' ? 'Comercial' : 'Operacional'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(material.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {!readOnly && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(material)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(material.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {material.description && (
                  <p className="text-sm text-content">{material.description}</p>
                )}
                <a 
                  href={material.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline block"
                >
                  {material.url}
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrainingMaterials;