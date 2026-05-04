import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './MemberProfile.module.scss'
import { Member, getMemberStatus } from '../../data/members'
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
  const [dniError, setDniError] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const DNI_NIE_REGEX = /^(\d{8}[A-Za-z]|[XYZxyz]\d{7}[A-Za-z])$/

  const handleCopy = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

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
    if (editForm.dni.trim() !== '' && !DNI_NIE_REGEX.test(editForm.dni.trim())) {
      setDniError('Formato de DNI/NIE inválido')
      return
    }
    setDniError('')
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
      const { data } = await apiClient.put(`/usuarios/${member.id}/membresia`, {})
      setMember((prev) => ({ ...prev!, ...data }))
      setShowRenewModal(false)
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
      alert('Error al intentar desactivar el socio.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'dni') setDniError('')
    setEditForm({ ...editForm, [name]: name === 'dni' ? value.toUpperCase() : value })
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

  const status = getMemberStatus(member)

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
              <>
                <input
                  type="text"
                  name="dni"
                  value={editForm.dni}
                  onChange={handleInputChange}
                  className={styles.editInput}
                />
                {dniError && <span className={styles.fieldError}>{dniError}</span>}
              </>
            ) : member.dni ? (
              <p className={styles.copyable} onClick={() => handleCopy(member.dni!, 'dni')}>
                {member.dni}
                <span className={styles.copyIcon}>⎘</span>
                {copiedField === 'dni' && <span className={styles.copiedBadge}>¡Copiado!</span>}
              </p>
            ) : (
              <p>---</p>
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
              <p className={styles.copyable} onClick={() => handleCopy(member.email, 'email')}>
                {member.email}
                <span className={styles.copyIcon}>⎘</span>
                {copiedField === 'email' && <span className={styles.copiedBadge}>¡Copiado!</span>}
              </p>
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
              <button
                className={styles.renewBtn}
                onClick={() => setShowRenewModal(true)}
                disabled={!member.dni || member.dni.trim() === ''}
                title={!member.dni || member.dni.trim() === '' ? 'El socio debe tener un DNI registrado para poder renovar' : undefined}
              >
                Renovar Membresía
                <span className={styles.renewSubtext}>Cargar 1 Mes</span>
              </button>
              <button className={styles.secondaryBtn} onClick={() => setIsEditing(true)}>
                Editar Datos
              </button>
              {member.status === 'Desactivado' ? (
                <br></br>
              ) : (
                <button className={styles.dangerBtn} onClick={() => setShowDeleteModal(true)}>
                  Desactivar Socio
                </button>
              )}
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
        title="¡ATENCIÓN! DESACTIVAR SOCIO"
      >
        <p className={styles.modalText}>
          Estás a punto de desactivar a{' '}
          <strong style={{ color: '#ef4444' }}>{member.name}</strong>.<br />
          ¿Estás seguro?
        </p>
        <div className={styles.modalActions}>
          <button className={styles.secondaryBtn} onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </button>
          <button className={styles.modalDeleteBtn} onClick={handleConfirmDelete}>
            Sí, Desactivar
          </button>
        </div>
      </Modal>
    </div>
  )
}
