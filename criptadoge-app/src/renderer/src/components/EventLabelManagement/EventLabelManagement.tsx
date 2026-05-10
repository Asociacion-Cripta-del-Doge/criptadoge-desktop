import React, { useMemo, useState } from 'react'
import styles from './EventLabelManagement.module.scss'
import { useEvents } from '../../hooks/useEvents'
import { useEventLabels } from '../../hooks/useEventLabels'
import { getEventLabelTint } from '../../data/events'
import { createEventLabel, deleteEventLabel, updateEventLabel } from '../../api/eventLabelsApi'

const DEFAULT_NEW_LABEL_COLOR = '#3b82f6'

export const EventLabelManagement: React.FC = () => {
  const { events, refreshEvents } = useEvents()
  const { labels, isLoadingLabels, getLabelColor, refreshLabels } = useEventLabels()
  const [labelName, setLabelName] = useState('')
  const [labelColor, setLabelColor] = useState(DEFAULT_NEW_LABEL_COLOR)
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null)
  const [editingLabelName, setEditingLabelName] = useState('')
  const [editingLabelColor, setEditingLabelColor] = useState(DEFAULT_NEW_LABEL_COLOR)
  const [labelError, setLabelError] = useState<string | null>(null)
  const [labelSuccess, setLabelSuccess] = useState<string | null>(null)
  const [isSavingLabel, setIsSavingLabel] = useState(false)
  const [savingLabelId, setSavingLabelId] = useState<string | null>(null)
  const [deletingLabelId, setDeletingLabelId] = useState<string | null>(null)

  const labelUsage = useMemo(
    () =>
      events.reduce<Record<string, number>>((acc, event) => {
        acc[event.label] = (acc[event.label] ?? 0) + 1
        return acc
      }, {}),
    [events]
  )

  const handleCreateLabel = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()
    const trimmedName = labelName.trim()
    setLabelError(null)
    setLabelSuccess(null)

    if (!trimmedName) {
      setLabelError('Indica un nombre para la etiqueta.')
      return
    }

    if (labels.some((label) => label.name.toLowerCase() === trimmedName.toLowerCase())) {
      setLabelError('Ya existe una etiqueta con ese nombre.')
      return
    }

    setIsSavingLabel(true)
    try {
      await createEventLabel({ name: trimmedName, color: labelColor })
      await refreshLabels()
      setLabelName('')
      setLabelColor(DEFAULT_NEW_LABEL_COLOR)
      setLabelSuccess('Etiqueta creada correctamente.')
    } catch (error) {
      console.error('Error al crear etiqueta de evento:', error)
      setLabelError('No se pudo crear la etiqueta.')
    } finally {
      setIsSavingLabel(false)
    }
  }

  const startEditingLabel = (id: string, name: string, color: string): void => {
    setLabelError(null)
    setLabelSuccess(null)
    setEditingLabelId(id)
    setEditingLabelName(name)
    setEditingLabelColor(color)
  }

  const cancelEditingLabel = (): void => {
    setEditingLabelId(null)
    setEditingLabelName('')
    setEditingLabelColor(DEFAULT_NEW_LABEL_COLOR)
  }

  const handleUpdateLabel = async (id: string, originalName: string): Promise<void> => {
    const trimmedName = editingLabelName.trim()
    setLabelError(null)
    setLabelSuccess(null)

    if (!trimmedName) {
      setLabelError('Indica un nombre para la etiqueta.')
      return
    }

    if (
      labels.some(
        (label) => label.id !== id && label.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      setLabelError('Ya existe una etiqueta con ese nombre.')
      return
    }

    setSavingLabelId(id)
    try {
      await updateEventLabel(id, { name: trimmedName, color: editingLabelColor })
      const refreshTasks = [refreshLabels()]
      if (trimmedName !== originalName) {
        refreshTasks.push(refreshEvents())
      }
      await Promise.all(refreshTasks)
      cancelEditingLabel()
      setLabelSuccess('Etiqueta actualizada correctamente.')
    } catch (error) {
      console.error('Error al actualizar etiqueta de evento:', error)
      setLabelError('No se pudo actualizar la etiqueta.')
    } finally {
      setSavingLabelId(null)
    }
  }

  const handleDeleteLabel = async (id: string, name: string): Promise<void> => {
    setLabelError(null)
    setLabelSuccess(null)

    if (labelUsage[name]) {
      setLabelError('Cambia primero los eventos que usan esta etiqueta antes de eliminarla.')
      return
    }

    const shouldDelete = window.confirm(`Eliminar la etiqueta "${name}"?`)
    if (!shouldDelete) return

    setDeletingLabelId(id)
    try {
      await deleteEventLabel(id)
      await refreshLabels()
      setLabelSuccess('Etiqueta eliminada correctamente.')
    } catch (error) {
      console.error('Error al eliminar etiqueta de evento:', error)
      setLabelError('No se pudo eliminar la etiqueta.')
    } finally {
      setDeletingLabelId(null)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>ETIQUETAS DE EVENTOS</h1>
      </header>

      <section className={styles.card}>
        {labelError ? <div className={styles.errorBanner}>{labelError}</div> : null}
        {labelSuccess ? <div className={styles.successBanner}>{labelSuccess}</div> : null}

        <form className={styles.labelForm} onSubmit={handleCreateLabel}>
          <div className={styles.labelNameField}>
            <label htmlFor="event-label-name">Nombre</label>
            <input
              id="event-label-name"
              type="text"
              value={labelName}
              placeholder="Ej: Commander"
              disabled={isSavingLabel}
              onChange={(event) => setLabelName(event.target.value)}
            />
          </div>

          <div className={styles.labelColorField}>
            <label htmlFor="event-label-color">Color</label>
            <input
              id="event-label-color"
              type="color"
              value={labelColor}
              disabled={isSavingLabel}
              onChange={(event) => setLabelColor(event.target.value)}
            />
          </div>

          <button className={styles.primaryBtn} type="submit" disabled={isSavingLabel}>
            {isSavingLabel ? 'Guardando...' : 'Crear etiqueta'}
          </button>
        </form>

        <div className={styles.labelList}>
          {isLoadingLabels ? (
            <div className={styles.labelMessage}>Cargando etiquetas...</div>
          ) : labels.length > 0 ? (
            labels.map((label) => {
              const currentColor = getLabelColor(label.name)
              const usageCount = labelUsage[label.name] ?? 0
              const isEditing = editingLabelId === label.id
              const isSavingEdit = savingLabelId === label.id

              return (
                <div className={styles.labelItem} key={label.id}>
                  {isEditing ? (
                    <>
                      <input
                        className={styles.editLabelName}
                        type="text"
                        value={editingLabelName}
                        disabled={isSavingEdit}
                        onChange={(event) => setEditingLabelName(event.target.value)}
                      />
                      <input
                        className={styles.editLabelColor}
                        type="color"
                        value={editingLabelColor}
                        disabled={isSavingEdit}
                        onChange={(event) => setEditingLabelColor(event.target.value)}
                      />
                      <button
                        className={styles.saveLabelBtn}
                        type="button"
                        disabled={isSavingEdit}
                        onClick={() => handleUpdateLabel(label.id, label.name)}
                      >
                        {isSavingEdit ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        className={styles.deleteLabelBtn}
                        type="button"
                        disabled={isSavingEdit}
                        onClick={cancelEditingLabel}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <span
                        className={styles.badge}
                        style={{
                          backgroundColor: getEventLabelTint(currentColor, 0.2),
                          borderColor: currentColor
                        }}
                      >
                        {label.name}
                      </span>
                      <span className={styles.labelUsage}>
                        {usageCount === 1 ? '1 evento' : `${usageCount} eventos`}
                      </span>
                      <button
                        className={styles.editLabelBtn}
                        type="button"
                        onClick={() => startEditingLabel(label.id, label.name, currentColor)}
                      >
                        Editar
                      </button>
                      <button
                        className={styles.deleteLabelBtn}
                        type="button"
                        disabled={deletingLabelId === label.id}
                        onClick={() => handleDeleteLabel(label.id, label.name)}
                      >
                        {deletingLabelId === label.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </>
                  )}
                </div>
              )
            })
          ) : (
            <div className={styles.labelMessage}>No hay etiquetas configuradas.</div>
          )}
        </div>
      </section>
    </div>
  )
}
