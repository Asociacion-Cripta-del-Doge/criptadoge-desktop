import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './UsersList.module.scss'
import { MemberRow } from '../MemberRow/MemberRow'
import { apiClient } from '../../api/axiosClient'
import { Modal } from '../Modal/Modal'

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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    dni: '',
    name: '',
    email: '',
    password: '',
    role: 'MEMBER',
    status: 'Activo'
  })

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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...newUser,
        dni: newUser.dni.trim() === '' ? undefined : newUser.dni
      }

      await apiClient.post('/usuarios', payload)

      setIsCreateModalOpen(false)
      setNewUser({ dni: '', name: '', email: '', password: '', role: 'MEMBER', status: 'Activo' })
      window.location.reload()
    } catch (err: any) {
      console.error('Error al crear usuario:', err)
      alert(err.response?.data?.message || 'Hubo un error al crear el socio. Revisa la consola.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewUser((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>GESTIÓN DE SOCIOS</h1>
        <button className={styles.primaryBtn} onClick={() => setIsCreateModalOpen(true)}>
          + Nuevo Socio
        </button>
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

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="ALTA DE NUEVO SOCIO"
      >
        <form onSubmit={handleCreateSubmit} className={styles.createForm}>
          <div className={styles.formGroup}>
            <label>Nombre Completo</label>
            <input
              required
              type="text"
              name="name"
              value={newUser.name}
              onChange={handleInputChange}
              placeholder="Ej: Alex Gamer"
            />
          </div>

          <div className={styles.formGroup}>
            <label>DNI / NIE</label>
            <input
              type="text"
              name="dni"
              value={newUser.dni}
              onChange={handleInputChange}
              placeholder="Ej: 12345678A"
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Email</label>
            <input
              required
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Contraseña Temporal</label>
            <input
              required
              type="password"
              name="password"
              value={newUser.password}
              onChange={handleInputChange}
              placeholder="Mínimo 4 caracteres"
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Rol del Usuario</label>
            <select name="role" value={newUser.role} onChange={handleInputChange}>
              <option value="MEMBER">Socio Normal (MEMBER)</option>
              <option value="ADMIN">Administrador (ADMIN)</option>
            </select>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <button type="submit" className={styles.submitBtn}>
              Crear Usuario
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
