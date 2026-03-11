import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Plus, Trash2, X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AllowedLoginEmail = Database["public"]["Tables"]["allowed_login_emails"]["Row"];
type BatchUpsertResult = {
  email: string;
  action: string;
};

type BatchRow = {
  id: string;
  email: string;
  notes: string;
};

type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

const DEFAULT_EXTERNAL_PASSWORD = "v4@company";

const createBatchRow = (): BatchRow => ({
  id: crypto.randomUUID(),
  email: "",
  notes: "",
});

const initialEditForm = {
  email: "",
  notes: "",
  is_active: true,
};

const resolveSupabaseErrorMessage = (error: unknown) => {
  const fallback = "Verifique os e-mails informados e tente novamente.";

  if (!error || typeof error !== "object") return fallback;

  const parsed = error as SupabaseErrorLike;
  const code = parsed.code || "";
  const message = parsed.message || "";
  const details = parsed.details || "";
  const hint = parsed.hint || "";

  if (code === "PGRST202" || message.includes("Could not find the function")) {
    return "A função SQL admin_upsert_external_login_users não foi encontrada. Rode a migration mais recente no Supabase.";
  }

  if (message.toLowerCase().includes("permission denied")) {
    return "Permissão negada no banco. Verifique se as migrations de permissão e da RPC foram aplicadas.";
  }

  const composed = [message, details, hint].filter(Boolean).join(" ");
  return composed || fallback;
};

