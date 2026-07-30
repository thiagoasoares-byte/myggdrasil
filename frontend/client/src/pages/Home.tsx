/*
 * Myggdrasil — Home / Árvore de Decisões
 * Design: Editorial Dark Orgânico — Jardim Noturno
 * Tipografia: Playfair Display (títulos), JetBrains Mono (metadados), Inter (corpo)
 * Cores: fundo escuro #0D1117, acento verde-musgo #A9C26C, dourado #D7A56D
 *
 * Mudanças nesta versão:
 * - Link dialog usa Select dropdown com todas as decisões cadastradas
 * - Timeline mostra setas visuais indicando relações parent → child
 */

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/AuthContext"
import { getEvents, getRelationships, createEvent, updateEvent, deleteEvent, createRelationship, deleteRelationship, EVENT_TYPE_IDS, EVENT_STATUS_OPTIONS, type Event, type EventRelationship, type CreateEventInput } from "@/api"
import { useLocation } from "wouter"
import { useEffect, useState, useMemo } from "react"
import { toast } from "sonner"
import {
  Loader2,
  Plus,
  TreePine,
  LogOut,
  User,
  Sun,
  Moon,
  Trash2,
  GitBranch,
  X,
  ArrowDown,
  ArrowRight,
} from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AnimatePresence, motion } from "framer-motion"

// ---- Logo SVG ----
function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M16 28V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 14L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 14L22 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="8" r="2.5" fill="currentColor" opacity="0.6" />
      <circle cx="16" cy="4" r="2.5" fill="currentColor" opacity="0.8" />
      <circle cx="22" cy="8" r="2.5" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

// ---- Arrow SVG between parent and child on timeline ----
function RelationArrow({ fromAbove }: { fromAbove: boolean }) {
  return (
    <div className="absolute -right-6 top-1/2 -translate-y-1/2 z-10">
      <ArrowRight className="h-4 w-4 text-primary/60" />
    </div>
  )
}

// ---- Helpers ----
function getEventTypeName(type: any): string {
  if (typeof type === "number") {
    const found = EVENT_TYPE_IDS.find((t) => t.id === type)
    return found?.name || "Evento"
  }
  return type?.name || "Evento"
}

function getEventTypeId(type: any): number {
  if (typeof type === "number") return type
  return type?.id || 1
}

function formatDate(when: string | undefined): string {
  if (!when) return ""
  const parts = when.substring(0, 10).split("-")
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return when.substring(0, 10)
}

