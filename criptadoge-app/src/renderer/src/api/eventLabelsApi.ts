import { apiClient } from './axiosClient'
import { EventLabel } from '../data/events'

interface EventLabelResponse {
  _id?: string
  id?: string
  name: string
  color?: string
}

const mapEventLabel = (label: EventLabelResponse): EventLabel => ({
  id: label._id ?? label.id ?? label.name,
  name: label.name,
  color: label.color
})

export const getEventLabels = async (): Promise<EventLabel[]> => {
  const { data } = await apiClient.get('/event-labels')
  return data.map(mapEventLabel)
}

export const createEventLabel = async (labelData: {
  name: string
  color?: string
}): Promise<EventLabel> => {
  const { data } = await apiClient.post('/event-labels', labelData)
  return mapEventLabel(data)
}

export const updateEventLabel = async (
  id: string,
  labelData: {
    name?: string
    color?: string
  }
): Promise<EventLabel> => {
  const { data } = await apiClient.patch(`/event-labels/${id}`, labelData)
  return mapEventLabel(data)
}

export const deleteEventLabel = async (id: string): Promise<void> => {
  await apiClient.delete(`/event-labels/${id}`)
}
