import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEventById, deleteEvent, updateEvent } from '../../api/eventsApi'
import { AppEvent, EventFormData, getEventLabelTint } from '../../data/events'
import styles from './EventProfile.module.scss'
import { Modal } from '../Modal/Modal'
import { EventMaker } from '../EventMaker/EventMaker'
import { useEventLabels } from '../../hooks/useEventLabels'

export const EventProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getLabelColor } = useEventLabels()
  const [event, setEvent] = useState<AppEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    const fetchEventDetail = async (): Promise<void> => {
      try {
        if (id) {
          const data = await getEventById(id)
          setEvent(data)
        }
      } catch (error) {
        console.error('Error al cargar el detalle del evento:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEventDetail()
  }, [id])

  const handleDelete = async (): Promise<void> => {
    if (!id) return
    setIsDeleting(true)
    try {
      await deleteEvent(id)
      navigate('/eventos')
    } catch (error) {
      console.error('Error al borrar el evento:', error)
      alert('Hubo un problema al intentar borrar el evento.')
      setIsDeleting(false)
      setIsModalOpen(false)
    }
  }

  const handleEditSubmit = async (updatedData: EventFormData): Promise<void> => {
    if (!id) return
    const updatedEvent = await updateEvent(id, updatedData)
    setEvent(updatedEvent)
  }

  if (isLoading) return <div className={styles.loading}>Cargando pergamino del evento...</div>
  if (!event) return <div className={styles.error}>El evento ha sido tragado por el vacío.</div>

  const labelColor = getLabelColor(event.label)

  return (
    <div className={styles.wrapper}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← Volver a Eventos
      </button>

      <div className={styles.profileContainer}>
        <div className={styles.header}>
          <span
            className={styles.badge}
            style={{
              backgroundColor: getEventLabelTint(labelColor, 0.2),
              borderColor: labelColor
            }}
          >
            {event.label}
          </span>
          <h1>{event.title}</h1>
          <div className={styles.dateTime}>
            <span>Fecha ➡ {event.date}</span>
            <span>Hora ➡ {event.time}</span>
          </div>
        </div>

        <div className={styles.content}>
          <h2>Descripción</h2>
          <p>{event.description}</p>
          <div className={styles.statusGroup}>
            <div className={styles.status}>
              Estado actual: <strong>{event.status}</strong>
            </div>

            <div className={styles.actionButtons}>
              <button className={styles.secondaryBtn} onClick={() => setIsEditModalOpen(true)}>
                Editar Evento
              </button>
              <button className={styles.dangerBtn} onClick={() => setIsModalOpen(true)}>
                Eliminar Evento
              </button>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isDeleting && setIsModalOpen(false)}
        title="ELIMINAR EVENTO"
      >
        <p className={styles.modalText}>
          ¿Estás seguro de que deseas eliminar el evento <strong>{event.title}</strong>?<br />
          Esta acción no se puede deshacer.
        </p>
        <div className={styles.modalActions}>
          <button
            className={styles.secondaryBtn}
            onClick={() => setIsModalOpen(false)}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button className={styles.dangerBtn} onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Borrando...' : 'Sí, eliminar'}
          </button>
        </div>
      </Modal>
      <EventMaker
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSubmit}
        initialData={event}
      />
    </div>
  )
}
