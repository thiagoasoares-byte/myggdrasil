/*
 * Myggdrasil — Perfil
 * Design: Editorial Dark Orgânico — Jardim Noturno
 * Gerenciamento de conta do usuário
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  PasswordChecklist,
  isPasswordStrong,
} from "@/components/ui/password-checklist";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  User,
  Trash2,
  LogOut,
  KeyRound,
} from "lucide-react";
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
import { motion } from "framer-motion";

function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <path
        d="M16 28V14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 14L10 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 14L22 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="8" r="2.5" fill="currentColor" opacity="0.6" />
      <circle cx="16" cy="4" r="2.5" fill="currentColor" opacity="0.8" />
      <circle cx="22" cy="8" r="2.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export default function Profile() {
  const { user, updateProfile, changePassword, deleteAccount, logout } =
    useAuth();
  const [, setLocation] = useLocation();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [birthDt, setBirthDt] = useState(user?.birth_dt || "");
  const [password, setPassword] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordStrong(newPassword)) {
      toast.error("A nova senha ainda não atende todos os requisitos");
      return;
    }
    setLoadingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Senha atualizada");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erro ao trocar a senha";
      toast.error(typeof msg === "string" ? msg : msg[0]);
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingUpdate(true);
    try {
      await updateProfile({
        name: name || undefined,
        email: email || undefined,
        birth_dt: birthDt || undefined,
      });
      toast.success("Perfil atualizado");
    } catch (err: any) {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      await deleteAccount(password);
      toast.success("Conta excluída");
      setLocation("/login");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Senha incorreta";
      toast.error(typeof msg === "string" ? msg : msg[0]);
    } finally {
      setLoadingDelete(false);
      setDeleteOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="flex items-center gap-3 px-5 lg:px-8 py-3.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="font-serif text-lg font-bold text-foreground tracking-tight">
            Perfil
          </span>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="max-w-xl mx-auto px-6 py-10 space-y-10"
      >
        {/* Profile form */}
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-5">
            // informações pessoais
          </h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="profile-name"
                className="font-mono text-[11px] uppercase tracking-wider"
              >
                Nome
              </Label>
              <Input
                id="profile-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={user?.name}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="profile-email"
                className="font-mono text-[11px] uppercase tracking-wider"
              >
                E-mail
              </Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={user?.email}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="profile-birth"
                className="font-mono text-[11px] uppercase tracking-wider"
              >
                Data de nascimento
              </Label>
              <Input
                id="profile-birth"
                type="date"
                value={birthDt}
                onChange={e => setBirthDt(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <span>Status do e-mail:</span>
              <span
                className={`font-mono ${user?.email_verified ? "text-primary" : "text-destructive"}`}
              >
                {user?.email_verified ? "verificado" : "não verificado"}
              </span>
            </div>

            <Button
              type="submit"
              disabled={loadingUpdate}
              className="gap-2 h-10 mt-2"
            >
              {loadingUpdate && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar alterações
            </Button>
          </form>
        </div>

        <Separator className="bg-border/40" />

        {/* Change password */}
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-5">
            // trocar senha
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="current-password"
                className="font-mono text-[11px] uppercase tracking-wider"
              >
                Senha atual
              </Label>
              <PasswordInput
                id="current-password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Sua senha atual"
                autoComplete="current-password"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="new-password"
                className="font-mono text-[11px] uppercase tracking-wider"
              >
                Nova senha
              </Label>
              <PasswordInput
                id="new-password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Crie uma senha forte"
                autoComplete="new-password"
                className="h-10"
              />
              {newPassword && <PasswordChecklist value={newPassword} />}
            </div>

            <Button
              type="submit"
              disabled={loadingPassword || !currentPassword || !newPassword}
              className="gap-2 h-10 mt-2"
            >
              {loadingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              <KeyRound className="h-4 w-4" />
              Atualizar senha
            </Button>
          </form>
        </div>

        <Separator className="bg-border/40" />

        {/* Account actions */}
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-5">
            // conta
          </h2>
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full h-10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da conta
            </Button>

            <div className="pt-2">
              <Button
                variant="ghost"
                className="w-full h-10 text-destructive hover:text-destructive hover:bg-destructive/5"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir conta permanentemente
              </Button>
            </div>
          </div>
        </div>
      </motion.main>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-lg">
              Excluir conta
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. Todos os seus dados, decisões e relações
              serão permanentemente removidos. Confirme digitando sua senha
              abaixo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5">
            <Label
              htmlFor="delete-password"
              className="font-mono text-[11px] uppercase tracking-wider"
            >
              Senha
            </Label>
            <PasswordInput
              id="delete-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Sua senha"
              className="h-10"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loadingDelete || !password}
            >
              {loadingDelete ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Excluir conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
