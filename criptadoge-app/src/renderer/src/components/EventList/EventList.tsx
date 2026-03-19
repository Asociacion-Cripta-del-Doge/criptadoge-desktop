import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './EventList.module.scss'
import { EventMaker } from '../EventMaker/EventMaker'
import { useEvents } from '../../hooks/useEvents'

const LABEL_KEY: Record<string, string> = {
  'Magic: The Gathering': 'magic',
  'Yu-Gi-Oh!':           'yugioh',
  'Pokémon TCG':         'pokemon',
  'Juegos de Mesa':      'mesa',
  'Rol / D&D':           'rol',
  'Otro':                'otro'
}

export const EventList: React.FC = () => {
  const { events, isLoading, addEvent } = useEvents()
  const [isMakerOpen, setIsMakerOpen] = useState(false)
  const navigate = useNavigate()

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
                  <td data-label="Etiqueta">
                    <span className={`${styles.badge} ${styles[`badge-${LABEL_KEY[evt.label] ?? 'otro'}`]}`}>
                      {evt.label}
                    </span>
                  </td>
                  <td data-label="Evento">
                    <strong>{evt.title}</strong>
                    <div className={styles.description}>{evt.description}</div>
                  </td>
                  <td data-label="Fecha">{evt.date}</td>
                  <td data-label="Hora">{evt.time}</td>
                  <td data-label="Acciones">
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

      <EventMaker isOpen={isMakerOpen} onClose={() => setIsMakerOpen(false)} onSuccess={addEvent} />
    </div>
  )
}
