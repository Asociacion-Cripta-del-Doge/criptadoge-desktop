import { useState, useEffect } from 'react'
import { AppEvent } from '../data/events'
import * as eventsApi from '../api/eventsApi'

export const useEvents = () => {
  const [events, setEvents] = useState<AppEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const data = await eventsApi.getEvents()
      setEvents(data)
    } catch (error) {
      console.error('Error cargando eventos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const addEvent = async (eventData: any) => {
    const newEvent = await eventsApi.createEvent(eventData)
    setEvents((prev) => [...prev, newEvent])
  }

  return { events, isLoading, addEvent }
}
