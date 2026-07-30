/*
 * Myggdrasil — App Root
 * Design: Editorial Dark Orgânico — Jardim Noturno
 * Rotas: Login, Signup, Home (protected), Profile, EventDetail
 */

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import NotFound from "@/pages/NotFound"
import { Route, Switch } from "wouter"
import ErrorBoundary from "./components/ErrorBoundary"
import { ThemeProvider } from "./contexts/ThemeContext"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Profile from "./pages/Profile"
import EventDetail from "./pages/EventDetail"

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/perfil" component={() => (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      )} />
      <Route path="/evento/:id" component={() => (
        <ProtectedRoute>
          <EventDetail />
        </ProtectedRoute>
      )} />
      <Route path="/" component={() => (
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      )} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider
          defaultTheme="dark"
          switchable
        >
          <TooltipProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--card-foreground)",
                  fontFamily: "var(--font-sans)",
                  borderRadius: "8px",
                  fontSize: "13px",
                },
              }}
            />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
