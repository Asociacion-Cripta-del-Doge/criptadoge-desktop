import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './MemberProfile.module.scss'
import { getMemberStatus } from '../../data/members'
import { Modal } from '../Modal/Modal'
import { apiClient } from '../../api/axiosClient'

interface User {
  id: string
  dni: string | null
  name: string
  email: string
  role: string
  status: string
  lastRenewal: string | null
  expirationDate: string | null
}

export const MemberProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [member, setMember] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showRenewModal, setShowRenewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    dni: '',
    email: '',
    role: '',
    status: ''
  })

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get(`/usuarios/${id}`)
        setMember(response.data)
        setEditForm({
          name: response.data.name,
          dni: response.data.dni || '',
          email: response.data.email,
          role: response.data.role,
          status: response.data.status
        })
      } catch (err) {
        console.error('Error al cargar la ficha:', err)
        setError('No se pudo encontrar el socio o hubo un error de conexión.')
      } finally {
        setIsLoading(false)
      }
    }
    if (id) fetchMember()
  }, [id])

  const handleSaveEdit = async () => {
    try {
      const payload = { ...editForm, dni: editForm.dni.trim() === '' ? null : editForm.dni }
      const response = await apiClient.put(`/usuarios/${member?.id}`, payload)
      setMember(response.data)
      setIsEditing(false)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar los cambios.')
    }
  }

  const handleConfirmRenew = async () => {
    if (!member) return
    try {
      const today = new Date()
      const lastRenewalStr = today.toISOString().split('T')[0]
      let currentExpDate = member.expirationDate ? new Date(member.expirationDate) : new Date()
      if (currentExpDate < today) currentExpDate = new Date()

      currentExpDate.setMonth(currentExpDate.getMonth() + 1)
      const newExpirationStr = currentExpDate.toISOString().split('T')[0]

      await apiClient.put(`/usuarios/${member.id}`, {
        lastRenewal: lastRenewalStr,
        expirationDate: newExpirationStr,
        status: 'Activo'
      })

      setShowRenewModal(false)
      window.location.reload()
    } catch (err) {
      alert('Error al intentar renovar al socio.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!member) return
    try {
      await apiClient.delete(`/usuarios/${member.id}`)
      setShowDeleteModal(false)
      navigate('/socios')
    } catch (err) {
      alert('Error al intentar borrar el socio.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  if (isLoading)
    return (
      <div className={styles.container}>
        <h2>Cargando datos...</h2>
      </div>
    )
  if (error || !member)
    return (
      <div className={styles.container}>
        <h2 className={styles.errorMessage}>{error || 'Socio no encontrado'}</h2>
      </div>
    )

  const status = getMemberStatus(member.expirationDate)

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate('/socios')}>
        ← Volver a la lista
      </button>

      <div className={styles.profileLayout}>
        <div className={styles.card}>
          <h2>{isEditing ? 'EDITAR FICHA DE SOCIO' : 'FICHA DE SOCIO'}</h2>

          <div className={styles.infoGroup}>
            <label>Nombre Completo</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleInputChange}
                className={styles.editInput}
              />
            ) : (
              <p>{member.name}</p>
            )}
          </div>

          <div className={styles.infoGroup}>
            <label>DNI / NIE</label>
            {isEditing ? (
              <input
                type="text"
                name="dni"
                value={editForm.dni}
                onChange={handleInputChange}
                className={styles.editInput}
              />
            ) : (
              <p>{member.dni || '---'}</p>
            )}
          </div>

          <div className={styles.infoGroup}>
            <label>Correo Electrónico</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleInputChange}
                className={styles.editInput}
              />
            ) : (
              <p>{member.email}</p>
            )}
          </div>

          <div className={styles.infoGroup}>
            <label>Rol en La Cripta</label>
            {isEditing ? (
              <select
                name="role"
                value={editForm.role}
                onChange={handleInputChange}
                className={styles.editInput}
              >
                <option value="MEMBER">MEMBER (Socio)</option>
                <option value="ADMIN">ADMIN (Administrador)</option>
              </select>
            ) : (
              <p>
                <span
                  className={`${styles.roleBadge} ${member.role === 'ADMIN' ? styles.roleAdmin : styles.roleMember}`}
                >
                  {member.role}
                </span>
              </p>
            )}
          </div>

          {!isEditing && (
            <>
              <div className={styles.infoGroup}>
                <label>Estado Actual</label>
                <p>
                  <span className={`${styles.badge} ${styles[status.toLowerCase()]}`}>
                    {status}
                  </span>
                </p>
              </div>
              <div className={styles.infoGroup}>
                <label>Última Renovación</label>
                <p>{member.lastRenewal || 'Nunca'}</p>
              </div>
              <div className={styles.infoGroup}>
                <label>Fecha de Expiración</label>
                <p>
                  <strong>{member.expirationDate || '---'}</strong>
                </p>
              </div>
            </>
          )}
        </div>

        <div className={styles.actionsCard}>
          {isEditing ? (
            <>
              <button className={styles.renewBtn} onClick={handleSaveEdit}>
                Guardar Cambios
              </button>
              <button className={styles.secondaryBtn} onClick={() => setIsEditing(false)}>
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button className={styles.renewBtn} onClick={() => setShowRenewModal(true)}>
                Renovar Membresía
                <span className={styles.renewSubtext}>Cargar 1 Mes</span>
              </button>
              <button className={styles.secondaryBtn} onClick={() => setIsEditing(true)}>
                Editar Datos
              </button>
              <button className={styles.dangerBtn} onClick={() => setShowDeleteModal(true)}>
                Borrar Socio
              </button>
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={showRenewModal}
        onClose={() => setShowRenewModal(false)}
        title="CONFIRMAR RENOVACIÓN"
      >
        <p className={styles.modalText}>
          ¿Renovar membresía de <strong className={styles.highlight}>{member.name}</strong> por 1
          mes?
        </p>
        <div className={styles.modalActions}>
          <button className={styles.secondaryBtn} onClick={() => setShowRenewModal(false)}>
            Cancelar
          </button>
          <button
            className={`${styles.renewBtn} ${styles.modalConfirmBtn}`}
            onClick={handleConfirmRenew}
          >
            Confirmar
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="¡ATENCIÓN! BORRAR SOCIO"
      >
        <p className={styles.modalText}>
          Estás a punto de borrar permanentemente a{' '}
          <strong style={{ color: '#ef4444' }}>{member.name}</strong>.<br />
          Esta acción <strong>no se puede deshacer</strong>. ¿Estás absolutamente seguro?
        </p>
        <div className={styles.modalActions}>
          <button className={styles.secondaryBtn} onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </button>
          <button className={styles.modalDeleteBtn} onClick={handleConfirmDelete}>
            Sí, Borrar Definitivamente
          </button>
        </div>
      </Modal>
    </div>
  )
}
