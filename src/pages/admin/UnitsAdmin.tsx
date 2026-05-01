import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  createUnit,
  deleteUnit,
  listUnits,
  updateUnit,
  type V4Unit,
} from "@/features/units/storage";
import { Pencil, Plus, Trash2, X, Check } from "lucide-react";

const UnitsAdmin = () => {
  const { toast } = useToast();
  const [units, setUnits] = useState<V4Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<V4Unit | null>(null);

  const refresh = async () => {
    setLoading(true);
    setUnits(await listUnits());
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      await createUnit(name);
      setNewName("");
      await refresh();
      toast({ title: "Unidade adicionada" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar",
        description: err instanceof Error ? err.message : "",
      });
    }
  };

  const handleSaveEdit = async (id: string) => {
    const name = editingName.trim();
    if (!name) return;
    try {
      await updateUnit(id, name);
      setEditingId(null);
      setEditingName("");
      await refresh();
      toast({ title: "Unidade atualizada" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: err instanceof Error ? err.message : "",
      });
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteUnit(pendingDelete.id);
      setPendingDelete(null);
      await refresh();
      toast({ title: "Unidade removida" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao remover",
        description: err instanceof Error ? err.message : "",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl space-y-6 py-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Unidades V4</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie a lista de unidades disponíveis nos formulários de cases e consultores.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Adicionar nova unidade</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex.: V4 São Paulo - Pinheiros"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleCreate();
                }
              }}
            />
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              <Plus className="mr-1.5 h-4 w-4" /> Adicionar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Unidades cadastradas ({units.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : units.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma unidade cadastrada ainda.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-32 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        {editingId === u.id ? (
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                void handleSaveEdit(u.id);
                              }
                              if (e.key === "Escape") {
                                setEditingId(null);
                                setEditingName("");
                              }
                            }}
                          />
                        ) : (
                          u.name
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === u.id ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => void handleSaveEdit(u.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(null);
                                setEditingName("");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(u.id);
                                setEditingName(u.name);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setPendingDelete(u)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover unidade?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.name}" será removida da lista. Cases e consultores já
              cadastrados com essa unidade não serão alterados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default UnitsAdmin;
