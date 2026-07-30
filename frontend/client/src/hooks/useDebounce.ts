import { useEffect, useState } from "react"

/**
 * Retorna uma versão "atrasada" do valor, que só atualiza depois que o
 * usuário para de digitar por `delay` ms. Útil para busca em tempo real
 * sem disparar um filtro a cada tecla pressionada.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
