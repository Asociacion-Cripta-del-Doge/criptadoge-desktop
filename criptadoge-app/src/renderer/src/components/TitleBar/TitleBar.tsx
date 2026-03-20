import React, { useState, useEffect } from 'react'
import styles from './TitleBar.module.scss'
import { AppGuide } from '../AppGuide/AppGuide'

export const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false)
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  useEffect(() => {
    window.api.onMaximizeChange((value) => setIsMaximized(value))
  }, [])

  return (
    <>
      <div className={styles.titlebar}>
        <div className={styles.appInfo}>
          <span className={styles.appName}>CRIPTA DEL DOGE</span>
        </div>
        <div className={styles.controls}>
          <button
            className={`${styles.controlBtn} ${styles.helpBtn}`}
            onClick={() => setIsGuideOpen(true)}
            title="Guía de la aplicación"
          >
            ?
          </button>
          <button
            className={styles.controlBtn}
            onClick={() => window.api.minimize()}
            title="Minimizar"
          >
            <svg width="10" height="1" viewBox="0 0 10 1">
              <rect width="10" height="1" fill="currentColor" />
            </svg>
          </button>
          <button
            className={styles.controlBtn}
            onClick={() => window.api.maximize()}
            title={isMaximized ? 'Restaurar' : 'Maximizar'}
          >
            {isMaximized ? (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <rect x="2" y="0" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
                <rect x="0" y="2" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" />
              </svg>
            )}
          </button>
          <button
            className={`${styles.controlBtn} ${styles.closeBtn}`}
            onClick={() => window.api.close()}
            title="Cerrar"
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1.2" />
              <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
      </div>
      <AppGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  )
}
