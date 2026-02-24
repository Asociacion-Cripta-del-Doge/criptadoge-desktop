import React from 'react'
import styles from './LoadingScreen.module.scss'

export const LoadingScreen: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      <h2 className={styles.text}>CARGANDO SISTEMA...</h2>
    </div>
  )
}
