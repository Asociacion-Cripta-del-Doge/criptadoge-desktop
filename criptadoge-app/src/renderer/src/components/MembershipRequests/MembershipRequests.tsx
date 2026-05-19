import React, { useEffect, useMemo, useState } from 'react'
import {
  getMembershipRequests,
  MembershipRequest,
  MembershipRequestStatus
} from '../../api/membershipRequestsApi'
import styles from './MembershipRequests.module.scss'

const MEMBERSHIP_STATUS_OPTIONS: Array<{
  value: MembershipRequestStatus | 'todos'
  label: string
}> = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'Revisada', label: 'Revisada' },
  { value: 'Aprobada', label: 'Aprobada' },
  { value: 'Rechazada', label: 'Rechazada' }
]

const formatDateTime = (value: string): string => {
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

const formatBirthdate = (value: string): string => {
  if (!value) return 'Sin fecha'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

const getStatusClass = (status: string): string => {
  const normalized = status.toLowerCase()

  if (normalized === 'pendiente') return styles.pending
  if (normalized === 'revisada') return styles.reviewed
  if (normalized === 'aprobada') return styles.approved
  if (normalized === 'rechazada') return styles.rejected
  return styles.neutral
}

const getEmptyMessage = (searchTerm: string, statusFilter: string): string => {
  if (searchTerm) return `No se han encontrado solicitudes con "${searchTerm}"`
  if (statusFilter !== 'todos') return 'No hay solicitudes con ese estado.'
  return 'No hay solicitudes de membresia registradas.'
}

export const MembershipRequests: React.FC = () => {
  const [requests, setRequests] = useState<MembershipRequest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRequests = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getMembershipRequests()
        setRequests(data)
      } catch (err) {
        console.error('Error al cargar solicitudes de membresia:', err)
        setError('No se pudieron cargar las solicitudes de membresia.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [])

  const filteredRequests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return requests.filter((request) => {
      const matchesStatus = statusFilter === 'todos' || request.status === statusFilter
      const matchesSearch =
        !term ||
        [
          request.name,
          request.email,
          request.phone,
          request.birthdate,
          request.howDidYouKnow,
          request.status
        ].some((value) => value.toLowerCase().includes(term))

      return matchesStatus && matchesSearch
    })
  }, [requests, searchTerm, statusFilter])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>SOLICITUDES DE MEMBRESIA</h1>
          <p>Consulta las peticiones recibidas desde la web publica.</p>
        </div>
      </header>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Buscar por nombre, email, telefono o estado..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {MEMBERSHIP_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Nacimiento</th>
              <th>Origen</th>
              <th>Estado</th>
              <th>Recibida</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className={styles.statusMessage}>
                  Cargando solicitudes de membresia...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className={`${styles.statusMessage} ${styles.errorMessage}`}>
                  {error}
                </td>
              </tr>
            ) : filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td data-label="Nombre">
                    <strong>{request.name || 'Sin nombre'}</strong>
                  </td>
                  <td data-label="Email">
                    {request.email ? (
                      <a href={`mailto:${request.email}`} className={styles.emailLink}>
                        {request.email}
                      </a>
                    ) : (
                      'Sin email'
                    )}
                  </td>
                  <td data-label="Telefono">
                    {request.phone ? (
                      <a href={`tel:${request.phone}`} className={styles.phoneLink}>
                        {request.phone}
                      </a>
                    ) : (
                      'Sin telefono'
                    )}
                  </td>
                  <td data-label="Nacimiento">{formatBirthdate(request.birthdate)}</td>
                  <td data-label="Origen" className={styles.sourceCell}>
                    {request.howDidYouKnow || 'No indicado'}
                  </td>
                  <td data-label="Estado">
                    <span className={`${styles.badge} ${getStatusClass(request.status)}`}>
                      {request.status || 'Pendiente'}
                    </span>
                  </td>
                  <td data-label="Recibida">{formatDateTime(request.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className={styles.statusMessage}>
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
