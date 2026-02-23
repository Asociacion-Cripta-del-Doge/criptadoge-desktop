import React from 'react'
import styles from './MemberRow.module.scss'
import { Member } from '../../data/members'

interface MemberRowProps {
  member: Member
  onViewProfile: (id: string) => void
}

export const MemberRow: React.FC<MemberRowProps> = ({ member, onViewProfile }) => {
  return (
    <tr>
      <td>
        <strong>{member.dni}</strong>
      </td>{' '}
      <td>{member.name}</td>
      <td>{member.email}</td>
      <td>
        <span className={`${styles.badge} ${styles[member.status.toLowerCase()]}`}>
          {member.status}
        </span>
      </td>
      <td>{member.joinDate}</td>
      <td>
        <button className={styles.actionBtn} onClick={() => onViewProfile(member.id)}>
          Ver Ficha
        </button>
      </td>
    </tr>
  )
}
