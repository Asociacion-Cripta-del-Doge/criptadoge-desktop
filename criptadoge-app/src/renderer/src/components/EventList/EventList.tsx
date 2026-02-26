import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './EventList.module.scss'
import { AppEvent } from '../../data/events'
import { EventMaker } from '../EventMaker/EventMaker'

export const EventList: React.FC = () => {
  const [events, setEvents] = useState<AppEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMakerOpen, setIsMakerOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('http://localhost:3000/eventos')
        if (!response.ok) throw new Error('Error al conectar con el servidor')

        const data = await response.json()

        // mapeo de id
        const formattedData = data.map((evt: any) => ({
          ...evt,
          id: evt._id
        }))

        setEvents(formattedData)
      } catch (error) {
        console.error('Error cargando eventos reales:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const handleEventCreated = (newEvent: AppEvent) => {
    setEvents((prev) => [...prev, newEvent])
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>GESTIÓN DE EVENTOS</h1>
        <button className={styles.primaryBtn} onClick={() => setIsMakerOpen(true)}>
          + Nuevo Evento
        </button>
      </header>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Etiqueta</th>
              <th>Título y Descripción</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className={styles.messageRow}>
                  Descargando eventos del servidor...
                </td>
              </tr>
            ) : events.length > 0 ? (
              events.map((evt) => (
                <tr key={evt.id}>
                  <td>
                    <span className={styles.badge}>{evt.label}</span>
                  </td>
                  <td>
                    <strong>{evt.title}</strong>
                    <div className={styles.description}>{evt.description}</div>
                  </td>
                  <td>{evt.date}</td>
                  <td>{evt.time}</td>
                  <td>
                    <button
                      className={styles.actionBtn}
                      onClick={() => navigate(`/eventos/${evt.id}`)}
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className={styles.messageRow}>
                  No hay eventos programados en la base de datos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EventMaker
        isOpen={isMakerOpen}
        onClose={() => setIsMakerOpen(false)}
        onSuccess={handleEventCreated}
      />
    </div>
  )
}
