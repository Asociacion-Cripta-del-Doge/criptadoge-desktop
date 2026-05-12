import React, { useEffect, useMemo, useState } from 'react'
import styles from './ContactMessages.module.scss'
import {
  ContactMessage,
  ContactMessageStatus,
  getContactMessages,
  updateContactMessageStatus
} from '../../api/contactMessagesApi'

const CONTACT_STATUS_OPTIONS: Array<{ value: ContactMessageStatus; label: string }> = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'respondido', label: 'Respondido' },
  { value: 'resuelto', label: 'Resuelto' },
  { value: 'archivado', label: 'Archivado' }
]

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response
    const message = response?.data?.message

    if (Array.isArray(message)) return message.join(' ')
    if (message) return message
  }

  return 'No se pudo actualizar el estado del mensaje.'
}

const formatDate = (value: string): string => {
  if (!value) return 'Sin fecha'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getStatusClass = (estado: string): string => {
  const normalized = estado.toLowerCase()

  if (normalized === 'pendiente') return styles.pending
  if (normalized === 'en_proceso') return styles.inProgress
  if (normalized === 'resuelto' || normalized === 'respondido') return styles.resolved
  if (normalized === 'archivado') return styles.archived
  return styles.neutral
}

const getEmptyMessage = (searchTerm: string, statusFilter: string): string => {
  if (searchTerm) return `No se han encontrado mensajes con "${searchTerm}"`
  if (statusFilter !== 'todos') return 'No hay mensajes con ese estado.'
  return 'No hay mensajes de contacto registrados.'
}

export const ContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchMessages = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getContactMessages()
        setMessages(data)
      } catch (err) {
        console.error('Error al cargar mensajes de contacto:', err)
        setError('No se pudieron cargar los mensajes de contacto.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [])

  const filteredMessages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return messages.filter((message) => {
      const matchesStatus = statusFilter === 'todos' || message.estado === statusFilter
      const matchesSearch =
        !term ||
        [message.nombre, message.email, message.asunto, message.mensaje, message.estado].some(
          (value) => value.toLowerCase().includes(term)
        )

      return matchesStatus && matchesSearch
    })
  }, [messages, searchTerm, statusFilter])

  const handleStatusChange = async (
    message: ContactMessage,
    nextStatus: ContactMessageStatus
  ): Promise<void> => {
    if (!message.id || message.estado === nextStatus) return

    const previousStatus = message.estado

    try {
      setUpdatingId(message.id)
      setError(null)
      setMessages((prev) =>
        prev.map((item) => (item.id === message.id ? { ...item, estado: nextStatus } : item))
      )

      const updatedMessage = await updateContactMessageStatus(message.id, nextStatus)
      setMessages((prev) =>
        prev.map((item) => (item.id === updatedMessage.id ? updatedMessage : item))
      )
    } catch (err) {
      console.error('Error al actualizar estado del mensaje:', err)
      setMessages((prev) =>
        prev.map((item) => (item.id === message.id ? { ...item, estado: previousStatus } : item))
      )
      setError(getErrorMessage(err))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>MENSAJES DE CONTACTO</h1>
          <p>Solicitudes recibidas desde el formulario publico</p>
        </div>
      </header>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Buscar por nombre, email, asunto o estado..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="todos">Todos los estados</option>
            {CONTACT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {error && messages.length > 0 ? <div className={styles.errorBanner}>{error}</div> : null}

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Asunto</th>
              <th>Mensaje</th>
              <th>Estado</th>
              <th>Recibido</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className={styles.statusMessage}>
                  Cargando mensajes de contacto...
                </td>
              </tr>
            ) : error && messages.length === 0 ? (
              <tr>
                <td colSpan={6} className={`${styles.statusMessage} ${styles.errorMessage}`}>
                  {error}
                </td>
              </tr>
            ) : filteredMessages.length > 0 ? (
              filteredMessages.map((message) => (
                <tr key={message.id}>
                  <td data-label="Nombre">{message.nombre}</td>
                  <td data-label="Email">
                    <a href={`mailto:${message.email}`} className={styles.emailLink}>
                      {message.email}
                    </a>
                  </td>
                  <td data-label="Asunto" className={styles.subjectCell}>
                    {message.asunto}
                  </td>
                  <td data-label="Mensaje" className={styles.messageCell}>
                    {message.mensaje}
                  </td>
                  <td data-label="Estado">
                    <div className={`${styles.statusControl} ${getStatusClass(message.estado)}`}>
                      <select
                        className={styles.statusSelect}
                        value={message.estado}
                        aria-label={`Cambiar estado de ${message.asunto}`}
                        disabled={!message.id || updatingId === message.id}
                        onChange={(event) =>
                          handleStatusChange(message, event.target.value as ContactMessageStatus)
                        }
                      >
                        {CONTACT_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td data-label="Recibido">{formatDate(message.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className={styles.statusMessage}>
                  {getEmptyMessage(searchTerm, statusFilter)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
