import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Dashboard.module.scss'
import { StatCard } from '../StatCard/StatCard'
import { MOCK_MEMBERS, getMemberStatus } from '../../data/members'
import { MemberRow } from '../MemberRow/MemberRow'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()

  const totalMembers = MOCK_MEMBERS.length
  const activeMembers = MOCK_MEMBERS.filter(
    (m) => getMemberStatus(m.expirationDate) === 'Activo'
  ).length
  const pendingMembers = MOCK_MEMBERS.filter(
    (m) => getMemberStatus(m.expirationDate) === 'Pendiente'
  ).length
  const inactiveMembers = MOCK_MEMBERS.filter(
    (m) => getMemberStatus(m.expirationDate) === 'Inactivo'
  ).length
  const latestRenewals = [...MOCK_MEMBERS]
    .sort((a, b) => new Date(b.lastRenewal).getTime() - new Date(a.lastRenewal).getTime())
    .slice(0, 3)

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
          value="3"
          subtitle="Expiran en los próximos 7 días"
          trend="neutral"
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
