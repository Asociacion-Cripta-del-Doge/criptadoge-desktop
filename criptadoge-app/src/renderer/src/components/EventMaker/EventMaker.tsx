import React, { useState } from 'react'
import styles from './EventMaker.module.scss'
import { Modal } from '../Modal/Modal'
import { AppEvent, MOCK_EVENTS } from '../../data/events'

interface EventMakerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newEvent: AppEvent) => void
}

export const EventMaker: React.FC<EventMakerProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    label: 'Magic: The Gathering'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newEvent: AppEvent = {
        id: Date.now().toString(),
        ...formData
      }

      MOCK_EVENTS.push(newEvent)
      onSuccess(newEvent)

      // Limpiamos y cerramos
      setFormData({ title: '', description: '', date: '', time: '', label: 'Magic: The Gathering' })
      onClose()
    } catch (error) {
      console.error('Error al crear evento', error)
      alert('Hubo un error al guardar el evento.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} title="NUEVO EVENTO">
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Título del Evento</label>
          <input
            type="text"
            required
            disabled={isSubmitting}
            placeholder="Ej: Torneo Modern"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Descripción</label>
          <textarea
            required
            disabled={isSubmitting}
            placeholder="Detalles del torneo, premios, etc."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>Fecha</label>
            <input
              type="date"
              required
              disabled={isSubmitting}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Hora</label>
            <input
              type="time"
              required
              disabled={isSubmitting}
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Etiqueta / Juego</label>
          <select
            required
            disabled={isSubmitting}
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          >
            <option value="Magic: The Gathering">Magic: The Gathering</option>
            <option value="Yu-Gi-Oh!">Yu-Gi-Oh!</option>
            <option value="Pokémon TCG">Pokémon TCG</option>
            <option value="Juegos de Mesa">Juegos de Mesa</option>
            <option value="Rol / D&D">Rol / D&D</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Crear Evento'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
