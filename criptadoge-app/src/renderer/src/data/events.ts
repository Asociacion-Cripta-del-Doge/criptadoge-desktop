// src/data/events.ts

export interface AppEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  label: string
  status?: string
}

export const MOCK_EVENTS: AppEvent[] = [
  {
    id: '1',
    title: 'Torneo Pauper FNM',
    description: 'Torneo suizo de 4 rondas. Premios en sobres para el top 4.',
    date: '2026-03-15',
    time: '17:30',
    label: 'Magic: The Gathering'
  },
  {
    id: '2',
    title: 'Presentación Nueva Expansión',
    description: 'Torneo sellado con la nueva caja. Incluye kit de presentación.',
    date: '2026-04-02',
    time: '10:00',
    label: 'Yu-Gi-Oh!'
  },
  {
    id: '3',
    title: 'Tarde de Commander',
    description: 'Juego libre formato Commander multiplayer. Entrada gratuita.',
    date: '2026-01-20',
    time: '16:00',
    label: 'Magic: The Gathering'
  }
]
