import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './UsersList.module.scss'
import { MemberRow } from '../MemberRow/MemberRow'
import { MOCK_MEMBERS } from '../../data/members'

export const UsersList: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  // Ahora filtramos por Nombre, Email o DNI
  const filteredMembers = useMemo(() => {
    return MOCK_MEMBERS.filter((member) => {
      const lowerCaseTerm = searchTerm.toLowerCase()
      return (
        member.name.toLowerCase().includes(lowerCaseTerm) ||
        member.email.toLowerCase().includes(lowerCaseTerm) ||
        member.dni.toLowerCase().includes(lowerCaseTerm) // <-- Búsqueda por DNI
      )
    })
  }, [searchTerm])

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
            placeholder="Buscar por DNI, nombre o email..." // <-- Texto actualizado
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Expira el</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  onViewProfile={(id) => navigate(`/socios/${id}`)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className={styles.noResults}>
                  {' '}
                  No se han encontrado socios con "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
