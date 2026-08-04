/*
 * Myggdrasil — Signup
 * Design: Editorial Dark Orgânico — Jardim Noturno
 * Layout: Split screen, form à esquerda, branding à direita
 */

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { PasswordChecklist, isPasswordStrong } from "@/components/ui/password-checklist"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { Link, useLocation } from "wouter"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M16 28V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 14L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 14L22 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="8" r="2.5" fill="currentColor" opacity="0.6" />
      <circle cx="16" cy="4" r="2.5" fill="currentColor" opacity="0.8" />
      <circle cx="22" cy="8" r="2.5" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

export default function Signup() {
  const { signup } = useAuth()
  const [, setLocation] = useLocation()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [birthDt, setBirthDt] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordStrong(password)) {
      toast.error("Sua senha ainda não atende todos os requisitos")
      return
    }
    setLoading(true)
    try {
      await signup(name, email, password, birthDt || undefined)
      toast.success("Conta criada com sucesso!", {
        description: "Você já pode fazer login.",
      })
      setLocation("/login")
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erro ao criar conta"
      toast.error(typeof msg === "string" ? msg : msg[0])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - auth form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center px-6 py-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-sm"
        >
          <Link
            href="/login"
            className="font-mono text-[11px] text-muted-foreground hover:text-primary transition-colors mb-10 inline-block"
          >
            // já tem conta? entrar
          </Link>

          <h1 className="font-serif text-4xl font-bold text-foreground mb-1.5 tracking-tight">
            Criar conta
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Comece a mapear suas decisões.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="font-mono text-[11px] uppercase tracking-wider">
                Nome
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ana da Silva"
                required
                autoComplete="name"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-mono text-[11px] uppercase tracking-wider">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="font-mono text-[11px] uppercase tracking-wider">
                Senha
              </Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha forte"
                required
                autoComplete="new-password"
                className="h-10"
              />
              <PasswordChecklist value={password} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="birth_dt" className="font-mono text-[11px] uppercase tracking-wider">
                Data de nascimento (opcional)
              </Label>
              <Input
                id="birth_dt"
                type="date"
                value={birthDt}
                onChange={(e) => setBirthDt(e.target.value)}
                autoComplete="bday"
                className="h-10"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-medium text-sm mt-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Criar conta
            </Button>
          </form>
        </motion.div>
      </div>

      {/* Right side - branding */}
      <div className="hidden lg:flex lg:w-[55%] hub-gradient-bg items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="text-center px-12 relative z-10"
        >
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-primary/8 flex items-center justify-center">
            <LogoIcon className="text-primary w-16 h-16" />
          </div>
          <h2 className="font-serif text-6xl font-bold text-foreground mb-5">
            Myggdrasil
          </h2>
          <p className="text-muted-foreground text-xl max-w-lg mx-auto leading-relaxed">
            Sua árvore de decisões. Cada escolha registrada, cada consequência visível.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
