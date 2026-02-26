import { apiClient } from './axiosClient'
import { AppEvent } from '../data/events'

export const getEvents = async (): Promise<AppEvent[]> => {
  const { data } = await apiClient.get('/eventos')
  return data.map((evt: any) => ({ ...evt, id: evt._id }))
}

export const getEventById = async (id: string): Promise<AppEvent> => {
  const { data } = await apiClient.get(`/eventos/${id}`)
  return { ...data, id: data._id }
}

export const createEvent = async (eventData: any): Promise<AppEvent> => {
  const { data } = await apiClient.post('/eventos', eventData)
  return { ...data, id: data._id }
}

export const deleteEvent = async (id: string): Promise<void> => {
  await apiClient.delete(`/eventos/${id}`)
}

export const updateEvent = async (id: string, eventData: any): Promise<AppEvent> => {
  const { data } = await apiClient.put(`/eventos/${id}`, eventData)
  return { ...data, id: data._id }
}
