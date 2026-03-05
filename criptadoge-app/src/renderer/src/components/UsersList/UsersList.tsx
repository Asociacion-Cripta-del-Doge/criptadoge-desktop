import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './UsersList.module.scss'
import { MemberRow } from '../MemberRow/MemberRow'
import { apiClient } from '../../api/axiosClient'

interface User {
  id: string
  dni: string
  name: string
  email: string
  role: string
  status: string
  lastRenewal: string | null
  expirationDate: string | null
}

export const UsersList: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get('/usuarios')
        setUsers(response.data)
      } catch (err) {
        console.error('Error al cargar los socios:', err)
        setError('No se pudo conectar con el servidor. Inténtalo de nuevo.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filteredMembers = useMemo(() => {
    return users.filter((member) => {
      const lowerCaseTerm = searchTerm.toLowerCase()
      return (
        member.name.toLowerCase().includes(lowerCaseTerm) ||
        member.email.toLowerCase().includes(lowerCaseTerm) ||
        member.dni.toLowerCase().includes(lowerCaseTerm)
      )
    })
  }, [searchTerm, users])

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
            placeholder="Buscar por DNI, nombre o email..."
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
            {isLoading ? (
              <tr>
                <td colSpan={6} className={styles.noResults}>
                  Cargando datos desde La Cripta...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className={styles.noResults} style={{ color: '#ef4444' }}>
                  {error}
                </td>
              </tr>
            ) : filteredMembers.length > 0 ? (
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
