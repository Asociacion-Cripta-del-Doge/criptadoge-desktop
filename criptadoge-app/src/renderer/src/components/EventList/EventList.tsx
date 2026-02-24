import React, { useState, useEffect } from 'react'
import styles from './EventList.module.scss'
import { AppEvent, MOCK_EVENTS } from '../../data/events'

export const EventList: React.FC = () => {
  const [events, setEvents] = useState<AppEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setEvents([...MOCK_EVENTS])
      } catch (error) {
        console.error('Error cargando eventos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>GESTIÓN DE EVENTOS</h1>
        <button
          className={styles.primaryBtn}
          onClick={() => alert('¡Próximamente: Integración con EventMaker!')}
        >
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
                    <button className={styles.actionBtn}>Ver Detalles</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className={styles.messageRow}>
                  No hay eventos programados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
