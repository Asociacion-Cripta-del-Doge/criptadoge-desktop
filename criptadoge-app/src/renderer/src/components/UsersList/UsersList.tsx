import React, { useState, useMemo } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const lowerCaseTerm = searchTerm.toLowerCase();
      return (
        member.name.toLowerCase().includes(lowerCaseTerm) ||
        member.email.toLowerCase().includes(lowerCaseTerm)
      );
    });
  }, [members, searchTerm]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>GESTIÓN DE SOCIOS</h1>
        <button className={styles.primaryBtn}>+ Nuevo Socio</button>
      </header>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

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
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <MemberRow key={member.id} member={member} />
              ))
            ) : (
              <tr>
                <td colSpan={5} className={styles.noResults}>
                  No se han encontrado socios con "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};