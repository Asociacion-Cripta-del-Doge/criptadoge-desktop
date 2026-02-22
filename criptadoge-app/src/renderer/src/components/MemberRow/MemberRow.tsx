import React from 'react';
import styles from './MemberRow.module.scss';

export interface Member {
  id: string;
  name: string;
  email: string;
  status: 'Activo' | 'Inactivo' | 'Pendiente';
  joinDate: string;
}

interface MemberRowProps {
  member: Member;
  onViewProfile: (member: Member) => void;
}

export const MemberRow: React.FC<MemberRowProps> = ({ member, onViewProfile }) => {
  return (
    <tr>
      <td>{member.name}</td>
      <td>{member.email}</td>
      <td>
        <span className={`${styles.badge} ${styles[member.status.toLowerCase()]}`}>
          {member.status}
        </span>
      </td>
      <td>{member.joinDate}</td>
      <td>
        <button 
          className={styles.actionBtn} 
          onClick={() => onViewProfile(member)}
        >
          Ver Ficha
        </button>
      </td>
    </tr>
  );
};