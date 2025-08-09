import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ExternalLink, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface SalesMaterial {
  id: string;
  name: string;
  type: 'comercial';
  url: string;
  description?: string;
}

interface SalesMaterialsProps {
  productId: string;
  readOnly?: boolean;
}

const SalesMaterials = ({ productId, readOnly = false }: SalesMaterialsProps) => {
  const [materials, setMaterials] = useState<SalesMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<SalesMaterial | null>(null);
  const [formData, setFormData] = useState({
    name: "",
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
        .eq('type', 'comercial')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMaterials((data || []) as SalesMaterial[]);
    } catch (error) {
      console.error('Erro ao buscar materiais de vendas:', error);
      toast.error('Erro ao carregar materiais de vendas');
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
            description: formData.description || null
          })
          .eq('id', editingMaterial.id);

        if (error) throw error;
        toast.success('Material de vendas atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('training_materials')
          .insert({
            product_id: productId,
            name: formData.name,
            type: 'comercial',
            url: formData.url,
            description: formData.description || null
          });

        if (error) throw error;
        toast.success('Material de vendas adicionado com sucesso');
      }

      setDialogOpen(false);
      setEditingMaterial(null);
      setFormData({ name: "", url: "", description: "" });
      fetchMaterials();
    } catch (error) {
      console.error('Erro ao salvar material:', error);
      toast.error('Erro ao salvar material de vendas');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este material de vendas?')) return;

    try {
      const { error } = await supabase
        .from('training_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Material de vendas excluído com sucesso');
      fetchMaterials();
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      toast.error('Erro ao excluir material de vendas');
    }
  };

  const openEditDialog = (material: SalesMaterial) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      url: material.url,
      description: material.description || ""
    });
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingMaterial(null);
    setFormData({ name: "", url: "", description: "" });
    setDialogOpen(true);
  };

  if (loading) {
    return <div>Carregando materiais de vendas...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Materiais de Vendas</CardTitle>
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
                  {editingMaterial ? 'Editar Material' : 'Novo Material de Vendas'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Material *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Pitch de Vendas - Produto X"
                  />
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
            Nenhum material de vendas cadastrado para este produto.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((material) => (
              <Card key={material.id} className="h-fit">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="default" className="mb-2">
                      Comercial
                    </Badge>
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
      </CardContent>
    </Card>
  );
};

export default SalesMaterials;