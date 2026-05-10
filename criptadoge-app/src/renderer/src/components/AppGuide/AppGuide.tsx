import React from 'react'
import styles from './AppGuide.module.scss'

interface AppGuideProps {
  isOpen: boolean
  onClose: () => void
}

interface GuideSection {
  title: string
  description: string
  videoSrc?: string
  steps?: string[]
}

const GUIDE_SECTIONS: GuideSection[] = [
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
  },
  {
    title: 'Textos web',
    description:
      'Este apartado sirve para crear y editar los textos que la web carga desde base de datos. Crear un texto es necesario cuando la web empieza a usar una key nueva que todavia no existe en MongoDB.',
    steps: [
      'Antes de crear, usa el buscador para comprobar que la key no existe ya en ese idioma.',
      'Pulsa Nuevo Texto y rellena la Key. La key es el nombre interno del texto: no se ve en la web, pero sirve para que la web sepa que texto debe mostrar.',
      'La primera parte de la key se llama prefijo. Piensa en el prefijo como la carpeta donde vive el texto. Por ejemplo, home.hero significa portada principal, home.contact significa contacto y footer significa pie de pagina.',
      'Despues del prefijo se anade el nombre concreto del texto. Ejemplos: home.hero.title para el titulo principal, home.hero.subtitle para el subtitulo, home.contact.formButton para un boton del formulario o footer.legal para un texto legal.',
      'Usa siempre puntos para separar partes de la key y evita espacios. Es mejor home.hero.title que titulo portada.',
      'En Seccion escribe el prefijo de la key. Si la key es home.hero.subtitle, la seccion sera home.hero. Si la key es footer.legal, la seccion sera footer.',
      'En Idioma usa el locale del contenido, normalmente es. Si mas adelante se crea la version inglesa, se puede repetir la misma key con locale en.',
      'Elige el tipo segun el uso: Texto corto para botones, labels y titulares pequenos; Texto largo para parrafos; Markdown solo para contenido con formato especial.',
      'En Contenido escribe el texto final que vera la web. Evita HTML libre y revisa acentos, saltos de linea y llamadas a la accion antes de guardar.',
      'Guarda el texto y confirma que aparece dentro de su seccion. Si la web ya consume esa key, empezara a mostrar el valor de BD en vez del fallback local.',
      'Para cambiar un texto existente usa Editar. La key y el idioma quedan bloqueados en edicion para evitar duplicados accidentales.'
    ]
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
              {section.videoSrc ? (
                <video
                  className={styles.videoHero}
                  src={section.videoSrc}
                  controls
                  preload="metadata"
                  playsInline
                />
              ) : null}
              <p className={styles.sectionDescription}>{section.description}</p>
              {section.steps ? (
                <ul className={styles.stepList}>
                  {section.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
