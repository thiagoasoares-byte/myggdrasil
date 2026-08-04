import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Regras espelham exatamente o @IsStrongPassword() do backend (class-validator,
 * opções default): 8+ caracteres, 1 minúscula, 1 maiúscula, 1 número, 1 símbolo.
 */
const RULES = [
  { label: "Mínimo de 8 caracteres", test: (v: string) => v.length >= 8 },
  { label: "Uma letra minúscula", test: (v: string) => /[a-z]/.test(v) },
  { label: "Uma letra maiúscula", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Um número", test: (v: string) => /[0-9]/.test(v) },
  { label: "Um símbolo (ex: ! @ # $ %)", test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
]

export function getPasswordStrength(value: string) {
  return RULES.map((rule) => ({ label: rule.label, met: rule.test(value) }))
}

export function isPasswordStrong(value: string) {
  return RULES.every((rule) => rule.test(value))
}

export function PasswordChecklist({ value, className }: { value: string; className?: string }) {
  const results = getPasswordStrength(value)

  return (
    <ul className={cn("space-y-1 mt-1.5", className)}>
      {results.map((r) => (
        <li
          key={r.label}
          className={cn(
            "flex items-center gap-1.5 text-[11px] transition-colors",
            r.met ? "text-primary" : "text-muted-foreground/70"
          )}
        >
          {r.met ? (
            <Check className="h-3 w-3 shrink-0" />
          ) : (
            <X className="h-3 w-3 shrink-0 opacity-40" />
          )}
          {r.label}
        </li>
      ))}
    </ul>
  )
}
