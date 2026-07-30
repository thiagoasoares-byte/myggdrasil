import axios from 'axios'

/**
 * Cliente HTTP para as rotas do NestJS.
 *
 * Comportamento:
 * - Dev (pnpm run dev): usa o proxy do Vite (/api -> localhost:3000)
 *   O proxy funciona porque frontend e proxy estão na mesma origem.
 * - Produção (dist): usa a URL direta do backend via VITE_API_URL.
 *   Nesse caso, o backend precisa ter CORS configurado.
 */

const isDev = import.meta.env.DEV
const API_BASE = isDev ? '/api' : (import.meta.env.VITE_API_URL || '/api')

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export type User = {
  id: number
  name: string
  email: string
  email_verified: boolean
  birth_dt?: string
  created_at?: string
  updated_at?: string
}

export type EventType = {
  id: number
  name: string
  is_default: boolean
}

export type Event = {
  id: number
  name: string
  event_type: EventType | number
  when?: string
  why: string
  status: string
  created_at?: string
  updated_at?: string
}

export type CreateEventInput = Omit<Event, 'id'>

export type ApiMessage = {
  message: string
}

export type EventRelationship = {
  id: number
  parent: Event
  child: Event
  relationship?: string
  created_at?: string
  updated_at?: string
}

// ---- API Functions ----

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<{ user: User }>('/auth/me')
  return data.user
}

export async function getEvents(): Promise<Event[]> {
  const { data } = await api.get<Event[]>('/events')
  return data
}

export async function getEvent(id: number): Promise<Event> {
  const { data } = await api.get<Event>(`/events/${id}`)
  return data
}

export async function createEvent(input: CreateEventInput): Promise<{ id: number }> {
  const { data } = await api.post<ApiMessage>('/events', input)
  const match = data.message.match(/\[(\d+)\]/)
  return { id: match ? Number(match[1]) : 0 }
}

export async function updateEvent(id: number, input: CreateEventInput): Promise<void> {
  await api.put(`/events/${id}`, input)
}

export async function deleteEvent(id: number): Promise<void> {
  await api.delete(`/events/${id}`)
}

export async function createRelationship(parentId: number, childId: number, relationship?: string): Promise<EventRelationship> {
  const { data } = await api.post<EventRelationship>('/event-relationships', { parentId, childId, relationship })
  return data
}

export async function getRelationships(eventId: number): Promise<EventRelationship[]> {
  const { data } = await api.get<EventRelationship[]>(`/events/${eventId}/relationships`)
  return data
}

export async function deleteRelationship(id: number): Promise<void> {
  await api.delete(`/event-relationships/${id}`)
}

// Event type IDs (hardcoded until GET /event-types exists)
export const EVENT_TYPE_IDS = [
  { id: 1, name: 'Decisão' },
  { id: 2, name: 'Estudo' },
  { id: 3, name: 'Carreira' },
  { id: 4, name: 'Projeto pessoal' },
  { id: 5, name: 'Financeiro' },
  { id: 6, name: 'Pessoal' },
] as const

export const EVENT_STATUS_OPTIONS = ['ativo', 'concluído', 'em andamento', 'pausado'] as const
