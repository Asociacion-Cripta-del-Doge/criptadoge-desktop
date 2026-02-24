import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './MemberProfile.module.scss'
import { MOCK_MEMBERS, getMemberStatus } from '../../data/members'
import { Modal } from '../Modal/Modal'

export const MemberProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const member = MOCK_MEMBERS.find((m) => m.id === id)

  if (!member) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => navigate('/socios')}>
          ← Volver a la lista
        </button>
        <h2>Socio no encontrado</h2>
      </div>
    )
  }

  const status = getMemberStatus(member.expirationDate)

  const handleConfirmRenew = () => {
    console.log(`Simulando llamada a API: POST /renew para el socio ${member.id}`)
    setShowModal(false)
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
