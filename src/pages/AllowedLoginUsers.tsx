import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Plus, Trash2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type AllowedUsersGroup = {
  key: string;
  groupId: string | null;
  groupNote: string | null;
  users: AllowedLoginEmail[];
  createdAt: string;
};

type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

const DEFAULT_EXTERNAL_PASSWORD = "v4@company";
const EMAIL_SPLIT_REGEX = /[\n;,]+/g;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialEditForm = {
  email: "",
  notes: "",
  is_active: true,
};

const parseEmailLines = (value: string) => {
  return value
    .split(EMAIL_SPLIT_REGEX)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
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
  const [batchEmailsInput, setBatchEmailsInput] = useState("");
  const [batchGroupNote, setBatchGroupNote] = useState("");

  const parsedUniqueEmails = useMemo(
    () => Array.from(new Set(parseEmailLines(batchEmailsInput))),
    [batchEmailsInput],
  );

  const groupedUsers = useMemo<AllowedUsersGroup[]>(() => {
    const groups = new Map<string, AllowedUsersGroup>();

    users.forEach((user) => {
      const key = user.import_group_id ?? `single:${user.id}`;
      const currentGroup = groups.get(key);
      const groupNote = user.import_group_note ?? user.notes ?? null;

      if (!currentGroup) {
        groups.set(key, {
          key,
          groupId: user.import_group_id,
          groupNote,
          users: [user],
          createdAt: user.created_at,
        });
        return;
      }

      currentGroup.users.push(user);

      if (!currentGroup.groupNote && groupNote) {
        currentGroup.groupNote = groupNote;
      }

      if (new Date(user.created_at).getTime() > new Date(currentGroup.createdAt).getTime()) {
        currentGroup.createdAt = user.created_at;
      }
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        users: [...group.users].sort((a, b) => a.email.localeCompare(b.email)),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [users]);

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
    setBatchEmailsInput("");
    setBatchGroupNote("");
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

  const handleSubmitBatch = async () => {
    const normalizedPassword = batchPassword.trim();
    const normalizedGroupNote = batchGroupNote.trim();
    const emails = parsedUniqueEmails;

    if (emails.length === 0) {
      toast({
        title: "Sem e-mails para adicionar",
        description: "Cole ao menos um e-mail (um por linha) antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    const invalidEmails = emails.filter((email) => !EMAIL_REGEX.test(email));
    if (invalidEmails.length > 0) {
      toast({
        title: "E-mails inválidos",
        description: `Revise os e-mails inválidos: ${invalidEmails.slice(0, 3).join(", ")}`,
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

    const notes = emails.map(() => normalizedGroupNote);
    const groupId = crypto.randomUUID();

    setIsSubmittingBatch(true);
    try {
      const { data, error } = await supabase.rpc("admin_upsert_external_login_users", {
        p_emails: emails,
        p_notes: notes,
        p_password: normalizedPassword,
        p_group_id: groupId,
        p_group_note: normalizedGroupNote || null,
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
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="default-password">Senha padrão para os novos usuários</Label>
                <Input
                  id="default-password"
                  value={batchPassword}
                  onChange={(event) => setBatchPassword(event.target.value)}
                  placeholder="v4@company"
                />
              </div>

              <div>
                <Label htmlFor="batch-group-note">Observação para todo o grupo</Label>
                <Input
                  id="batch-group-note"
                  value={batchGroupNote}
                  onChange={(event) => setBatchGroupNote(event.target.value)}
                  placeholder="Ex: Equipe parceira ACME"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch-emails-input">E-mails (um por linha)</Label>
              <Textarea
                id="batch-emails-input"
                value={batchEmailsInput}
                onChange={(event) => setBatchEmailsInput(event.target.value)}
                placeholder={"cliente1@empresa.com\ncliente2@empresa.com\ncliente3@empresa.com"}
                className="min-h-[180px]"
              />
              <p className="text-xs text-muted-foreground">
                {parsedUniqueEmails.length} e-mails únicos prontos para processamento.
              </p>
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
              <div className="space-y-4">
                {groupedUsers.map((group) => (
                  <div key={group.key} className="overflow-hidden rounded-xl border border-border/70">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 bg-muted/20 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <Badge variant={group.groupId ? "default" : "secondary"}>
                          {group.groupId ? "Grupo" : "Individual"}
                        </Badge>
                        <p className="truncate text-sm font-medium">
                          {group.groupId
                            ? group.groupNote || "Grupo sem observação"
                            : group.users[0]?.notes || "Sem observação"}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {group.users.length} {group.users.length === 1 ? "usuário" : "usuários"}
                      </p>
                    </div>

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
                        {group.users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.is_active ? "default" : "secondary"}>
                                {user.is_active ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[380px] text-sm text-muted-foreground">
                              {user.notes || group.groupNote || "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleStatus(user)}
                                >
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AllowedLoginUsers;
