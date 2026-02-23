import React from 'react'
import styles from './MemberRow.module.scss'
import { Member, getMemberStatus } from '../../data/members'

interface MemberRowProps {
  member: Member
  onViewProfile: (id: string) => void
}

export const MemberRow: React.FC<MemberRowProps> = ({ member, onViewProfile }) => {
  const status = getMemberStatus(member.expirationDate)

  return (
    <tr>
      <td>
        <strong>{member.dni}</strong>
      </td>
      <td>{member.name}</td>
      <td>{member.email}</td>
      <td>
        <span className={`${styles.badge} ${styles[status.toLowerCase()]}`}>{status}</span>
      </td>
      <td>{member.expirationDate || '---'}</td>
      <td>
        <button className={styles.actionBtn} onClick={() => onViewProfile(member.id)}>
          Ver Ficha
        </button>
      </td>
    </tr>
  )
}
