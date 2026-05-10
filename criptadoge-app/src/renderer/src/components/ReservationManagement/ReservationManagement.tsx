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
  end.setHours(end.getHours() + 1)

  return {
    mesaId,
    fechaHoraInicio: toDatetimeLocalValue(start),
    fechaHoraFin: toDatetimeLocalValue(end),
    asientosReservados: 2
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

const formatPrice = (value: number): string =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)

const getEstadoClass = (estado: string): string => {
  if (estado === 'PENDIENTE') return styles.pending
  if (estado === 'CONFIRMADA') return styles.confirmed
  if (estado === 'CANCELADA') return styles.cancelled
  if (estado === 'COMPLETADA') return styles.completed
  return styles.neutral
}

const canCancel = (reserva: ReservaMesa): boolean =>
  reserva.estado !== 'CANCELADA' && reserva.estado !== 'COMPLETADA'

const getReservableSeatsLimit = (mesa?: Mesa): number => {
  if (!mesa) return 2
  return Math.floor(mesa.asientos / 2) * 2
}

const normalizeSeatCount = (value: number, mesa?: Mesa): number => {
  const limit = getReservableSeatsLimit(mesa)
  const numericValue = Number.isFinite(value) ? value : 2
  const evenValue = numericValue % 2 === 0 ? numericValue : numericValue + 1
  const clampedValue = Math.min(Math.max(2, evenValue), Math.max(2, limit))

  return clampedValue
}

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
  const [reservaToCancel, setReservaToCancel] = useState<ReservaMesa | null>(null)

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

  const selectedMesa = useMemo(
    () => mesas.find((mesa) => mesa.id === formData.mesaId),
    [formData.mesaId, mesas]
  )

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
      if (field === 'asientosReservados') {
        setFormData((prev) => ({
          ...prev,
          asientosReservados: normalizeSeatCount(Number(event.target.value), selectedMesa)
        }))
        setAvailability(null)
        return
      }

      const value = event.target.value
      setFormData((prev) => {
        if (field !== 'mesaId') return { ...prev, [field]: value }

        const nextMesa = mesas.find((mesa) => mesa.id === value)
        return {
          ...prev,
          mesaId: value,
          asientosReservados: normalizeSeatCount(prev.asientosReservados, nextMesa)
        }
      })
      setAvailability(null)
    }

  const validateForm = (): string | null => {
    const start = new Date(formData.fechaHoraInicio)
    const end = new Date(formData.fechaHoraFin)
    const seatLimit = getReservableSeatsLimit(selectedMesa)

    if (!selectedMesa) return 'Selecciona una mesa valida.'
    if (seatLimit < 2) return 'La mesa seleccionada no permite reservas de al menos 2 asientos.'
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return 'Indica una fecha y hora validas.'
    }
    if (end <= start) return 'La hora de fin debe ser posterior al inicio.'
    if (formData.asientosReservados < 2) return 'La reserva debe ser de al menos 2 asientos.'
    if (formData.asientosReservados % 2 !== 0) return 'Los asientos reservados deben ser pares.'
    if (formData.asientosReservados > seatLimit) {
      return `La mesa seleccionada permite reservar como maximo ${seatLimit} asientos.`
    }

    return null
  }

  const handleCheckAvailability = async (): Promise<DisponibilidadReserva | null> => {
    try {
      const validationError = validateForm()
      if (validationError) {
        setError(validationError)
        setAvailability(null)
        return null
      }

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

      const validationError = validateForm()
      if (validationError) {
        setError(validationError)
        return
      }

      const checkedAvailability = availability ?? (await handleCheckAvailability())
      if (!checkedAvailability?.disponible) {
        setError('No hay asientos suficientes para ese horario.')
        return
      }

      const newReserva = await createReserva(formData)
      setReservas((prev) => sortReservas([newReserva, ...prev]))
      setIsModalOpen(false)
      setAvailability(null)
    } catch (err) {
      console.error('Error al crear reserva:', err)
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeCancelModal = (): void => {
    if (cancellingId) return
    setReservaToCancel(null)
  }

  const openCancelModal = (reserva: ReservaMesa): void => {
    setError(null)
    setReservaToCancel(reserva)
  }

  const handleConfirmCancel = async (): Promise<void> => {
    if (!reservaToCancel) return

    try {
      setCancellingId(reservaToCancel.id)
      setError(null)
      const cancelledReserva = await cancelReserva(reservaToCancel.id)
      setReservas((prev) =>
        sortReservas(
          prev.map((item) => (item.id === cancelledReserva.id ? cancelledReserva : item))
        )
      )
      setReservaToCancel(null)
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
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className={styles.statusMessage}>
                  Cargando reservas...
                </td>
              </tr>
            ) : filteredReservas.length > 0 ? (
              filteredReservas.map((reserva) => (
                <tr key={reserva.id}>
                  <td data-label="Mesa">
                    <strong>{reserva.mesa ? `Mesa ${reserva.mesa.orden}` : 'Sin mesa'}</strong>
                    {reserva.mesa ? (
                      <small className={styles.mutedText}>
                        {reserva.mesa.esDePago ? 'De pago' : 'Gratuita'}
                      </small>
                    ) : null}
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
                  <td data-label="Precio">{formatPrice(reserva.precio)}</td>
                  <td data-label="Estado">
                    <span className={`${styles.badge} ${getEstadoClass(reserva.estado)}`}>
                      {reserva.estado}
                    </span>
                  </td>
                  <td data-label="Acciones">
                    <button
                      className={styles.dangerBtn}
                      onClick={() => openCancelModal(reserva)}
                      disabled={!canCancel(reserva) || cancellingId === reserva.id}
                    >
                      {cancellingId === reserva.id ? 'Cancelando...' : 'Cancelar'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className={styles.statusMessage}>
                  {searchTerm || estadoFilter !== 'TODAS'
                    ? 'No hay reservas que coincidan con el filtro.'
                    : 'No hay reservas registradas.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="NUEVA RESERVA"
        className={styles.reservationModal}
      >
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
                  {mesa.esDePago ? ' - de pago' : ' - gratuita'}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.dateRow}>
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
              min={2}
              max={Math.max(2, getReservableSeatsLimit(selectedMesa))}
              step={2}
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

      <Modal isOpen={Boolean(reservaToCancel)} onClose={closeCancelModal} title="CANCELAR RESERVA">
        <p className={styles.modalText}>
          Quieres cancelar la reserva de{' '}
          <strong>
            {reservaToCancel?.mesa ? `Mesa ${reservaToCancel.mesa.orden}` : 'esta mesa'}
          </strong>
          ? Esta accion actualizara su estado y liberara los asientos.
        </p>
        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={closeCancelModal}
            disabled={Boolean(cancellingId)}
          >
            Volver
          </button>
          <button
            type="button"
            className={styles.dangerBtn}
            onClick={handleConfirmCancel}
            disabled={Boolean(cancellingId)}
          >
            {cancellingId ? 'Cancelando...' : 'Si, cancelar'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
