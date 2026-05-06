import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Dashboard.module.scss'
import { StatCard } from '../StatCard/StatCard'
import { Member, getMemberStatus } from '../../data/members'
import { MemberRow } from '../MemberRow/MemberRow'
import { apiClient } from '../../api/axiosClient'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [members, setMembers] = useState<Member[]>([])
  const [totalEvents, setTotalEvents] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, eventsRes] = await Promise.all([
          apiClient.get('/usuarios'),
          apiClient.get('/eventos')
        ])
        setMembers(usersRes.data)
        setTotalEvents(eventsRes.data.length)
      } catch (err) {
        console.error('Error cargando datos del dashboard:', err)
        setError('No se pudieron cargar los datos del servidor.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalMembers = members.length
  const activeMembers = members.filter((m) => getMemberStatus(m) === 'Activo').length
  const pendingMembers = members.filter((m) => getMemberStatus(m) === 'Pendiente').length
  const inactiveMembers = members.filter((m) => getMemberStatus(m) === 'Inactivo').length

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const in7Days = new Date(today)
  in7Days.setDate(today.getDate() + 7)
  const upcomingRenewals = members.filter((m) => {
    if (!m.expirationDate) return false
    const exp = new Date(m.expirationDate)
    return exp >= today && exp <= in7Days
  }).length

  const latestRenewals = [...members]
    .sort((a, b) => new Date(b.lastRenewal ?? 0).getTime() - new Date(a.lastRenewal ?? 0).getTime())
    .slice(0, 3)

  if (isLoading) return <div className={styles.statusMessage}>Cargando datos del servidor...</div>
  if (error) return <div className={styles.statusMessage}>{error}</div>

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>PANEL GENERAL</h1>
        <p>Resumen del estado de La Cripta de Doge</p>
      </header>

      <div className={styles.grid}>
        <StatCard
          title="Socios Totales"
          value={totalMembers}
          subtitle="Registrados en el sistema"
          trend="positive"
        />
        <StatCard
          title="Socios Activos"
          value={activeMembers}
          subtitle="Con acceso permitido"
          trend="neutral"
        />
        <StatCard
          title="Inactivos / Pendientes"
          value={pendingMembers + inactiveMembers}
          subtitle="Requieren atención"
          trend="negative"
        />
        <StatCard
          title="Próximas Renovaciones"
          value={upcomingRenewals}
          subtitle="Expiran en los próximos 7 días"
          trend="neutral"
        />
        <StatCard
          title="Eventos Próximos"
          value={totalEvents}
          subtitle="Programados en el sistema"
          trend="positive"
        />
      </div>
      <div className={styles.recentSection}>
        <h2>ÚLTIMAS RENOVACIONES</h2>
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
            {latestRenewals.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                onViewProfile={(id) => navigate(`/socios/${id}`)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
