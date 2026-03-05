import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './MemberProfile.module.scss'
import { getMemberStatus } from '../../data/members'
import { Modal } from '../Modal/Modal'
import { apiClient } from '../../api/axiosClient'
import { User } from '../../data/members'

export const MemberProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const [member, setMember] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get(`/usuarios/${id}`)
        setMember(response.data)
      } catch (err) {
        console.error('Error al cargar la ficha:', err)
        setError('No se pudo encontrar el socio o hubo un error de conexión.')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchMember()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => navigate('/socios')}>
          ← Volver a la lista
        </button>
        <h2>Cargando datos del socio...</h2>
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => navigate('/socios')}>
          ← Volver a la lista
        </button>
        <h2 style={{ color: '#ef4444' }}>{error || 'Socio no encontrado'}</h2>
      </div>
    )
  }

  const status = getMemberStatus(member.expirationDate)

  const handleConfirmRenew = async () => {
    if (!member) return

    try {
      const today = new Date()
      const lastRenewalStr = today.toISOString().split('T')[0]

      let currentExpDate = member.expirationDate ? new Date(member.expirationDate) : new Date()

      if (currentExpDate < today) {
        currentExpDate = new Date()
      }

      currentExpDate.setMonth(currentExpDate.getMonth() + 1)
      const newExpirationStr = currentExpDate.toISOString().split('T')[0]

      const response = await apiClient.put(`/usuarios/${member.id}`, {
        lastRenewal: lastRenewalStr,
        expirationDate: newExpirationStr,
        status: 'Activo'
      })

      setMember(response.data)

      setShowModal(false)
    } catch (err) {
      console.error('Error al renovar la membresía:', err)
      alert('Hubo un error al intentar renovar al socio. ¡Revisa la consola!')
    }
  }

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate('/socios')}>
        ← Volver a la lista
      </button>

      <div className={styles.profileLayout}>
        <div className={styles.card}>
          <h2>FICHA DE SOCIO</h2>

          <div className={styles.infoGroup}>
            <label>DNI / NIE</label>
            <p>{member.dni}</p>
          </div>
          <div className={styles.infoGroup}>
            <label>Nombre Completo</label>
            <p>{member.name}</p>
          </div>
          <div className={styles.infoGroup}>
            <label>Correo Electrónico</label>
            <p>{member.email}</p>
          </div>
          <div className={styles.infoGroup}>
            <label>Estado Actual</label>
            <p>
              <span className={`${styles.badge} ${styles[status.toLowerCase()]}`}>{status}</span>
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
        </div>

        <div className={styles.actionsCard}>
          <button className={styles.renewBtn} onClick={() => setShowModal(true)}>
            Renovar Membresía
            <span className={styles.renewSubtext}>Cargar 1 Mes</span>
          </button>

          <button className={styles.secondaryBtn}>Editar Datos</button>
          <button className={styles.dangerBtn}>Borrar Socio</button>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="CONFIRMAR RENOVACIÓN">
        <p className={styles.modalText}>
          ¿Estás seguro de que deseas renovar la membresía de{' '}
          <strong className={styles.highlight}>{member.name}</strong>? <br />
          Se cargará <strong>1 mes</strong> de acceso a su cuenta.
        </p>

        <div className={styles.modalActions}>
          <button className={styles.secondaryBtn} onClick={() => setShowModal(false)}>
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
    </div>
  )
}
