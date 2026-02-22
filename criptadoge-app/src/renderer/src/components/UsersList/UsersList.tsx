import React, { useState } from 'react';
import styles from './UsersList.module.scss';
import { MemberRow, Member } from '../MemberRow/MemberRow'; 

const MOCK_MEMBERS: Member[] = [
  { id: '1', name: 'Ana García', email: 'ana@ejemplo.com', status: 'Activo', joinDate: '2025-01-15' },
  { id: '2', name: 'Carlos López', email: 'carlos@ejemplo.com', status: 'Inactivo', joinDate: '2024-11-02' },
  { id: '3', name: 'Lucía Pérez', email: 'lucia@ejemplo.com', status: 'Pendiente', joinDate: '2026-02-20' },
  { id: '4', name: 'Marcos Doge', email: 'marcos@cripta.com', status: 'Activo', joinDate: '2023-08-10' },
];

export const UsersList: React.FC = () => {
  const [members] = useState<Member[]>(MOCK_MEMBERS);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>GESTIÓN DE SOCIOS</h1>
        <button className={styles.primaryBtn}>+ Nuevo Socio</button>
      </header>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Fecha de Alta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <MemberRow key={member.id} member={member} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};