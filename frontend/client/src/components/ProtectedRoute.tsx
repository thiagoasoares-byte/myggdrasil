import { useAuth } from "@/contexts/AuthContext"
import { useLocation } from "wouter"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [, setLocation] = useLocation()

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login")
    }
  }, [loading, user, setLocation])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
