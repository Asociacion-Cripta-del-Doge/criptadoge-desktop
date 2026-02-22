import React, { useState } from 'react';
import styles from './MemberProfile.module.scss';
import { Member } from '../MemberRow/MemberRow';

interface MemberProfileProps {
  member: Member;
  onBack: () => void;
}
//
export const MemberProfile: React.FC<MemberProfileProps> = ({ member, onBack }) => {
  const [showModal, setShowModal] = useState(false);
  const handleConfirmRenew = () => {
    console.log(`Simulando renovación para: ${member.name}`);
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={onBack}>
        ← Volver a la lista
      </button>

      <div className={styles.profileLayout}>
        <div className={styles.card}>
          <h2>FICHA DE SOCIO</h2>
          
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
            <p>{member.status}</p>
          </div>
          <div className={styles.infoGroup}>
            <label>Miembro desde</label>
            <p>{member.joinDate}</p>
          </div>
        </div>
        <div className={styles.actionsCard}>
          <button className={styles.renewBtn} onClick={() => setShowModal(true)}>
            Renovar Membresía
            <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'normal', marginTop: '0.5rem' }}>
              Cargar 1 Mes
            </span>
          </button>
          
          <button className={styles.secondaryBtn}>Editar Datos</button>
          <button className={styles.dangerBtn}>Borrar Socio</button>
        </div>
      </div>
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3>CONFIRMAR RENOVACIÓN</h3>
            <p>
              ¿Estás seguro de que deseas renovar la membresía de <strong>{member.name}</strong>? <br/>
              Se cargará <strong>1 mes</strong> de acceso a su cuenta.
            </p>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.secondaryBtn} 
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button 
                className={styles.renewBtn} 
                style={{ padding: '1rem' }} 
                onClick={handleConfirmRenew}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};