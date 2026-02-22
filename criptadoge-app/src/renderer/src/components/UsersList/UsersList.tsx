import React from 'react';
import styles from './UsersList.module.scss';

export const UsersList: React.FC = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>GESTIÓN DE SOCIOS</h1>
        <button className={styles.primaryBtn}>+ Nuevo Socio</button>
      </header>

      <div className={styles.card}>
        <p style={{ color: '#94a3b8' }}>
          Aquí irá la tabla con el buscador rápido y la lista de usuarios...
        </p>
      </div>
    </div>
  );
};