const AllowedLoginUsers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState<AllowedLoginEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [batchPassword, setBatchPassword] = useState(DEFAULT_EXTERNAL_PASSWORD);
  const [batchRows, setBatchRows] = useState<BatchRow[]>([createBatchRow()]);

  const fetchAllowedUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("allowed_login_emails")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Erro ao buscar usuários liberados:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível buscar os e-mails liberados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchAllowedUsers();
  }, [fetchAllowedUsers]);

  const resetBatchForm = () => {
    setBatchRows([createBatchRow()]);
    setBatchPassword(DEFAULT_EXTERNAL_PASSWORD);
  };

  const startEditUser = (user: AllowedLoginEmail) => {
    setEditingUserId(user.id);
    setEditForm({
      email: user.email,
      notes: user.notes || "",
      is_active: user.is_active,
    });
  };

  const resetEditForm = () => {
    setEditingUserId(null);
    setEditForm(initialEditForm);
  };

  const addBatchRow = () => {
    setBatchRows((current) => [...current, createBatchRow()]);
  };

  const updateBatchRow = (rowId: string, field: "email" | "notes", value: string) => {
    setBatchRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
  };

  const removeBatchRow = (rowId: string) => {
    setBatchRows((current) => {
      if (current.length === 1) {
        return [{ ...current[0], email: "", notes: "" }];
      }

      return current.filter((row) => row.id !== rowId);
    });
  };

  const handleSubmitBatch = async () => {
    const normalizedPassword = batchPassword.trim();
    const normalizedRows = batchRows
      .map((row) => ({
        email: row.email.trim().toLowerCase(),
        notes: row.notes.trim(),
      }))
      .filter((row) => row.email.length > 0);

    if (normalizedRows.length === 0) {
      toast({
        title: "Sem e-mails para adicionar",
        description: "Preencha ao menos um e-mail antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    if (normalizedPassword.length < 6) {
      toast({
        title: "Senha inválida",
        description: "A senha padrão precisa ter no mínimo 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    const deduplicatedByEmail = Array.from(
      new Map(normalizedRows.map((row) => [row.email, row])).values(),
    );
    const emails = deduplicatedByEmail.map((row) => row.email);
    const notes = deduplicatedByEmail.map((row) => row.notes);

    setIsSubmittingBatch(true);
    try {
      const { data, error } = await supabase.rpc("admin_upsert_external_login_users", {
        p_emails: emails,
        p_notes: notes,
        p_password: normalizedPassword,
      });

      if (error) throw error;

      const results = ((data as BatchUpsertResult[] | null) || []).filter((item) => item.email);
      const createdCount = results.filter((item) => item.action === "created").length;
      const updatedCount = results.filter((item) => item.action === "updated").length;

      toast({
        title: "Usuários processados",
        description: `${results.length} e-mails processados (${createdCount} novos, ${updatedCount} atualizados).`,
      });

      resetBatchForm();
      await fetchAllowedUsers();
    } catch (error) {
      console.error("Erro ao adicionar usuários em lote:", error);
      toast({
        title: "Erro ao adicionar usuários",
        description: resolveSupabaseErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUserId) return;

    const normalizedEmail = editForm.email.trim().toLowerCase();
    const normalizedNotes = editForm.notes.trim();

    if (!normalizedEmail) {
      toast({
        title: "E-mail obrigatório",
        description: "Informe um e-mail válido para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingEdit(true);
    try {
      const { error } = await supabase
        .from("allowed_login_emails")
        .update({
          email: normalizedEmail,
          notes: normalizedNotes || null,
          is_active: editForm.is_active,
        })
        .eq("id", editingUserId);

      if (error) throw error;

      toast({
        title: "Usuário atualizado",
        description: "As alterações foram salvas com sucesso.",
      });

      resetEditForm();
      await fetchAllowedUsers();
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      toast({
        title: "Erro ao salvar edição",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleStatus = async (user: AllowedLoginEmail) => {
    try {
      const { error } = await supabase
        .from("allowed_login_emails")
        .update({ is_active: !user.is_active })
        .eq("id", user.id);

      if (error) throw error;

      await fetchAllowedUsers();
      toast({
        title: "Status atualizado",
        description: !user.is_active ? "Usuário ativado." : "Usuário desativado.",
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro ao atualizar status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (user: AllowedLoginEmail) => {
    if (!window.confirm(`Remover ${user.email} da lista de acesso externo?`)) return;

    try {
      const { error } = await supabase
        .from("allowed_login_emails")
        .delete()
        .eq("id", user.id);

      if (error) throw error;

      if (editingUserId === user.id) {
        resetEditForm();
      }

      await fetchAllowedUsers();
      toast({
        title: "Usuário removido",
      });
    } catch (error) {
      console.error("Erro ao remover usuário:", error);
      toast({
        title: "Erro ao remover usuário",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout showHeader={true}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Usuários Externos Liberados</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie e-mails fora do domínio v4company com acesso por e-mail e senha.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Admin
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Adicionar múltiplos usuários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[minmax(240px,360px)_auto]">
              <div>
                <Label htmlFor="default-password">Senha padrão para os novos usuários</Label>
                <Input
                  id="default-password"
                  value={batchPassword}
                  onChange={(event) => setBatchPassword(event.target.value)}
                  placeholder="v4@company"
                />
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={addBatchRow} disabled={isSubmittingBatch}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo campo de e-mail
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {batchRows.map((row, index) => (
                <div key={row.id} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <div>
                    <Label htmlFor={`batch-email-${row.id}`}>E-mail {index + 1}</Label>
                    <Input
                      id={`batch-email-${row.id}`}
                      type="email"
                      value={row.email}
                      onChange={(event) => updateBatchRow(row.id, "email", event.target.value)}
                      placeholder="cliente@empresa.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`batch-notes-${row.id}`}>Observações</Label>
                    <Input
                      id={`batch-notes-${row.id}`}
                      value={row.notes}
                      onChange={(event) => updateBatchRow(row.id, "notes", event.target.value)}
                      placeholder="Ex: parceiro externo"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeBatchRow(row.id)}
                      disabled={isSubmittingBatch}
                      title="Remover campo"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleSubmitBatch} disabled={isSubmittingBatch}>
                <Plus className="mr-2 h-4 w-4" />
                {isSubmittingBatch ? "Adicionando..." : "Adicionar todos de uma vez"}
              </Button>
              <Button variant="outline" onClick={resetBatchForm} disabled={isSubmittingBatch}>
                Limpar campos
              </Button>
            </div>
          </CardContent>
        </Card>

        {editingUserId && (
          <Card>
            <CardHeader>
              <CardTitle>Editar usuário liberado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="edit-user-email">E-mail</Label>
                  <Input
                    id="edit-user-email"
                    type="email"
                    value={editForm.email}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="edit-user-notes">Observações</Label>
                  <Input
                    id="edit-user-notes"
                    value={editForm.notes}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, notes: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-user-active"
                  checked={editForm.is_active}
                  onCheckedChange={(checked) =>
                    setEditForm((current) => ({ ...current, is_active: checked === true }))
                  }
                />
                <Label htmlFor="edit-user-active">Usuário ativo</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} disabled={isSavingEdit}>
                  {isSavingEdit ? "Salvando..." : "Salvar alterações"}
                </Button>
                <Button variant="outline" onClick={resetEditForm} disabled={isSavingEdit}>
                  Cancelar edição
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lista de e-mails liberados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando usuários...</p>
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum e-mail externo cadastrado.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border/70">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Observações</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[380px] text-sm text-muted-foreground">
                          {user.notes || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleToggleStatus(user)}>
                              {user.is_active ? "Desativar" : "Ativar"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => startEditUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(user)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AllowedLoginUsers;
