import React, { useEffect, useMemo, useState } from 'react'
import styles from './ReservationManagement.module.scss'
import { Modal } from '../Modal/Modal'
import { Mesa, getMesas } from '../../api/mesasApi'
import {
  DisponibilidadReserva,
  ReservaFormData,
  ReservaMesa,
  cancelReserva,
  checkReservaDisponibilidad,
  createReserva,
  getReservas,
  sortReservas
} from '../../api/reservasApi'

const toDatetimeLocalValue = (date: Date): string => {
  const timezoneOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

const buildEmptyForm = (mesaId = ''): ReservaFormData => {
  const start = new Date()
  start.setMinutes(0, 0, 0)
  start.setHours(start.getHours() + 1)

  const end = new Date(start)
  end.setHours(end.getHours() + 2)

  return {
    mesaId,
    fechaHoraInicio: toDatetimeLocalValue(start),
    fechaHoraFin: toDatetimeLocalValue(end),
    asientosReservados: 1
  }
}

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response
    const message = response?.data?.message

    if (Array.isArray(message)) return message.join(' ')
    if (message) return message
  }

  return 'No se ha podido completar la operacion.'
}

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

const getEstadoClass = (estado: string): string => {
  if (estado === 'PENDIENTE') return styles.pending
  if (estado === 'CONFIRMADA') return styles.confirmed
  if (estado === 'CANCELADA') return styles.cancelled
  if (estado === 'COMPLETADA') return styles.completed
  return styles.neutral
}

const canCancel = (reserva: ReservaMesa): boolean =>
  reserva.estado !== 'CANCELADA' && reserva.estado !== 'COMPLETADA'