// ---- Main Component ----
export default function Home() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [, setLocation] = useLocation()

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editEventId, setEditEventId] = useState<number | null>(null)
  const [relationships, setRelationships] = useState<EventRelationship[]>([])
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkChildId, setLinkChildId] = useState("none")

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || null,
    [events, selectedEventId]
  )

  const fetchEvents = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getEvents()
      setEvents(data)
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao carregar eventos")
      toast.error("Não foi possível carregar suas decisões")
    } finally {
      setLoading(false)
    }
  }

  const fetchRelationships = async (eventId: number) => {
    try {
      const data = await getRelationships(eventId)
      setRelationships(data)
    } catch {
      setRelationships([])
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (selectedEventId) {
      setPanelOpen(true)
      fetchRelationships(selectedEventId)
    } else {
      setPanelOpen(false)
    }
  }, [selectedEventId])

  const handleSelectEvent = (id: number) => {
    setSelectedEventId(id)
  }

  const handleClosePanel = () => {
    setPanelOpen(false)
    setTimeout(() => setSelectedEventId(null), 300)
  }

  const handleLogout = async () => {
    await logout()
    setLocation("/login")
  }

  const handleCreateEvent = async (data: Record<string, any>) => {
    try {
      const result = await createEvent({
        name: data.name,
        event_type: Number(data.event_type),
        when: data.when || undefined,
        why: data.why,
        status: data.status,
      } as CreateEventInput)
      toast.success("Decisão registrada")
      setDialogOpen(false)
      await fetchEvents()
      return result
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erro ao criar evento"
      toast.error(typeof msg === "string" ? msg : msg[0])
      throw err
    }
  }

  const handleUpdateEvent = async (id: number, data: Record<string, any>) => {
    try {
      await updateEvent(id, {
        name: data.name,
        event_type: Number(data.event_type),
        when: data.when || undefined,
        why: data.why,
        status: data.status,
      } as CreateEventInput)
      toast.success("Decisão atualizada")
      setDialogOpen(false)
      setEditEventId(null)
      await fetchEvents()
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erro ao atualizar"
      toast.error(typeof msg === "string" ? msg : msg[0])
    }
  }

  const handleDeleteEvent = async (id: number) => {
    try {
      await deleteEvent(id)
      toast.success("Decisão removida")
      setDeleteConfirmId(null)
      handleClosePanel()
      await fetchEvents()
    } catch {
      toast.error("Erro ao remover decisão")
    }
  }

  const handleLinkRelationship = async () => {
    if (!selectedEventId || linkChildId === "none" || !linkChildId) return
    try {
      await createRelationship(selectedEventId, Number(linkChildId), "levou a")
      toast.success("Relação criada")
      setLinkDialogOpen(false)
      setLinkChildId("none")
      fetchRelationships(selectedEventId)
      // Also refetch all events to update relationship indicators on timeline
      await fetchEvents()
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erro ao criar relação"
      toast.error(typeof msg === "string" ? msg : msg[0])
    }
  }

  const handleDeleteRelationship = async (relId: number) => {
    try {
      await deleteRelationship(relId)
      toast.success("Relação removida")
      fetchRelationships(selectedEventId!)
      await fetchEvents()
    } catch {
      toast.error("Erro ao remover relação")
    }
  }

  // Group events by year
  const groupedEvents = useMemo(() => {
    const groups: Record<string, Event[]> = {}
    for (const ev of events) {
      const year = ev.when ? ev.when.substring(0, 4) : "Sem data"
      if (!groups[year]) groups[year] = []
      groups[year].push(ev)
    }
    return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]))
  }, [events])

  // Build a map of which events have children (for timeline indicators)
  const eventsWithChildren = useMemo(() => {
    const map = new Map<number, number[]>()
    for (const rel of relationships) {
      const parentId = rel.parent.id
      if (!map.has(parentId)) map.set(parentId, [])
      map.get(parentId)!.push(rel.child.id)
    }
    return map
  }, [relationships])

  // Build a map of which events have parents
  const eventsWithParents = useMemo(() => {
    const map = new Map<number, number[]>()
    for (const rel of relationships) {
      const childId = rel.child.id
      if (!map.has(childId)) map.set(childId, [])
      map.get(childId)!.push(rel.parent.id)
    }
    return map
  }, [relationships])

  const parentEvents = relationships.filter((r) => r.child.id === selectedEventId)
  const childEvents = relationships.filter((r) => r.parent.id === selectedEventId)

  // Available events for link dropdown (exclude current selected)
  const availableLinkEvents = useMemo(() => {
    return events.filter((ev) => ev.id !== selectedEventId)
  }, [events, selectedEventId])

  return (
    <div className="min-h-screen flex flex-col hub-gradient-bg">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-5 py-3.5 lg:px-8">
          <div className="flex items-center gap-2.5">
            <LogoIcon className="text-primary" />
            <span className="font-serif text-lg lg:text-xl font-bold tracking-tight text-foreground">Myggdrasil</span>
          </div>

          <div className="flex items-center gap-2">
            {events.length > 0 && (
              <span className="font-mono text-[11px] text-muted-foreground hidden md:block mr-2">
                {events.length} {events.length === 1 ? "decisão" : "decisões"}
              </span>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => setLocation("/perfil")}>
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => { setEditEventId(null); setDialogOpen(true) }}
              className="hidden sm:flex gap-1.5 h-9 px-4 text-sm"
              size="sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Nova decisão
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Mobile FAB ─── */}
      <button
        onClick={() => { setEditEventId(null); setDialogOpen(true) }}
        className="sm:hidden fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <Plus className="h-5 w-5" />
      </button>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex">
        {/* ─── Timeline ─── */}
        <div className={`flex-1 overflow-y-auto px-5 py-8 lg:px-8 ${panelOpen ? "max-w-[calc(100%-440px)]" : ""} transition-all duration-300`}>
          {loading ? (
            <div className="space-y-6">
              <div className="h-7 w-56 bg-muted rounded animate-pulse" />
              <div className="h-4 w-80 bg-muted/50 rounded animate-pulse" />
              <div className="space-y-4 pt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-4 h-4 rounded-full bg-muted/30 animate-pulse mt-1" />
                    <div className="flex-1 h-28 bg-muted/20 rounded-lg animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <p className="text-destructive mb-4 text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchEvents}>Tentar novamente</Button>
            </div>
          ) : events.length === 0 ? (
            <EmptyState onCreate={() => { setEditEventId(null); setDialogOpen(true) }} />
          ) : (
            <div className="max-w-2xl">
              {/* Section header */}
              <p className="font-mono text-[11px] text-primary/70 mb-1 tracking-wide">
                // hub
              </p>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-2 leading-tight">
                Sua árvore de decisões
              </h2>
              <p className="text-muted-foreground text-sm mb-10 max-w-md leading-relaxed">
                A linha do tempo completa das suas decisões. Toque em qualquer nó para ver os detalhes e ligar consequências a ele.
              </p>

              {/* Year groups */}
              {groupedEvents.map(([year, yearEvents]) => (
                <div key={year} className="mb-10 last:mb-0">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-5">
                    {year === "Sem data" ? "Sem data" : year}
                  </h3>

                  <div className="relative pl-10">
                    {/* Vertical line */}
                    <div className="absolute left-[7px] top-1 bottom-1 w-[2px] bg-primary/15 rounded-full" />

                      {yearEvents.map((ev, idx) => {
                      const isSelected = selectedEventId === ev.id
                      const hasChildren = eventsWithChildren.has(ev.id)
                      const childIds = eventsWithChildren.get(ev.id) || []
                      const hasParent = eventsWithParents.has(ev.id)
                      const parentIds = eventsWithParents.get(ev.id) || []

                      return (
                        <motion.div
                          key={ev.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                          className="mb-3.5 last:mb-0"
                        >
                          {/* Arrow connector from parent card (drawn between parent and this card) */}
                          {hasParent && (
                            <div className="absolute left-[15px] -top-3 w-[2px] h-3">
                              <div className="absolute inset-0 bg-primary/25" />
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-primary/40">
                                  <path d="M4 0L0 4H8L4 0Z" fill="currentColor" />
                                </svg>
                              </div>
                            </div>
                          )}

                          {/* Dot */}
                          <div className="absolute left-0 top-4">
                            <div
                              className={`w-3.5 h-3.5 rounded-full border-[2px] transition-all duration-200 relative ${
                                isSelected
                                  ? "bg-primary border-primary shadow-[0_0_0_3px_rgba(169,194,108,0.15)]"
                                  : "bg-background border-muted-foreground/40 hover:border-primary"
                              }`}
                            >
                              {/* Arrow pointing to children cards below */}
                              {hasChildren && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full">
                                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none" className="text-primary/30">
                                    <path d="M4 6L0 0H8L4 6Z" fill="currentColor" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Card */}
                          <button
                            onClick={() => handleSelectEvent(ev.id)}
                            className={`event-card w-full text-left p-4 rounded-lg border transition-all duration-150 relative ${
                              isSelected
                                ? "border-primary/30 bg-primary/[0.04] shadow-sm"
                                : "border-border/60 bg-card/50 hover:border-primary/20 hover:bg-card"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 mb-1.5">
                              {ev.when && (
                                <span className="font-mono text-[11px] text-muted-foreground">
                                  {formatDate(ev.when)}
                                </span>
                              )}
                              <Badge
                                variant="secondary"
                                className={`font-mono text-[10px] px-1.5 py-0.5 uppercase tracking-wider ${
                                  isSelected ? "bg-primary/15 text-primary border-primary/20" : ""
                                }`}
                              >
                                {getEventTypeName(ev.event_type)}
                              </Badge>
                              {ev.status && ev.status !== "ativo" && (
                                <span className="font-mono text-[10px] text-muted-foreground/60 ml-auto">
                                  {ev.status}
                                </span>
                              )}
                            </div>
                            <h4 className="font-serif text-base font-semibold text-foreground mb-1 leading-snug">
                              {ev.name}
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                              {ev.why}
                            </p>

                            {/* Relation indicator badge at bottom */}
                            {(hasParent || hasChildren) && (
                              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/30">
                                {hasParent && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-primary/70 bg-primary/8 px-2 py-0.5 rounded-full">
                                    <ArrowDown className="h-2.5 w-2.5 rotate-180" />
                                    {parentIds.length} {parentIds.length === 1 ? "antecessor" : "antecessores"}
                                  </span>
                                )}
                                {hasChildren && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-primary/70 bg-primary/8 px-2 py-0.5 rounded-full">
                                    <ArrowDown className="h-2.5 w-2.5" />
                                    {childIds.length} {childIds.length === 1 ? "desdobramento" : "desdobramentos"}
                                  </span>
                                )}
                              </div>
                            )}
                          </button>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Detail Panel ─── */}
        <AnimatePresence>
          {panelOpen && selectedEvent && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "min(420px, 100%)", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="border-l border-border/50 bg-muted/[0.08] overflow-hidden flex-shrink-0"
            >
              <div className="w-[420px] h-full flex flex-col">
                {/* Panel header */}
                <div className="px-5 py-4 flex items-center justify-between border-b border-border/40">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    decisão selecionada
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClosePanel}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Panel content */}
                <ScrollArea className="flex-1 px-5 py-5">
                  <h3 className="font-serif text-xl font-bold text-foreground mb-2.5 leading-snug">
                    {selectedEvent.name}
                  </h3>
                  <div className="flex items-center gap-2.5 mb-4">
                    <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5">
                      {getEventTypeName(selectedEvent.event_type)}
                    </Badge>
                    {selectedEvent.when && (
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {formatDate(selectedEvent.when)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-foreground/75 leading-relaxed mb-6 whitespace-pre-wrap">
                    {selectedEvent.why}
                  </p>

                  <Separator className="my-4 bg-border/40" />

                  {/* Parents */}
                  {parentEvents.length > 0 && (
                    <div className="mb-5">
                      <p className="font-mono text-[11px] text-muted-foreground mb-2.5">
                        // o que levou a esta decisão ({parentEvents.length})
                      </p>
                      {parentEvents.map((rel) => (
                        <button
                          key={rel.id}
                          onClick={() => handleSelectEvent(rel.parent.id)}
                          className="block w-full text-left p-3 rounded-lg border border-border/40 bg-card/60 mb-2 hover:border-primary/25 transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <ArrowDown className="h-3 w-3 text-primary/50 group-hover:text-primary transition-colors" />
                            <p className="font-medium text-sm text-foreground">{rel.parent.name}</p>
                          </div>
                          {rel.relationship && (
                            <p className="font-mono text-[10px] text-muted-foreground mt-1 ml-5">
                              {rel.relationship}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Children */}
                  {childEvents.length > 0 && (
                    <div className="mb-5">
                      <p className="font-mono text-[11px] text-muted-foreground mb-2.5">
                        // o que esta decisão levou a ({childEvents.length})
                      </p>
                      {childEvents.map((rel) => (
                        <div key={rel.id} className="flex items-center gap-2 p-3 rounded-lg border border-border/40 bg-card/60 mb-2 group">
                          <ArrowDown className="h-3 w-3 text-primary/50 group-hover:text-primary transition-colors flex-shrink-0" />
                          <button
                            onClick={() => handleSelectEvent(rel.child.id)}
                            className="flex-1 text-left"
                          >
                            <p className="font-medium text-sm text-foreground">{rel.child.name}</p>
                            {rel.relationship && (
                              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                                {rel.relationship}
                              </p>
                            )}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteRelationship(rel.id) }}
                            className="text-destructive/60 hover:text-destructive p-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {parentEvents.length === 0 && childEvents.length === 0 && (
                    <p className="font-mono text-[11px] text-muted-foreground italic py-2">
                      Nenhuma consequência vinculada ainda.
                    </p>
                  )}
                </ScrollArea>

                {/* Panel actions */}
                <div className="px-5 py-4 border-t border-border/40 space-y-2">
                  <Button
                    onClick={() => { setEditEventId(selectedEvent.id); setDialogOpen(true) }}
                    variant="outline"
                    className="w-full h-9 text-sm"
                  >
                    Editar decisão
                  </Button>
                  <Button
                    onClick={() => setLinkDialogOpen(true)}
                    variant="outline"
                    className="w-full h-9 text-sm"
                  >
                    <GitBranch className="h-3.5 w-3.5 mr-1.5" />
                    Adicionar desdobramento
                  </Button>
                  <Button
                    onClick={() => setDeleteConfirmId(selectedEvent.id)}
                    variant="ghost"
                    className="w-full h-8 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1.5" />
                    Excluir decisão
                </Button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      {/* ─── Create/Edit Dialog ─── */}
      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editEventId={editEventId}
        events={events}
        onCreate={handleCreateEvent}
        onUpdate={handleUpdateEvent}
        selectedEventId={selectedEventId}
      />

      {/* ─── Link Relationship Dialog (Dropdown) ─── */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Adicionar desdobramento</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Selecione uma decisão existente para vinculá-la como consequência desta.
          </p>

          {availableLinkEvents.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-3">
                Você precisa de pelo menos uma outra decisão para criar um desdobramento.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setLinkDialogOpen(false); setDialogOpen(true) }}
              >
                Criar nova decisão
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="font-mono text-[11px] uppercase tracking-wider">
                  Decisão consequência
                </Label>
                <Select value={linkChildId} onValueChange={setLinkChildId}>
                  <SelectTrigger className="h-10 mt-1.5 w-full">
                    <SelectValue placeholder="Selecione uma decisão..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLinkEvents.map((ev) => (
                      <SelectItem key={ev.id} value={String(ev.id)}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            #{ev.id}
                          </span>
                          <span>{ev.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Visual preview of the link */}
              {linkChildId !== "none" && linkChildId && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Parent (esta decisão)</p>
                    <p className="font-medium text-sm text-foreground">{selectedEvent?.name}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary/60 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Child (consequência)</p>
                    <p className="font-medium text-sm text-foreground">
                      {events.find((e) => e.id === Number(linkChildId))?.name}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleLinkRelationship}
                className="w-full h-10"
                disabled={linkChildId === "none" || !linkChildId}
              >
                <GitBranch className="h-3.5 w-3.5 mr-1.5" />
                Ligar desdobramento
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ─── */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-lg">Excluir decisão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. A decisão e suas relações serão removidas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteEvent(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ---- Empty State ----
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-6">
      <div className="w-20 h-20 mb-5 rounded-full bg-primary/8 flex items-center justify-center">
        <TreePine className="h-8 w-8 text-primary" />
      </div>
      <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
        Sua árvore está vazia
      </h2>
      <p className="text-muted-foreground mb-7 max-w-sm text-sm leading-relaxed">
        Toda trajetória começa com uma decisão. Registre um momento que ajudou a formar o caminho até aqui.
      </p>
      <Button onClick={onCreate} className="gap-1.5 h-10">
        <Plus className="h-4 w-4" />
        Registrar primeira decisão
      </Button>
    </div>
  )
}

// ---- Event Dialog (Create/Edit) ----
function EventDialog({
  open,
  onOpenChange,
  editEventId,
  events,
  onCreate,
  onUpdate,
  selectedEventId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editEventId: number | null
  events: Event[]
  onCreate: (data: Record<string, any>) => Promise<any>
  onUpdate: (id: number, data: Record<string, any>) => void
  selectedEventId: number | null
}) {
  const [name, setName] = useState("")
  const [eventType, setEventType] = useState("1")
  const [when, setWhen] = useState("")
  const [why, setWhy] = useState("")
  const [status, setStatus] = useState("ativo")
  const [parentId, setParentId] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const editEvent = useMemo(
    () => (editEventId ? events.find((e) => e.id === editEventId) : null),
    [editEventId, events]
  )

  useEffect(() => {
    if (editEvent) {
      setName(editEvent.name)
      setEventType(String(getEventTypeId(editEvent.event_type)))
      setWhen(editEvent.when || "")
      setWhy(editEvent.why)
      setStatus(editEvent.status)
      setParentId(selectedEventId ? String(selectedEventId) : "")
    } else {
      setName("")
      setEventType("1")
      setWhen("")
      setWhy("")
      setStatus("ativo")
      setParentId(selectedEventId ? String(selectedEventId) : "")
    }
  }, [editEvent, open, selectedEventId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { name, event_type: eventType, when: when || undefined, why, status }
      if (editEventId) {
        await onUpdate(editEventId, data)
      } else {
        const result = await onCreate(data)
        // If parent selected, create relationship
        if (parentId && result) {
          try {
            await createRelationship(Number(parentId), result.id, "levou a")
          } catch {}
        }
      }
      setLoading(false)
    } catch {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">
            {editEventId ? "Editar decisão" : "Nova decisão"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {editEventId
              ? "Atualize os detalhes desta decisão."
              : "Registre um momento importante da sua trajetória."}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="event-name" className="font-mono text-[11px] uppercase tracking-wider">
              Título da decisão
            </Label>
            <Input
              id="event-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Começar a estudar React"
              required
              className="h-10"
            />
          </div>

          {/* Date + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="event-when" className="font-mono text-[11px] uppercase tracking-wider">
                Data
              </Label>
              <Input
                id="event-when"
                type="date"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-type" className="font-mono text-[11px] uppercase tracking-wider">
                Categoria
              </Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger id="event-type" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPE_IDS.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Why */}
          <div className="space-y-1.5">
            <Label htmlFor="event-why" className="font-mono text-[11px] uppercase tracking-wider">
              O que motivou isso?
            </Label>
            <Textarea
              id="event-why"
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder="Descreva o contexto, motivação ou reflexão..."
              rows={3}
              required
            />
          </div>

          {/* Status + Parent */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="event-status" className="font-mono text-[11px] uppercase tracking-wider">
                Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="event-status" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["ativo", "concluído", "em andamento", "pausado"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!editEventId && (
              <div className="space-y-1.5">
                <Label htmlFor="event-parent" className="font-mono text-[11px] uppercase tracking-wider">
                  Ligada a (opcional)
                </Label>
                <Select value={parentId || "none"} onValueChange={(v) => setParentId(v === "none" ? "" : v)}>
                  <SelectTrigger id="event-parent" className="h-10">
                    <SelectValue placeholder="Nenhuma decisão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma decisão</SelectItem>
                    {events.map((ev) => (
                      <SelectItem key={ev.id} value={String(ev.id)}>
                        {ev.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-10">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 h-10" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : null}
              {editEventId ? "Salvar alterações" : "Salvar decisão"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
