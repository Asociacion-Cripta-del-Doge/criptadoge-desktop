import React, { useState, useEffect } from 'react'
import styles from './TitleBar.module.scss'
import { AppGuide } from '../AppGuide/AppGuide'
import { SettingsModal } from '../SettingsModal/SettingsModal'

export const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

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
            className={`${styles.controlBtn} ${styles.settingsBtn}`}
            onClick={() => setIsSettingsOpen(true)}
            title="Configuración"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
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
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  )
}
