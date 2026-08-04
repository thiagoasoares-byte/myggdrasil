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

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import {
  getEvents,
  getRelationships,
  getAllRelationships,
  getEventTypes,
  createEventType,
  getAiAnalysis,
  createEvent,
  updateEvent,
  deleteEvent,
  createRelationship,
  deleteRelationship,
  EVENT_TYPE_IDS,
  EVENT_STATUS_OPTIONS,
  type Event,
  type EventType,
  type EventRelationship,
  type DecisionAnalysis,
  type CreateEventInput,
} from "@/api";
import { useLocation } from "wouter";
import { useEffect, useState, useMemo, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
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
  Search,
  BarChart3,
  Sparkles,
  Download,
  Network,
  List,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { AnimatePresence, motion } from "framer-motion";

// ---- Logo SVG ----
function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
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

// ---- Arrow SVG between parent and child on timeline ----
function RelationArrow({ fromAbove }: { fromAbove: boolean }) {
  return (
    <div className="absolute -right-6 top-1/2 -translate-y-1/2 z-10">
      <ArrowRight className="h-4 w-4 text-primary/60" />
    </div>
  );
}

// ---- Helpers ----
function getEventTypeName(
  type: any,
  types: readonly { id: number; name: string }[] = EVENT_TYPE_IDS
): string {
  if (typeof type === "number") {
    const found = types.find(t => t.id === type);
    return found?.name || "Evento";
  }
  return type?.name || "Evento";
}

type EventTypeLike = {
  id: number;
  name: string;
  is_default?: boolean;
};

type DecisionAccent = {
  dot: string;
  card: string;
  cardSelected: string;
  badge: string;
  panel: string;
  panelBadge: string;
};

const DECISION_ACCENTS: DecisionAccent[] = [
  {
    dot: "bg-sky-500 border-sky-500 shadow-[0_0_0_3px_rgba(14,165,233,0.14)]",
    card: "border-sky-500/20 bg-sky-500/[0.04] hover:border-sky-500/30 hover:bg-sky-500/[0.06]",
    cardSelected: "border-sky-500/35 bg-sky-500/[0.08] shadow-sm",
    badge: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    panel: "border-sky-500/20 bg-sky-500/[0.03]",
    panelBadge:
      "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  {
    dot: "bg-amber-500 border-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.14)]",
    card: "border-amber-500/20 bg-amber-500/[0.04] hover:border-amber-500/30 hover:bg-amber-500/[0.06]",
    cardSelected: "border-amber-500/35 bg-amber-500/[0.08] shadow-sm",
    badge:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    panel: "border-amber-500/20 bg-amber-500/[0.03]",
    panelBadge:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  {
    dot: "bg-cyan-500 border-cyan-500 shadow-[0_0_0_3px_rgba(6,182,212,0.14)]",
    card: "border-cyan-500/20 bg-cyan-500/[0.04] hover:border-cyan-500/30 hover:bg-cyan-500/[0.06]",
    cardSelected: "border-cyan-500/35 bg-cyan-500/[0.08] shadow-sm",
    badge: "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
    panel: "border-cyan-500/20 bg-cyan-500/[0.03]",
    panelBadge:
      "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  },
  {
    dot: "bg-violet-500 border-violet-500 shadow-[0_0_0_3px_rgba(139,92,246,0.14)]",
    card: "border-violet-500/20 bg-violet-500/[0.04] hover:border-violet-500/30 hover:bg-violet-500/[0.06]",
    cardSelected: "border-violet-500/35 bg-violet-500/[0.08] shadow-sm",
    badge:
      "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    panel: "border-violet-500/20 bg-violet-500/[0.03]",
    panelBadge:
      "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  {
    dot: "bg-orange-500 border-orange-500 shadow-[0_0_0_3px_rgba(249,115,22,0.14)]",
    card: "border-orange-500/20 bg-orange-500/[0.04] hover:border-orange-500/30 hover:bg-orange-500/[0.06]",
    cardSelected: "border-orange-500/35 bg-orange-500/[0.08] shadow-sm",
    badge:
      "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300",
    panel: "border-orange-500/20 bg-orange-500/[0.03]",
    panelBadge:
      "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  },
  {
    dot: "bg-fuchsia-500 border-fuchsia-500 shadow-[0_0_0_3px_rgba(217,70,239,0.14)]",
    card: "border-fuchsia-500/20 bg-fuchsia-500/[0.04] hover:border-fuchsia-500/30 hover:bg-fuchsia-500/[0.06]",
    cardSelected: "border-fuchsia-500/35 bg-fuchsia-500/[0.08] shadow-sm",
    badge:
      "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
    panel: "border-fuchsia-500/20 bg-fuchsia-500/[0.03]",
    panelBadge:
      "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
  },
];

const FINANCEIRO_ACCENT: DecisionAccent = {
  dot: "bg-emerald-500 border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.14)]",
  card: "border-emerald-500/25 bg-emerald-500/[0.05] hover:border-emerald-500/35 hover:bg-emerald-500/[0.08]",
  cardSelected: "border-emerald-500/40 bg-emerald-500/[0.1] shadow-sm",
  badge:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  panel: "border-emerald-500/20 bg-emerald-500/[0.04]",
  panelBadge:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

const PESSOAL_ACCENT: DecisionAccent = {
  dot: "bg-rose-500 border-rose-500 shadow-[0_0_0_3px_rgba(244,63,94,0.14)]",
  card: "border-rose-500/25 bg-rose-500/[0.05] hover:border-rose-500/35 hover:bg-rose-500/[0.08]",
  cardSelected: "border-rose-500/40 bg-rose-500/[0.1] shadow-sm",
  badge: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  panel: "border-rose-500/20 bg-rose-500/[0.04]",
  panelBadge:
    "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getDecisionAccent(
  type: any,
  types: readonly EventTypeLike[] = EVENT_TYPE_IDS
): DecisionAccent {
  const meta =
    typeof type === "number"
      ? types.find(candidate => candidate.id === type) || {
          id: type,
          name: "Evento",
        }
      : {
          id: type?.id || 1,
          name: type?.name || "Evento",
          is_default: type?.is_default,
        };

  const normalizedName = meta.name.toLowerCase();
  if (normalizedName === "financeiro") return FINANCEIRO_ACCENT;
  if (normalizedName === "pessoal") return PESSOAL_ACCENT;

  const paletteIndex =
    hashString(`${meta.id}:${meta.name}`) % DECISION_ACCENTS.length;
  return DECISION_ACCENTS[paletteIndex];
}

function normalizeStatus(status?: string) {
  if (!status) return "ativo";
  return status
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getStatusOpacity(status?: string) {
  switch (normalizeStatus(status)) {
    case "ativo":
      return 1;
    case "em andamento":
      return 0.8;
    case "pausado":
    case "parado":
      return 0.6;
    case "concluido":
      return 0.45;
    default:
      return 0.72;
  }
}

function getEventTypeId(type: any): number {
  if (typeof type === "number") return type;
  return type?.id || 1;
}

function formatDate(when: string | undefined): string {
  if (!when) return "";
  const parts = when.substring(0, 10).split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return when.substring(0, 10);
}

// ---- Tree view: layout em níveis a partir das relações pai → filho ----
function TreeView({
  events,
  relationships,
  eventTypes,
  selectedEventId,
  onSelect,
}: {
  events: Event[];
  relationships: EventRelationship[];
  eventTypes: EventType[];
  selectedEventId: number | null;
  onSelect: (id: number) => void;
}) {
  const { positions, edges, width, height } = useMemo(() => {
    const NODE_W = 176;
    const NODE_H = 64;
    const GAP_X = 28;
    const GAP_Y = 76;

    const childrenMap = new Map<number, number[]>();
    relationships.forEach(r => {
      const list = childrenMap.get(r.parent.id) || [];
      list.push(r.child.id);
      childrenMap.set(r.parent.id, list);
    });
    const childIds = new Set(relationships.map(r => r.child.id));
    const eventIds = new Set(events.map(e => e.id));
    const roots = events.filter(ev => !childIds.has(ev.id));

    const levelOf = new Map<number, number>();
    const visited = new Set<number>();
    const queue: { id: number; level: number }[] = roots.map(r => ({
      id: r.id,
      level: 0,
    }));
    while (queue.length) {
      const next = queue.shift()!;
      if (visited.has(next.id)) continue;
      visited.add(next.id);
      levelOf.set(next.id, next.level);
      const kids = childrenMap.get(next.id) || [];
      kids.forEach(cid => {
        if (eventIds.has(cid) && !visited.has(cid))
          queue.push({ id: cid, level: next.level + 1 });
      });
    }
    // fallback pra qualquer evento não alcançado (ex: ciclo)
    events.forEach(ev => {
      if (!levelOf.has(ev.id)) levelOf.set(ev.id, 0);
    });

    const byLevel = new Map<number, number[]>();
    events.forEach(ev => {
      const lvl = levelOf.get(ev.id)!;
      const arr = byLevel.get(lvl) || [];
      arr.push(ev.id);
      byLevel.set(lvl, arr);
    });

    const positions = new Map<number, { x: number; y: number }>();
    const levels = Array.from(byLevel.keys()).sort((a, b) => a - b);
    let maxRowWidth = 0;
    levels.forEach(lvl => {
      const ids = byLevel.get(lvl)!;
      ids.forEach((id, i) => {
        positions.set(id, {
          x: i * (NODE_W + GAP_X),
          y: lvl * (NODE_H + GAP_Y),
        });
      });
      maxRowWidth = Math.max(maxRowWidth, ids.length * (NODE_W + GAP_X));
    });

    const edges = relationships
      .filter(r => positions.has(r.parent.id) && positions.has(r.child.id))
      .map(r => {
        const from = positions.get(r.parent.id)!;
        const to = positions.get(r.child.id)!;
        return {
          id: r.id,
          x1: from.x + NODE_W / 2,
          y1: from.y + NODE_H,
          x2: to.x + NODE_W / 2,
          y2: to.y,
        };
      });

    return {
      positions,
      edges,
      width: Math.max(maxRowWidth, NODE_W) + 40,
      height: levels.length * (NODE_H + GAP_Y) + 40,
    };
  }, [events, relationships]);

  if (events.length === 0) return null;

  return (
    <div className="overflow-x-auto overflow-y-hidden pb-6 -mx-1 px-1">
      <div className="relative" style={{ width, height, minWidth: "100%" }}>
        <svg
          className="absolute inset-0 pointer-events-none"
          width={width}
          height={height}
        >
          {edges.map(e => (
            <path
              key={e.id}
              d={`M ${e.x1} ${e.y1} C ${e.x1} ${(e.y1 + e.y2) / 2}, ${e.x2} ${(e.y1 + e.y2) / 2}, ${e.x2} ${e.y2}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="text-border"
            />
          ))}
        </svg>
        {events.map(ev => {
          const pos = positions.get(ev.id);
          if (!pos) return null;
          const accent = getDecisionAccent(ev.event_type, eventTypes);
          const isSelected = ev.id === selectedEventId;
          return (
            <button
              key={ev.id}
              onClick={() => onSelect(ev.id)}
              className={`event-card absolute text-left p-2.5 rounded-lg border transition-all ${
                isSelected ? accent.cardSelected : accent.card
              }`}
              style={{ left: pos.x, top: pos.y, width: 176, height: 64 }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground truncate">
                  {getEventTypeName(ev.event_type, eventTypes)}
                </span>
              </div>
              <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                {ev.name}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- Main Component ----
export default function Home() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();

  const [events, setEvents] = useState<Event[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>(
    EVENT_TYPE_IDS.map(t => ({ ...t, is_default: true }))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEventId, setEditEventId] = useState<number | null>(null);
  const [relationships, setRelationships] = useState<EventRelationship[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkChildId, setLinkChildId] = useState("none");

  // Busca com debounce
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 250);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<"list" | "tree">("list");

  // Estatísticas do hub
  const [allRelationships, setAllRelationships] = useState<EventRelationship[]>(
    []
  );
  const [statsOpen, setStatsOpen] = useState(false);

  // Drag-and-drop para relacionar decisões
  const [draggedEventId, setDraggedEventId] = useState<number | null>(null);
  const [dragOverEventId, setDragOverEventId] = useState<number | null>(null);

  // IA analyzer
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<DecisionAnalysis | null>(null);

  const selectedEvent = useMemo(
    () => events.find(e => e.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  const selectedEventAccent = useMemo(
    () => getDecisionAccent(selectedEvent?.event_type, eventTypes),
    [eventTypes, selectedEvent?.event_type]
  );

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao carregar eventos");
      toast.error("Não foi possível carregar suas decisões");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelationships = async (eventId: number) => {
    try {
      const data = await getRelationships(eventId);
      setRelationships(data);
    } catch {
      setRelationships([]);
    }
  };

  const fetchAllRelationships = async () => {
    try {
      const data = await getAllRelationships();
      setAllRelationships(data);
    } catch {
      setAllRelationships([]);
    }
  };

  const fetchEventTypes = async () => {
    try {
      const data = await getEventTypes();
      if (data.length) setEventTypes(data);
    } catch {
      // mantém o fallback estático em caso de erro
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchAllRelationships();
    fetchEventTypes();
  }, []);

  // Atalhos de teclado: Cmd/Ctrl+K foca a busca, N abre "Nova decisão"
  useEffect(() => {
    const anyDialogOpen = dialogOpen || aiDialogOpen || linkDialogOpen;
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (e.key.toLowerCase() === "n" && !isTyping && !anyDialogOpen) {
        e.preventDefault();
        setEditEventId(null);
        setDialogOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dialogOpen, aiDialogOpen, linkDialogOpen]);

  useEffect(() => {
    if (selectedEventId) {
      setPanelOpen(true);
      fetchRelationships(selectedEventId);
    } else {
      setPanelOpen(false);
    }
  }, [selectedEventId]);

  const handleSelectEvent = (id: number) => {
    setSelectedEventId(id);
  };

  const handleClosePanel = () => {
    setPanelOpen(false);
    setTimeout(() => setSelectedEventId(null), 300);
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const handleCreateEvent = async (data: Record<string, any>) => {
    try {
      const result = await createEvent({
        name: data.name,
        event_type: Number(data.event_type),
        when: data.when || undefined,
        why: data.why,
        status: data.status,
      });
      toast.success("Decisão registrada");
      setDialogOpen(false);
      await fetchEvents();
      return result;
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erro ao criar evento";
      toast.error(typeof msg === "string" ? msg : msg[0]);
      throw err;
    }
  };

  const handleUpdateEvent = async (id: number, data: Record<string, any>) => {
    try {
      await updateEvent(id, {
        name: data.name,
        event_type: Number(data.event_type),
        when: data.when || undefined,
        why: data.why,
        status: data.status,
      });
      toast.success("Decisão atualizada");
      setDialogOpen(false);
      setEditEventId(null);
      await fetchEvents();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erro ao atualizar";
      toast.error(typeof msg === "string" ? msg : msg[0]);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      await deleteEvent(id);
      toast.success("Decisão removida");
      setDeleteConfirmId(null);
      handleClosePanel();
      await fetchEvents();
    } catch {
      toast.error("Erro ao remover decisão");
    }
  };

  const handleLinkRelationship = async () => {
    if (!selectedEventId || linkChildId === "none" || !linkChildId) return;
    try {
      await createRelationship(selectedEventId, Number(linkChildId), "levou a");
      toast.success("Relação criada");
      setLinkDialogOpen(false);
      setLinkChildId("none");
      fetchRelationships(selectedEventId);
      // Also refetch all events to update relationship indicators on timeline
      await fetchEvents();
      await fetchAllRelationships();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erro ao criar relação";
      toast.error(typeof msg === "string" ? msg : msg[0]);
    }
  };

  const handleDeleteRelationship = async (relId: number) => {
    try {
      await deleteRelationship(relId);
      toast.success("Relação removida");
      fetchRelationships(selectedEventId!);
      await fetchEvents();
      await fetchAllRelationships();
    } catch {
      toast.error("Erro ao remover relação");
    }
  };

  const handleAnalyze = async (force = false) => {
    setAiDialogOpen(true);
    setAiLoading(true);
    setAiError(null);
    try {
      const result = await getAiAnalysis(force);
      setAiResult(result);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Erro ao gerar análise. Tente novamente em instantes.";
      setAiError(typeof msg === "string" ? msg : msg[0]);
    } finally {
      setAiLoading(false);
    }
  };

  // ---- Drag-and-drop: soltar um card sobre outro cria a relação direto ----
  const handleDragStart = (id: number) => {
    setDraggedEventId(id);
  };

  const handleDragEnd = () => {
    setDraggedEventId(null);
    setDragOverEventId(null);
  };

  const handleDragOverCard = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    if (draggedEventId !== null && draggedEventId !== id) {
      setDragOverEventId(id);
    }
  };

  const handleDropOnCard = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    const sourceId = draggedEventId;
    setDraggedEventId(null);
    setDragOverEventId(null);
    if (sourceId === null || sourceId === targetId) return;

    try {
      // O card arrastado (source) vira antecessor do card alvo (target)
      await createRelationship(sourceId, targetId, "levou a");
      toast.success("Decisões relacionadas");
      await fetchEvents();
      await fetchAllRelationships();
      if (selectedEventId === sourceId || selectedEventId === targetId) {
        fetchRelationships(selectedEventId);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erro ao relacionar decisões";
      toast.error(typeof msg === "string" ? msg : msg[0]);
    }
  };

  // Eventos filtrados pela busca (nome) com debounce
  const filteredEvents = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return events;
    return events.filter(ev => ev.name.toLowerCase().includes(q));
  }, [events, debouncedSearch]);

  // Group events by year
  const groupedEvents = useMemo(() => {
    const groups: Record<string, Event[]> = {};
    for (const ev of filteredEvents) {
      const year = ev.when ? ev.when.substring(0, 4) : "Sem data";
      if (!groups[year]) groups[year] = [];
      groups[year].push(ev);
    }
    return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [filteredEvents]);

  // Estatísticas do hub: total de decisões, ramificações e categorias mais usadas
  const hubStats = useMemo(() => {
    const categoryCounts = new Map<string, number>();
    for (const ev of events) {
      const name = getEventTypeName(ev.event_type, eventTypes);
      categoryCounts.set(name, (categoryCounts.get(name) || 0) + 1);
    }
    const topCategories = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      total: events.length,
      branches: allRelationships.length,
      topCategories,
    };
  }, [events, allRelationships, eventTypes]);

  // Build a map of which events have children (for timeline indicators)
  const eventsWithChildren = useMemo(() => {
    const map = new Map<number, number[]>();
    for (const rel of relationships) {
      const parentId = rel.parent.id;
      if (!map.has(parentId)) map.set(parentId, []);
      map.get(parentId)!.push(rel.child.id);
    }
    return map;
  }, [relationships]);

  // Build a map of which events have parents
  const eventsWithParents = useMemo(() => {
    const map = new Map<number, number[]>();
    for (const rel of relationships) {
      const childId = rel.child.id;
      if (!map.has(childId)) map.set(childId, []);
      map.get(childId)!.push(rel.parent.id);
    }
    return map;
  }, [relationships]);

  const parentEvents = relationships.filter(
    r => r.child.id === selectedEventId
  );
  const childEvents = relationships.filter(
    r => r.parent.id === selectedEventId
  );

  // Available events for link dropdown (exclude current selected)
  const availableLinkEvents = useMemo(() => {
    return events.filter(ev => ev.id !== selectedEventId);
  }, [events, selectedEventId]);

  return (
    <div className="min-h-screen flex flex-col hub-gradient-bg">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-5 py-3.5 lg:px-8">
          <div className="flex items-center gap-2.5">
            <LogoIcon className="text-primary" />
            <span className="font-serif text-lg lg:text-xl font-bold tracking-tight text-foreground">
              Myggdrasil
            </span>
          </div>

          <div className="flex items-center gap-2">
            {events.length > 0 && (
              <span className="font-mono text-[11px] text-muted-foreground hidden md:block mr-2">
                {events.length} {events.length === 1 ? "decisão" : "decisões"}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => window.print()}
              title="Exportar árvore (PDF)"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${viewMode === "tree" ? "text-primary bg-primary/10" : ""}`}
              onClick={() => setViewMode(v => (v === "list" ? "tree" : "list"))}
              title={
                viewMode === "list"
                  ? "Ver como árvore visual"
                  : "Ver como lista"
              }
            >
              {viewMode === "list" ? (
                <Network className="h-4 w-4" />
              ) : (
                <List className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleAnalyze()}
              title="Análise por IA"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${statsOpen ? "text-primary bg-primary/10" : ""}`}
              onClick={() => setStatsOpen(v => !v)}
              title="Estatísticas"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleTheme}
              title="Troca de tema"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  title="Perfil"
                  size="icon"
                  className="h-8 w-8"
                >
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
              onClick={() => {
                setEditEventId(null);
                setDialogOpen(true);
              }}
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
        onClick={() => {
          setEditEventId(null);
          setDialogOpen(true);
        }}
        className="sm:hidden fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <Plus className="h-5 w-5" />
      </button>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex">
        {/* ─── Timeline ─── */}
        <div
          id="myggdrasil-print-area"
          className="flex-1 overflow-y-auto px-5 py-8 lg:px-8 transition-all duration-300"
        >
          {loading ? (
            <div className="space-y-6">
              <div className="h-7 w-56 bg-muted rounded animate-pulse" />
              <div className="h-4 w-80 bg-muted/50 rounded animate-pulse" />
              <div className="space-y-4 pt-4">
                {[1, 2, 3].map(i => (
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
              <Button variant="outline" size="sm" onClick={fetchEvents}>
                Tentar novamente
              </Button>
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              onCreate={() => {
                setEditEventId(null);
                setDialogOpen(true);
              }}
            />
          ) : (
            <div className={`max-w-2xl ${panelOpen ? "" : "mx-auto"}`}>
              {/* Section header */}
              <p className="font-mono text-[11px] text-primary/70 mb-1 tracking-wide">
                // hub
              </p>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-2 leading-tight">
                Sua árvore de decisões
              </h2>
              <p className="text-muted-foreground text-sm mb-6 max-w-md leading-relaxed">
                A linha do tempo completa das suas decisões. Toque em qualquer
                nó para ver os detalhes, ou arraste um card sobre outro para
                ligá-los direto.
              </p>

              {/* Stats panel */}
              <AnimatePresence>
                {statsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mb-6"
                  >
                    <div className="grid grid-cols-3 gap-3 p-4 rounded-lg border border-border/50 bg-card/40">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                          Decisões
                        </p>
                        <p className="font-serif text-2xl font-bold text-foreground">
                          {hubStats.total}
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                          Ramificações
                        </p>
                        <p className="font-serif text-2xl font-bold text-foreground">
                          {hubStats.branches}
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                          Categorias em destaque
                        </p>
                        <div className="flex flex-col gap-1">
                          {hubStats.topCategories.length === 0 ? (
                            <span className="text-xs text-muted-foreground/60">
                              —
                            </span>
                          ) : (
                            hubStats.topCategories.map(([name, count]) => (
                              <span
                                key={name}
                                className="text-xs text-foreground"
                              >
                                {name}{" "}
                                <span className="text-muted-foreground font-mono">
                                  ({count})
                                </span>
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search input with debounce */}
              <div className="relative mb-8 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar decisão por nome..."
                  className="h-9 pl-9 pr-9 text-sm"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground/60 border border-border/50 rounded px-1 py-0.5 pointer-events-none">
                    ⌘K
                  </kbd>
                )}
              </div>

              {debouncedSearch && groupedEvents.length === 0 && (
                <p className="text-sm text-muted-foreground italic mb-6">
                  Nenhuma decisão encontrada para "{debouncedSearch}".
                </p>
              )}

              {viewMode === "tree" ? (
                <TreeView
                  events={filteredEvents}
                  relationships={allRelationships}
                  eventTypes={eventTypes}
                  selectedEventId={selectedEventId}
                  onSelect={handleSelectEvent}
                />
              ) : (
                /* Year groups */
                groupedEvents.map(([year, yearEvents]) => (
                  <div key={year} className="mb-10 last:mb-0">
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-5">
                      {year === "Sem data" ? "Sem data" : year}
                    </h3>

                    <div className="relative pl-10">
                      {/* Vertical line */}
                      <div className="absolute left-[7px] top-1 bottom-1 w-[2px] bg-primary/15 rounded-full" />

                      {yearEvents.map((ev, idx) => {
                        const isSelected = selectedEventId === ev.id;
                        const hasChildren = eventsWithChildren.has(ev.id);
                        const childIds = eventsWithChildren.get(ev.id) || [];
                        const hasParent = eventsWithParents.has(ev.id);
                        const parentIds = eventsWithParents.get(ev.id) || [];
                        const eventAccent = getDecisionAccent(
                          ev.event_type,
                          eventTypes
                        );
                        const statusOpacity = getStatusOpacity(ev.status);

                        return (
                          <motion.div
                            key={ev.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: idx * 0.04,
                              duration: 0.25,
                              ease: [0.23, 1, 0.32, 1],
                            }}
                            className="mb-3.5 last:mb-0"
                          >
                            {/* Arrow connector from parent card (drawn between parent and this card) */}
                            {hasParent && (
                              <div className="absolute left-[15px] -top-3 w-[2px] h-3">
                                <div className="absolute inset-0 bg-primary/25" />
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                                  <svg
                                    width="8"
                                    height="8"
                                    viewBox="0 0 8 8"
                                    fill="none"
                                    className="text-primary/40"
                                  >
                                    <path
                                      d="M4 0L0 4H8L4 0Z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </div>
                              </div>
                            )}

                            {/* Dot */}
                            <div className="absolute left-0 top-4">
                              <div
                                className={`w-3.5 h-3.5 rounded-full border-[2px] transition-all duration-200 relative ${
                                  isSelected
                                    ? selectedEventAccent.dot
                                    : `${eventAccent.dot} bg-background`
                                }`}
                              >
                                {/* Arrow pointing to children cards below */}
                                {hasChildren && (
                                  <div className="absolute left-1/2 -translate-x-1/2 top-full">
                                    <svg
                                      width="8"
                                      height="6"
                                      viewBox="0 0 8 6"
                                      fill="none"
                                      className="text-primary/30"
                                    >
                                      <path
                                        d="M4 6L0 0H8L4 6Z"
                                        fill="currentColor"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Card */}
                            <button
                              onClick={() => handleSelectEvent(ev.id)}
                              draggable
                              onDragStart={() => handleDragStart(ev.id)}
                              onDragEnd={handleDragEnd}
                              onDragOver={e => handleDragOverCard(e, ev.id)}
                              onDragLeave={() =>
                                setDragOverEventId(cur =>
                                  cur === ev.id ? null : cur
                                )
                              }
                              onDrop={e => handleDropOnCard(e, ev.id)}
                              className={`event-card w-full text-left p-4 rounded-lg border transition-all duration-150 relative cursor-grab active:cursor-grabbing ${
                                dragOverEventId === ev.id
                                  ? "border-primary/40 bg-card/70 ring-2 ring-primary/20"
                                  : isSelected
                                    ? "border-primary/30 bg-card/65 shadow-sm"
                                    : "border-border/60 bg-card/45 hover:border-border/80 hover:bg-card/60"
                              } ${draggedEventId === ev.id ? "opacity-40" : ""}`}
                              style={{ opacity: statusOpacity }}
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
                                    isSelected
                                      ? selectedEventAccent.badge
                                      : eventAccent.badge
                                  }`}
                                >
                                  {getEventTypeName(ev.event_type, eventTypes)}
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
                                      {parentIds.length}{" "}
                                      {parentIds.length === 1
                                        ? "antecessor"
                                        : "antecessores"}
                                    </span>
                                  )}
                                  {hasChildren && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-primary/70 bg-primary/8 px-2 py-0.5 rounded-full">
                                      <ArrowDown className="h-2.5 w-2.5" />
                                      {childIds.length}{" "}
                                      {childIds.length === 1
                                        ? "desdobramento"
                                        : "desdobramentos"}
                                    </span>
                                  )}
                                </div>
                              )}
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ─── Detail Panel ─── */}
        <AnimatePresence>
          {panelOpen && selectedEvent && (
            <motion.aside
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className={`fixed inset-0 z-40 bg-background lg:static lg:z-auto lg:inset-auto lg:w-[min(48vw,960px)] lg:min-w-[380px] border-l overflow-hidden flex-shrink-0 ${selectedEventAccent.panel}`}
            >
              <div className="w-full h-full flex flex-col min-h-0">
                {/* Panel header */}
                <div className="px-5 py-4 flex items-center justify-between border-b border-border/40">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    decisão selecionada
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleClosePanel}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Panel content */}
                <ScrollArea className="flex-1 min-h-0 px-5 py-5">
                  <h3 className="font-serif text-xl font-bold text-foreground mb-2.5 leading-snug">
                    {selectedEvent.name}
                  </h3>
                  <div className="flex items-center gap-2.5 mb-4">
                    <Badge
                      variant="secondary"
                      className={`font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 ${selectedEventAccent.panelBadge}`}
                    >
                      {getEventTypeName(selectedEvent.event_type, eventTypes)}
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

                  {/* Panel actions */}
                  <div className="sticky top-4 z-20 mb-5 rounded-2xl border border-border/50 px-4 py-3 space-y-2 bg-background/92 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                    <Button
                      onClick={() => {
                        setEditEventId(selectedEvent.id);
                        setDialogOpen(true);
                      }}
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

                  <Separator className="my-4 bg-border/40" />

                  {/* Parents */}
                  {parentEvents.length > 0 && (
                    <div className="mb-5">
                      <p className="font-mono text-[11px] text-muted-foreground mb-2.5">
                        // o que levou a esta decisão ({parentEvents.length})
                      </p>
                      {parentEvents.map(rel => (
                        <button
                          key={rel.id}
                          onClick={() => handleSelectEvent(rel.parent.id)}
                          className="block w-full text-left p-3 rounded-lg border border-border/40 bg-card/60 mb-2 hover:border-primary/25 transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <ArrowDown className="h-3 w-3 text-primary/50 group-hover:text-primary transition-colors" />
                            <p className="font-medium text-sm text-foreground">
                              {rel.parent.name}
                            </p>
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
                      {childEvents.map(rel => (
                        <div
                          key={rel.id}
                          className="flex items-center gap-2 p-3 rounded-lg border border-border/40 bg-card/60 mb-2 group"
                        >
                          <ArrowDown className="h-3 w-3 text-primary/50 group-hover:text-primary transition-colors flex-shrink-0" />
                          <button
                            onClick={() => handleSelectEvent(rel.child.id)}
                            className="flex-1 text-left"
                          >
                            <p className="font-medium text-sm text-foreground">
                              {rel.child.name}
                            </p>
                            {rel.relationship && (
                              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                                {rel.relationship}
                              </p>
                            )}
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteRelationship(rel.id);
                            }}
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
        eventTypes={eventTypes}
        onCreateType={async (name: string) => {
          const result = await createEventType(name);
          await fetchEventTypes();
          return result.id;
        }}
        onCreate={handleCreateEvent}
        onUpdate={handleUpdateEvent}
        selectedEventId={selectedEventId}
      />

      {/* ─── Link Relationship Dialog (Dropdown) ─── */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">
              Adicionar desdobramento
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Selecione uma decisão existente para vinculá-la como consequência
            desta.
          </p>

          {availableLinkEvents.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-3">
                Você precisa de pelo menos uma outra decisão para criar um
                desdobramento.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLinkDialogOpen(false);
                  setDialogOpen(true);
                }}
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
                    {availableLinkEvents.map(ev => (
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
                    <p className="text-xs text-muted-foreground mb-1">
                      Parent (esta decisão)
                    </p>
                    <p className="font-medium text-sm text-foreground">
                      {selectedEvent?.name}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary/60 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">
                      Child (consequência)
                    </p>
                    <p className="font-medium text-sm text-foreground">
                      {events.find(e => e.id === Number(linkChildId))?.name}
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
      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-lg">
              Excluir decisão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. A decisão e suas relações serão
              removidas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteConfirmId && handleDeleteEvent(deleteConfirmId)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── IA Analyzer Dialog ─── */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Análise da sua trajetória
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Gerado por IA a partir das suas decisões e relações registradas.
            </p>
          </DialogHeader>

          {aiLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Analisando sua árvore de decisões...
              </p>
            </div>
          ) : aiError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <p className="text-sm text-destructive">{aiError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAnalyze()}
              >
                Tentar novamente
              </Button>
            </div>
          ) : aiResult ? (
            <div className="space-y-5 mt-1">
              {aiResult.cached && (
                <div className="flex items-center justify-between gap-2 -mt-1 mb-1 px-3 py-2 rounded-md border border-border/40 bg-muted/30">
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Resultado salvo em cache
                    {aiResult.geradoEm &&
                      ` · gerado em ${new Date(aiResult.geradoEm).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`}
                  </p>
                  <button
                    onClick={() => handleAnalyze(true)}
                    className="text-[11px] font-mono text-primary hover:underline whitespace-nowrap"
                  >
                    Gerar novamente
                  </button>
                </div>
              )}
              {aiResult.resumo && (
                <p className="text-sm text-foreground/85 leading-relaxed">
                  {aiResult.resumo}
                </p>
              )}

              {aiResult.decisoes_mais_proveitosas.length > 0 && (
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-primary/80 mb-2">
                    Decisões mais proveitosas
                  </p>
                  <div className="space-y-2">
                    {aiResult.decisoes_mais_proveitosas.map((d, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg border border-border/40 bg-card/50"
                      >
                        <p className="font-medium text-sm text-foreground">
                          {d.nome}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {d.motivo}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiResult.decisoes_boas_consequencias.length > 0 && (
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-primary/80 mb-2">
                    Decisões com boas consequências
                  </p>
                  <div className="space-y-2">
                    {aiResult.decisoes_boas_consequencias.map((d, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg border border-border/40 bg-card/50"
                      >
                        <p className="font-medium text-sm text-foreground">
                          {d.nome}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {d.motivo}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiResult.recomendacoes.length > 0 && (
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-primary/80 mb-2">
                    Próximos passos sugeridos
                  </p>
                  <ul className="space-y-1.5">
                    {aiResult.recomendacoes.map((r, i) => (
                      <li
                        key={i}
                        className="text-sm text-foreground/80 flex gap-2"
                      >
                        <span className="text-primary/60">→</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiResult.categorias_atencao.length > 0 && (
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-primary/80 mb-2">
                    Categorias que merecem atenção
                  </p>
                  <div className="space-y-2">
                    {aiResult.categorias_atencao.map((c, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg border border-border/40 bg-card/50"
                      >
                        <p className="font-medium text-sm text-foreground">
                          {c.categoria}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {c.motivo}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
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
        Toda trajetória começa com uma decisão. Registre um momento que ajudou a
        formar o caminho até aqui.
      </p>
      <Button onClick={onCreate} className="gap-1.5 h-10">
        <Plus className="h-4 w-4" />
        Registrar primeira decisão
      </Button>
    </div>
  );
}

// ---- Event Dialog (Create/Edit) ----
function EventDialog({
  open,
  onOpenChange,
  editEventId,
  events,
  eventTypes,
  onCreateType,
  onCreate,
  onUpdate,
  selectedEventId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editEventId: number | null;
  events: Event[];
  eventTypes: EventType[];
  onCreateType: (name: string) => Promise<number>;
  onCreate: (data: Record<string, any>) => Promise<any>;
  onUpdate: (id: number, data: Record<string, any>) => void;
  selectedEventId: number | null;
}) {
  const [name, setName] = useState("");
  const [eventType, setEventType] = useState("1");
  const [when, setWhen] = useState("");
  const [why, setWhy] = useState("");
  const [status, setStatus] = useState("ativo");
  const [parentId, setParentId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [newCategoryMode, setNewCategoryMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const editEvent = useMemo(
    () => (editEventId ? events.find(e => e.id === editEventId) : null),
    [editEventId, events]
  );

  useEffect(() => {
    setNewCategoryMode(false);
    setNewCategoryName("");
    if (editEvent) {
      setName(editEvent.name);
      setEventType(String(getEventTypeId(editEvent.event_type)));
      setWhen(editEvent.when || "");
      setWhy(editEvent.why);
      setStatus(editEvent.status);
      setParentId(selectedEventId ? String(selectedEventId) : "");
    } else {
      setName("");
      setEventType("1");
      setWhen("");
      setWhy("");
      setStatus("ativo");
      setParentId(selectedEventId ? String(selectedEventId) : "");
    }
  }, [editEvent, open, selectedEventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        name,
        event_type: eventType,
        when: when || undefined,
        why,
        status,
      };
      if (editEventId) {
        await onUpdate(editEventId, data);
      } else {
        const result = await onCreate(data);
        // If parent selected, create relationship
        if (parentId && result) {
          try {
            await createRelationship(Number(parentId), result.id, "levou a");
          } catch {}
        }
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

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
            <Label
              htmlFor="event-name"
              className="font-mono text-[11px] uppercase tracking-wider"
            >
              Título da decisão
            </Label>
            <Input
              id="event-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Começar a estudar React"
              required
              className="h-10"
            />
          </div>

          {/* Date + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="event-when"
                className="font-mono text-[11px] uppercase tracking-wider"
              >
                Data
              </Label>
              <Input
                id="event-when"
                type="date"
                value={when}
                onChange={e => setWhen(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="event-type"
                className="font-mono text-[11px] uppercase tracking-wider"
              >
                Categoria
              </Label>
              <Select
                value={eventType}
                onValueChange={v => {
                  if (v === "__new__") {
                    setNewCategoryMode(true);
                    return;
                  }
                  setEventType(v);
                }}
              >
                <SelectTrigger id="event-type" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(t => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                      {!t.is_default ? " ✦" : ""}
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__" className="text-primary">
                    + Nova categoria...
                  </SelectItem>
                </SelectContent>
              </Select>

              {newCategoryMode && (
                <div className="flex items-center gap-1.5 pt-1">
                  <Input
                    autoFocus
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="Nome da nova categoria"
                    className="h-8 text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 px-2.5 text-xs"
                    disabled={!newCategoryName.trim() || creatingCategory}
                    onClick={async () => {
                      setCreatingCategory(true);
                      try {
                        const newId = await onCreateType(
                          newCategoryName.trim()
                        );
                        setEventType(String(newId));
                        setNewCategoryMode(false);
                        setNewCategoryName("");
                        toast.success("Categoria criada");
                      } catch (err: any) {
                        const msg =
                          err?.response?.data?.message ||
                          "Erro ao criar categoria";
                        toast.error(typeof msg === "string" ? msg : msg[0]);
                      } finally {
                        setCreatingCategory(false);
                      }
                    }}
                  >
                    {creatingCategory ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => {
                      setNewCategoryMode(false);
                      setNewCategoryName("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Why */}
          <div className="space-y-1.5">
            <Label
              htmlFor="event-why"
              className="font-mono text-[11px] uppercase tracking-wider"
            >
              O que motivou isso?
            </Label>
            <Textarea
              id="event-why"
              value={why}
              onChange={e => setWhy(e.target.value)}
              placeholder="Descreva o contexto, motivação ou reflexão..."
              rows={3}
              required
            />
          </div>

          {/* Status + Parent */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="event-status"
                className="font-mono text-[11px] uppercase tracking-wider"
              >
                Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="event-status" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["ativo", "concluído", "em andamento", "pausado"].map(s => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!editEventId && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="event-parent"
                  className="font-mono text-[11px] uppercase tracking-wider"
                >
                  Ligada a (opcional)
                </Label>
                <Select
                  value={parentId || "none"}
                  onValueChange={v => setParentId(v === "none" ? "" : v)}
                >
                  <SelectTrigger id="event-parent" className="h-10">
                    <SelectValue placeholder="Nenhuma decisão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma decisão</SelectItem>
                    {events.map(ev => (
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-10"
            >
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
  );
}
