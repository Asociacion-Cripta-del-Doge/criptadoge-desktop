import React from 'react'
import styles from './AppGuide.module.scss'

interface AppGuideProps {
  isOpen: boolean
  onClose: () => void
}

const GUIDE_SECTIONS = [
  {
    title: 'Gestión de Socios',
    videoSrc: new URL('../../assets/videos/socios.mp4', import.meta.url).href,
    description:
      'Aprende a crear nuevos socios, editar sus datos, consultar su ficha completa y gestionar el estado de su membresía desde el panel de administración.'
  },
  {
    title: 'Renovar una Membresía',
    videoSrc: new URL('../../assets/videos/membresia.mp4', import.meta.url).href,
    description:
      'El socio debe tener un DNI registrado para poder renovar. Al confirmar, el sistema extiende la fecha de expiración un mes automáticamente y actualiza el estado a Activo.'
  },
  {
    title: 'Crear y Gestionar Eventos',
    videoSrc: new URL('../../assets/videos/eventos.mp4', import.meta.url).href,
    description:
      'Crea eventos con título, descripción, etiqueta de categoría, fecha y hora. Puedes editar o eliminar cualquier evento desde su ficha de detalle.'
  },
  {
    title: 'Usar el Calendario',
    videoSrc: new URL('../../assets/videos/calendario.mp4', import.meta.url).href,
    description:
      'El calendario muestra todos los eventos del sistema con sus colores de etiqueta. Puedes navegar por meses y hacer clic en cualquier evento para ver su detalle.'
  }
]

export const AppGuide: React.FC<AppGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>GUÍA DE LA APLICACIÓN</h2>
          <button className={styles.closeBtn} onClick={onClose} title="Cerrar">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <line x1="0" y1="0" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" />
              <line x1="12" y1="0" x2="0" y2="12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {GUIDE_SECTIONS.map((section) => (
            <div key={section.title} className={styles.section}>
              <h3 className={styles.sectionTitle}>{section.title}</h3>
              <video
                className={styles.videoHero}
                src={section.videoSrc}
                controls
                preload="metadata"
                playsInline
              />
              <p className={styles.sectionDescription}>{section.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
