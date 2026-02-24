import React from 'react'
import styles from './StatCard.module.scss'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'positive' | 'negative' | 'neutral'
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend = 'neutral'
}) => {
  return (
    <div className={styles.card}>
      <span className={styles.title}>{title}</span>
      <span className={styles.value}>{value}</span>
      {subtitle && <span className={`${styles.subtitle} ${styles[trend]}`}>{subtitle}</span>}
    </div>
  )
}
