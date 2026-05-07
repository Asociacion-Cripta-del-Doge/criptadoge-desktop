import React, { useState, useEffect } from 'react'
import styles from './EventMaker.module.scss'
import { Modal } from '../Modal/Modal'
import { useEventLabels } from '../../hooks/useEventLabels'
import { EventFormData } from '../../data/events'

interface EventMakerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (eventData: EventFormData) => Promise<void> | void
  initialData?: Partial<EventFormData>
}

export const EventMaker: React.FC<EventMakerProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { labels, isLoadingLabels } = useEventLabels()
  const firstLabel = labels[0]?.name ?? ''
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    label: ''
  })

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        date: initialData.date || '',
        time: initialData.time || '',
        label: initialData.label || firstLabel
      })
    } else if (isOpen && !initialData) {
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        label: firstLabel
      })
    }
  }, [isOpen, initialData, firstLabel])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSuccess(formData)
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        label: firstLabel
      })
      onClose()
    } catch (error) {
      console.error('Error al crear/editar evento:', error)
      alert('Hubo un error al guardar el evento en la base de datos.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const modalTitle = initialData ? 'EDITAR EVENTO' : 'NUEVO EVENTO'
  const labelOptions =
    formData.label && !labels.some((label) => label.name === formData.label)
      ? [{ id: formData.label, name: formData.label }, ...labels]
      : labels

  return (
    <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} title={modalTitle}>
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
              min={(() => {
                const d = new Date()
                d.setHours(d.getHours() + 1)
                return d.toISOString().split('T')[0]
              })()}
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
              min={(() => {
                const d = new Date()
                d.setHours(d.getHours() + 1)
                const minDate = d.toISOString().split('T')[0]
                return formData.date === minDate ? d.toTimeString().slice(0, 5) : undefined
              })()}
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Etiqueta / Juego</label>
          <select
            required
            disabled={isSubmitting || isLoadingLabels || labelOptions.length === 0}
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          >
            {isLoadingLabels ? <option value="">Cargando etiquetas...</option> : null}
            {!isLoadingLabels && labelOptions.length === 0 ? (
              <option value="">No hay etiquetas disponibles</option>
            ) : null}
            {labelOptions.map((label) => (
              <option key={label.id} value={label.name}>
                {label.name}
              </option>
            ))}
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
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting || isLoadingLabels || labelOptions.length === 0}
          >
            {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar Evento' : 'Crear Evento'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
