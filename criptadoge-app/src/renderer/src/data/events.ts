export const DEFAULT_EVENT_LABEL_COLOR = '#94a3b8'

export interface EventLabel {
  id: string
  name: string
  color?: string
}

export interface EventFormData {
  title: string
  description: string
  date: string
  time: string
  label: string
}

export interface AppEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  label: string
  status?: string
}

export const getEventLabelTint = (color: string, alpha: number): string => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color)

  if (!match) {
    return 'rgba(148, 163, 184, 0.2)'
  }

  const [, r, g, b] = match
  return `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${alpha})`
}
