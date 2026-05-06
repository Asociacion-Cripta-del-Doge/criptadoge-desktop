import React, { useEffect, useMemo, useState } from 'react'
import styles from './ContactMessages.module.scss'
import { ContactMessage, getContactMessages } from '../../api/contactMessagesApi'

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
  if (normalized === 'resuelto' || normalized === 'respondido') return styles.resolved
  return styles.neutral
}

export const ContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    if (!term) return messages

    return messages.filter((message) =>
      [message.nombre, message.email, message.asunto, message.mensaje, message.estado].some(
        (value) => value.toLowerCase().includes(term)
      )
    )
  }, [messages, searchTerm])

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
        </div>

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
            ) : error ? (
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
                    <span className={`${styles.badge} ${getStatusClass(message.estado)}`}>
                      {message.estado}
                    </span>
                  </td>
                  <td data-label="Recibido">{formatDate(message.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className={styles.statusMessage}>
                  {searchTerm
                    ? `No se han encontrado mensajes con "${searchTerm}"`
                    : 'No hay mensajes de contacto registrados.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
