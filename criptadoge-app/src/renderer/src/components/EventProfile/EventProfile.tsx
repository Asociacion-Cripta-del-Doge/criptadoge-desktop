import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEventById } from '../../api/eventsApi'
import { AppEvent } from '../../data/events'
import styles from './EventProfile.module.scss'

export const EventProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<AppEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEventDetail = async () => {
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

  if (isLoading) return <div className={styles.loading}>Cargando pergamino del evento...</div>
  if (!event) return <div className={styles.error}>El evento ha sido tragado por el vacío.</div>

  return (
    <div className={styles.profileContainer}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← Volver a Eventos
      </button>

      <div className={styles.header}>
        <span className={styles.badge}>{event.label}</span>
        <h1>{event.title}</h1>
        <div className={styles.dateTime}>
          <span>Fecha: {event.date}</span>
          <span>Hora: {event.time}</span>
        </div>
      </div>

      <div className={styles.content}>
        <h2>Descripción</h2>
        <p>{event.description}</p>
        <div className={styles.status}>
          Estado actual: <strong>{event.status}</strong>
        </div>
      </div>
    </div>
  )
}
