import { apiClient } from './axiosClient'

export interface ContactMessage {
  id: string
  nombre: string
  email: string
  asunto: string
  mensaje: string
  estado: string
  createdAt: string
  updatedAt: string
}

type RawContactMessage = Partial<ContactMessage> & {
  _id?: string
}

type ContactMessagesResponse =
  | RawContactMessage[]
  | {
      items?: RawContactMessage[]
      data?: RawContactMessage[]
    }

const normalizeContactMessage = (message: RawContactMessage): ContactMessage => ({
  id: message.id ?? message._id ?? '',
  nombre: message.nombre ?? '',
  email: message.email ?? '',
  asunto: message.asunto ?? '',
  mensaje: message.mensaje ?? '',
  estado: message.estado ?? 'pendiente',
  createdAt: message.createdAt ?? '',
  updatedAt: message.updatedAt ?? ''
})

export const getContactMessages = async (): Promise<ContactMessage[]> => {
  const { data } = await apiClient.get<ContactMessagesResponse>('/contacto')
  const messages = Array.isArray(data) ? data : (data?.items ?? data?.data ?? [])

  return messages
    .map(normalizeContactMessage)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
