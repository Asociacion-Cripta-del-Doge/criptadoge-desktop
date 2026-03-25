import React from 'react'
import { Modal } from '../Modal/Modal'
import { useSettings } from '../../context/SettingsContext'
import styles from './SettingsModal.module.scss'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, autoStart, setTheme, setAutoStart } = useSettings()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CONFIGURACIÓN">
      <section className={styles.settingsSection}>
        <h4 className={styles.sectionTitle}>Apariencia</h4>
        <div className={styles.themeSelector}>
          <button
            className={`${styles.themeBtn} ${theme === 'dark' ? styles.active : ''}`}
            onClick={() => setTheme('dark')}
          >
            Oscuro
          </button>
          <button
            className={`${styles.themeBtn} ${theme === 'light' ? styles.active : ''}`}
            onClick={() => setTheme('light')}
          >
            Claro
          </button>
        </div>
      </section>

      <section className={`${styles.settingsSection} ${styles.last}`}>
        <h4 className={styles.sectionTitle}>Sistema</h4>
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>Iniciar con Windows</span>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={autoStart}
              onChange={(e) => setAutoStart(e.target.checked)}
            />
            <span className={styles.slider} />
          </label>
        </div>
        <p className={styles.settingHint}>
          Abre la aplicación automáticamente al iniciar Windows.
        </p>
      </section>
    </Modal>
  )
}
