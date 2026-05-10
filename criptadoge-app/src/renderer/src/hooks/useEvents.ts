import { useCallback, useState, useEffect } from 'react'
import { AppEvent, EventFormData } from '../data/events'
import * as eventsApi from '../api/eventsApi'

interface UseEventsResult {
  events: AppEvent[]
  isLoading: boolean
  addEvent: (eventData: EventFormData) => Promise<void>
  refreshEvents: () => Promise<void>
}

export const useEvents = (): UseEventsResult => {
  const [events, setEvents] = useState<AppEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await eventsApi.getEvents()
      setEvents(data)
    } catch (error) {
      console.error('Error cargando eventos:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const addEvent = async (eventData: EventFormData): Promise<void> => {
    const newEvent = await eventsApi.createEvent(eventData)
    setEvents((prev) => [...prev, newEvent])
  }

  return { events, isLoading, addEvent, refreshEvents: fetchEvents }
}
