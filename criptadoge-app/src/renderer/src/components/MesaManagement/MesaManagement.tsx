import React, { useEffect, useMemo, useState } from 'react'
import styles from './MesaManagement.module.scss'
import { Modal } from '../Modal/Modal'
import {
  Mesa,
  MesaFormData,
  createMesa,
  deleteMesa,
  getMesas,
  sortMesas,
  updateMesa
} from '../../api/mesasApi'

const emptyForm: MesaFormData = {
  asientos: 4,
  orden: 1,
  esDePago: false
}

const normalizeSeatCount = (value: number): number => {
  const safeValue = Number.isFinite(value) ? value : 2
  return Math.max(2, Math.ceil(safeValue / 2) * 2)
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

export const MesaManagement: React.FC = () => {
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMesa, setEditingMesa] = useState<Mesa | null>(null)
  const [formData, setFormData] = useState<MesaFormData>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [mesaToDelete, setMesaToDelete] = useState<Mesa | null>(null)

  const fetchMesas = async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getMesas()
      setMesas(data)
    } catch (err) {
      console.error('Error al cargar mesas:', err)
      setError('No se pudieron cargar las mesas.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMesas()
  }, [])

  const filteredMesas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return mesas

    return mesas.filter((mesa) =>
      [
        `mesa ${mesa.orden}`,
        `${mesa.orden}`,
        `${mesa.asientos}`,
        mesa.esDePago ? 'de pago' : 'gratuita'
      ].some((value) => value.toLowerCase().includes(term))
    )
  }, [mesas, searchTerm])

  const openCreateModal = (): void => {
    const nextOrder = mesas.length > 0 ? Math.max(...mesas.map((mesa) => mesa.orden)) + 1 : 1
    setEditingMesa(null)
    setFormData({ ...emptyForm, orden: nextOrder })
    setIsModalOpen(true)
  }

  const openEditModal = (mesa: Mesa): void => {
    setEditingMesa(mesa)
    setFormData({
      asientos: normalizeSeatCount(mesa.asientos),
      orden: mesa.orden,
      esDePago: mesa.esDePago
    })
    setIsModalOpen(true)
  }

  const closeModal = (): void => {
    if (isSubmitting) return
    setIsModalOpen(false)
    setEditingMesa(null)
    setFormData(emptyForm)
  }

  const handleNumberChange =
    (field: 'asientos' | 'orden') =>
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const inputValue = Number(event.target.value)
      const value = field === 'asientos' ? normalizeSeatCount(inputValue) : Math.max(1, inputValue)
      setFormData((prev) => ({ ...prev, [field]: value }))
    }

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload: MesaFormData = {
        ...formData,
        asientos: normalizeSeatCount(formData.asientos)
      }

      if (editingMesa) {
        const updatedMesa = await updateMesa(editingMesa.id, payload)
        setMesas((prev) =>
          sortMesas(prev.map((mesa) => (mesa.id === updatedMesa.id ? updatedMesa : mesa)))
        )
      } else {
        const newMesa = await createMesa(payload)
        setMesas((prev) => sortMesas([...prev, newMesa]))
      }

      closeModal()
    } catch (err) {
      console.error('Error al guardar mesa:', err)
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeDeleteModal = (): void => {
    if (deletingId) return
    setMesaToDelete(null)
  }

  const openDeleteModal = (mesa: Mesa): void => {
    setError(null)
    setMesaToDelete(mesa)
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (!mesaToDelete) return

    try {
      setDeletingId(mesaToDelete.id)
      setError(null)
      await deleteMesa(mesaToDelete.id)
      setMesas((prev) => prev.filter((item) => item.id !== mesaToDelete.id))
      setMesaToDelete(null)
    } catch (err) {
      console.error('Error al borrar mesa:', err)
      setError(getErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>GESTION DE MESAS</h1>
          <p>Configura el orden, los asientos y si una mesa es de pago.</p>
        </div>
        <button className={styles.primaryBtn} onClick={openCreateModal}>
          + Nueva Mesa
        </button>
      </header>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Buscar por orden, asientos o tipo..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        {error ? <div className={styles.errorBanner}>{error}</div> : null}

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Orden</th>
              <th>Asientos</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className={styles.statusMessage}>
                  Cargando mesas...
                </td>
              </tr>
            ) : filteredMesas.length > 0 ? (
              filteredMesas.map((mesa) => (
                <tr key={mesa.id}>
                  <td data-label="Orden">
                    <strong>Mesa {mesa.orden}</strong>
                  </td>
                  <td data-label="Asientos">{mesa.asientos}</td>
                  <td data-label="Tipo">
                    <span
                      className={`${styles.badge} ${mesa.esDePago ? styles.paid : styles.free}`}
                    >
                      {mesa.esDePago ? 'De pago' : 'Gratuita'}
                    </span>
                  </td>
                  <td data-label="Acciones">
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => openEditModal(mesa)}>
                        Editar
                      </button>
                      <button
                        className={styles.dangerBtn}
                        onClick={() => openDeleteModal(mesa)}
                        disabled={deletingId === mesa.id}
                      >
                        {deletingId === mesa.id ? 'Borrando...' : 'Borrar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className={styles.statusMessage}>
                  {searchTerm
                    ? `No se han encontrado mesas con "${searchTerm}"`
                    : 'No hay mesas registradas.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingMesa ? 'EDITAR MESA' : 'NUEVA MESA'}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Orden</label>
              <input
                type="number"
                min={1}
                step={1}
                required
                disabled={isSubmitting}
                value={formData.orden}
                onChange={handleNumberChange('orden')}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Asientos</label>
              <input
                type="number"
                min={2}
                step={2}
                required
                disabled={isSubmitting}
                value={formData.asientos}
                onChange={handleNumberChange('asientos')}
              />
            </div>
          </div>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={formData.esDePago}
              disabled={isSubmitting}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, esDePago: event.target.checked }))
              }
            />
            Mesa de pago
          </label>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : editingMesa ? 'Actualizar Mesa' : 'Crear Mesa'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(mesaToDelete)} onClose={closeDeleteModal} title="BORRAR MESA">
        <p className={styles.modalText}>
          Quieres borrar la <strong>Mesa {mesaToDelete?.orden}</strong>? Esta accion no se puede
          deshacer.
        </p>
        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={closeDeleteModal}
            disabled={Boolean(deletingId)}
          >
            Volver
          </button>
          <button
            type="button"
            className={styles.dangerBtn}
            onClick={handleConfirmDelete}
            disabled={Boolean(deletingId)}
          >
            {deletingId ? 'Borrando...' : 'Si, borrar'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