export const ReservationManagement: React.FC = () => {
  const [reservas, setReservas] = useState<ReservaMesa[]>([])
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('TODAS')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<ReservaFormData>(buildEmptyForm())
  const [availability, setAvailability] = useState<DisponibilidadReserva | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchData = async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      const [reservasData, mesasData] = await Promise.all([getReservas(), getMesas()])
      setReservas(reservasData)
      setMesas(mesasData)
      setFormData(buildEmptyForm(mesasData[0]?.id ?? ''))
    } catch (err) {
      console.error('Error al cargar reservas:', err)
      setError('No se pudieron cargar las reservas.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredReservas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return reservas.filter((reserva) => {
      const matchesEstado = estadoFilter === 'TODAS' || reserva.estado === estadoFilter
      const mesaLabel = reserva.mesa ? `mesa ${reserva.mesa.orden}` : reserva.mesaId
      const userName = reserva.user?.name ?? ''
      const userEmail = reserva.user?.email ?? ''
      const matchesSearch =
        !term ||
        [
          mesaLabel,
          userName,
          userEmail,
          reserva.estado,
          reserva.asientosReservados.toString()
        ].some((value) => value.toLowerCase().includes(term))

      return matchesEstado && matchesSearch
    })
  }, [estadoFilter, reservas, searchTerm])

  const openCreateModal = (): void => {
    setError(null)
    setAvailability(null)
    setFormData(buildEmptyForm(mesas[0]?.id ?? ''))
    setIsModalOpen(true)
  }

  const closeModal = (): void => {
    if (isSubmitting || isChecking) return
    setIsModalOpen(false)
    setAvailability(null)
  }

  const updateFormField =
    (field: keyof ReservaFormData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      const value =
        field === 'asientosReservados'
          ? Math.max(1, Number(event.target.value))
          : event.target.value
      setFormData((prev) => ({ ...prev, [field]: value }))
      setAvailability(null)
    }

  const handleCheckAvailability = async (): Promise<DisponibilidadReserva | null> => {
    try {
      setIsChecking(true)
      setError(null)
      const data = await checkReservaDisponibilidad(formData)
      setAvailability(data)
      return data
    } catch (err) {
      console.error('Error al consultar disponibilidad:', err)
      setAvailability(null)
      setError(getErrorMessage(err))
      return null
    } finally {
      setIsChecking(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setError(null)

      const checkedAvailability = availability ?? (await handleCheckAvailability())
      if (!checkedAvailability?.disponible) {
        setError('No hay asientos suficientes para ese horario.')
        return
      }

      const newReserva = await createReserva(formData)
      setReservas((prev) => sortReservas([newReserva, ...prev]))
      closeModal()
    } catch (err) {
      console.error('Error al crear reserva:', err)
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = async (reserva: ReservaMesa): Promise<void> => {
    const confirmed = window.confirm('Quieres cancelar esta reserva?')
    if (!confirmed) return

    try {
      setCancellingId(reserva.id)
      setError(null)
      const cancelledReserva = await cancelReserva(reserva.id)
      setReservas((prev) =>
        sortReservas(
          prev.map((item) => (item.id === cancelledReserva.id ? cancelledReserva : item))
        )
      )
    } catch (err) {
      console.error('Error al cancelar reserva:', err)
      setError(getErrorMessage(err))
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>GESTION DE RESERVAS</h1>
          <p>Controla las reservas de mesas, disponibilidad y cancelaciones.</p>
        </div>
        <button
          className={styles.primaryBtn}
          onClick={openCreateModal}
          disabled={mesas.length === 0}
        >
          + Nueva Reserva
        </button>
      </header>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Buscar por socio, email, mesa o estado..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <select
            className={styles.filterSelect}
            value={estadoFilter}
            onChange={(event) => setEstadoFilter(event.target.value)}
          >
            <option value="TODAS">Todas</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="CONFIRMADA">Confirmadas</option>
            <option value="CANCELADA">Canceladas</option>
            <option value="COMPLETADA">Completadas</option>
          </select>
        </div>

        {error ? <div className={styles.errorBanner}>{error}</div> : null}

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mesa</th>
              <th>Socio</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Asientos</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className={styles.statusMessage}>
                  Cargando reservas...
                </td>
              </tr>
            ) : filteredReservas.length > 0 ? (
              filteredReservas.map((reserva) => (
                <tr key={reserva.id}>
                  <td data-label="Mesa">
                    <strong>{reserva.mesa ? `Mesa ${reserva.mesa.orden}` : 'Sin mesa'}</strong>
                  </td>
                  <td data-label="Socio">
                    <span>{reserva.user?.name ?? 'Usuario actual'}</span>
                    {reserva.user?.email ? (
                      <small className={styles.mutedText}>{reserva.user.email}</small>
                    ) : null}
                  </td>
                  <td data-label="Inicio">{formatDateTime(reserva.fechaHoraInicio)}</td>
                  <td data-label="Fin">{formatDateTime(reserva.fechaHoraFin)}</td>
                  <td data-label="Asientos">{reserva.asientosReservados}</td>
                  <td data-label="Estado">
                    <span className={`${styles.badge} ${getEstadoClass(reserva.estado)}`}>
                      {reserva.estado}
                    </span>
                  </td>
                  <td data-label="Acciones">
                    <button
                      className={styles.dangerBtn}
                      onClick={() => handleCancel(reserva)}
                      disabled={!canCancel(reserva) || cancellingId === reserva.id}
                    >
                      {cancellingId === reserva.id ? 'Cancelando...' : 'Cancelar'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className={styles.statusMessage}>
                  {searchTerm || estadoFilter !== 'TODAS'
                    ? 'No hay reservas que coincidan con el filtro.'
                    : 'No hay reservas registradas.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="NUEVA RESERVA">
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Mesa</label>
            <select
              required
              disabled={isSubmitting || isChecking}
              value={formData.mesaId}
              onChange={updateFormField('mesaId')}
            >
              {mesas.map((mesa) => (
                <option key={mesa.id} value={mesa.id}>
                  Mesa {mesa.orden} - {mesa.asientos} asientos
                </option>
              ))}
            </select>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Inicio</label>
              <input
                type="datetime-local"
                required
                disabled={isSubmitting || isChecking}
                value={formData.fechaHoraInicio}
                onChange={updateFormField('fechaHoraInicio')}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Fin</label>
              <input
                type="datetime-local"
                required
                disabled={isSubmitting || isChecking}
                value={formData.fechaHoraFin}
                onChange={updateFormField('fechaHoraFin')}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Asientos reservados</label>
            <input
              type="number"
              min={1}
              step={1}
              required
              disabled={isSubmitting || isChecking}
              value={formData.asientosReservados}
              onChange={updateFormField('asientosReservados')}
            />
          </div>

          {availability ? (
            <div
              className={`${styles.availability} ${
                availability.disponible ? styles.available : styles.unavailable
              }`}
            >
              <strong>{availability.disponible ? 'Disponible' : 'Sin disponibilidad'}</strong>
              <span>
                {availability.asientosDisponibles} de {availability.asientosTotales} asientos libres
              </span>
            </div>
          ) : null}

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={handleCheckAvailability}
              disabled={isSubmitting || isChecking || !formData.mesaId}
            >
              {isChecking ? 'Consultando...' : 'Comprobar'}
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting || isChecking || !formData.mesaId}
            >
              {isSubmitting ? 'Creando...' : 'Crear Reserva'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
