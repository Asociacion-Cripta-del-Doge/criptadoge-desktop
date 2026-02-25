import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './EventProfile.module.scss'
import { MOCK_EVENTS } from '../../data/events'
import { Modal } from '../Modal/Modal'

export const EventProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const event = MOCK_EVENTS.find((e) => e.id === id)

  if (!event) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => navigate('/eventos')}>
          ← Volver a Eventos
        </button>
        <h2>Evento no encontrado</h2>
      </div>
    )
  }
  const handleDelete = async () => {
    const index = MOCK_EVENTS.findIndex((e) => e.id === id)
    if (index > -1) {
      MOCK_EVENTS.splice(index, 1)
    }
    setShowDeleteModal(false)
    navigate('/eventos')
  }

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate('/eventos')}>
        ← Volver a la lista
      </button>

      <div className={styles.profileLayout}>
        <div className={styles.card}>
          <h2>DETALLES DEL EVENTO</h2>

          <div className={styles.infoGroup}>
            <label>Título del Evento</label>
            <p>{event.title}</p>
          </div>
          <div className={styles.infoGroup}>
            <label>Etiqueta / Categoría</label>
            <p>
              <span className={styles.badge}>{event.label}</span>
            </p>
          </div>
          <div className={styles.infoGroup}>
            <label>Fecha y Hora</label>
            <p>
              {event.date} a las {event.time}
            </p>
          </div>
          <div className={styles.infoGroup}>
            <label>Descripción y Detalles</label>
            <p style={{ whiteSpace: 'pre-wrap' }}>{event.description}</p>
          </div>
        </div>

        <div className={styles.actionsCard}>
          <button className={styles.secondaryBtn}>Editar Evento</button>
          <button className={styles.dangerBtn} onClick={() => setShowDeleteModal(true)}>
            Borrar Evento
          </button>
        </div>
      </div>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="ELIMINAR EVENTO"
      >
        <p className={styles.modalText}>
          ¿Estás seguro de que deseas eliminar el evento{' '}
          <strong className={styles.highlightError}>{event.title}</strong>?<br />
          Esta acción no se puede deshacer.
        </p>

        <div className={styles.modalActions}>
          <button className={styles.secondaryBtn} onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </button>
          <button className={styles.dangerBtn} onClick={handleDelete}>
            Sí, Eliminar
          </button>
        </div>
      </Modal>
    </div>
  )
}
