import React, { useEffect, useMemo, useState } from 'react'
import styles from './WebTextManagement.module.scss'
import { Modal } from '../Modal/Modal'
import {
  WebText,
  WebTextFormData,
  WebTextType,
  createWebText,
  getWebTexts,
  sortWebTexts,
  updateWebText
} from '../../api/webTextsApi'

const SECTION_LABELS: Record<string, string> = {
  nav: 'Navegacion',
  'home.hero': 'Inicio - Hero',
  'home.about': 'Inicio - Nosotros',
  'home.membership': 'Membresias',
  'home.events': 'Eventos',
  'home.location': 'Ubicacion',
  'home.sponsors': 'Patrocinadores',
  'home.contact': 'Contacto web',
  footer: 'Footer',
  auth: 'Login y registro',
  profile: 'Perfil'
}

const TYPE_LABELS: Record<WebTextType, string> = {
  text: 'Texto corto',
  textarea: 'Texto largo',
  markdown: 'Markdown'
}

const emptyForm: WebTextFormData = {
  key: '',
  value: '',
  section: '',
  type: 'text',
  locale: 'es'
}

const getSectionLabel = (section: string): string => SECTION_LABELS[section] ?? section

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response
    const message = response?.data?.message

    if (Array.isArray(message)) return message.join(' ')
    if (message) return message
  }

  return 'No se ha podido completar la operacion.'
}

const getPreview = (value: string): string => {
  const cleanValue = value.trim().replace(/\s+/g, ' ')
  if (!cleanValue) return 'Sin contenido'
  if (cleanValue.length <= 180) return cleanValue

  return `${cleanValue.slice(0, 180)}...`
}

export const WebTextManagement: React.FC = () => {
  const [texts, setTexts] = useState<WebText[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState('all')
  const [selectedLocale, setSelectedLocale] = useState('es')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingText, setEditingText] = useState<WebText | null>(null)
  const [formData, setFormData] = useState<WebTextFormData>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTexts = async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getWebTexts()
      setTexts(data)
    } catch (err) {
      console.error('Error al cargar textos web:', err)
      setError('No se pudieron cargar los textos configurables de la web.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTexts()
  }, [])

  const locales = useMemo(() => {
    const values = new Set(texts.map((text) => text.locale).filter(Boolean))
    values.add('es')

    return Array.from(values).sort((a, b) => a.localeCompare(b, 'es'))
  }, [texts])

  const visibleTexts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return texts.filter((text) => {
      const matchesLocale = selectedLocale === 'all' || text.locale === selectedLocale
      const matchesSection = selectedSection === 'all' || text.section === selectedSection
      const matchesSearch =
        !term ||
        [text.key, text.value, text.section, text.type, text.locale].some((value) =>
          value.toLowerCase().includes(term)
        )

      return matchesLocale && matchesSection && matchesSearch
    })
  }, [texts, searchTerm, selectedLocale, selectedSection])

  const sectionSummaries = useMemo(() => {
    const counts = texts.reduce<Record<string, number>>((acc, text) => {
      if (selectedLocale !== 'all' && text.locale !== selectedLocale) return acc
      acc[text.section] = (acc[text.section] ?? 0) + 1
      return acc
    }, {})

    return Object.entries(counts)
      .map(([section, count]) => ({ section, count }))
      .sort((a, b) => getSectionLabel(a.section).localeCompare(getSectionLabel(b.section), 'es'))
  }, [texts, selectedLocale])

  const groupedTexts = useMemo(() => {
    return visibleTexts.reduce<Record<string, WebText[]>>((acc, text) => {
      if (!acc[text.section]) acc[text.section] = []
      acc[text.section].push(text)
      return acc
    }, {})
  }, [visibleTexts])

  const openCreateModal = (): void => {
    setEditingText(null)
    setFormData({
      ...emptyForm,
      locale: selectedLocale === 'all' ? 'es' : selectedLocale,
      section: selectedSection === 'all' ? '' : selectedSection
    })
    setSuccessMessage(null)
    setIsModalOpen(true)
  }

  const openEditModal = (text: WebText): void => {
    setEditingText(text)
    setFormData({
      key: text.key,
      value: text.value,
      section: text.section,
      type: text.type,
      locale: text.locale
    })
    setSuccessMessage(null)
    setIsModalOpen(true)
  }

  const closeModal = (): void => {
    if (isSubmitting) return
    setIsModalOpen(false)
    setEditingText(null)
    setFormData(emptyForm)
  }

  const handleInputChange =
    (field: keyof WebTextFormData) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ): void => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    const payload: WebTextFormData = {
      key: formData.key.trim(),
      value: formData.value,
      section: formData.section.trim(),
      type: formData.type,
      locale: formData.locale.trim() || 'es'
    }

    try {
      if (editingText) {
        const updatedText = await updateWebText(editingText.id, payload)
        setTexts((prev) =>
          sortWebTexts(prev.map((text) => (text.id === updatedText.id ? updatedText : text)))
        )
        setSuccessMessage('Texto actualizado correctamente.')
      } else {
        const newText = await createWebText(payload)
        setTexts((prev) => sortWebTexts([...prev, newText]))
        setSelectedSection(newText.section)
        setSelectedLocale(newText.locale)
        setSuccessMessage('Texto creado correctamente.')
      }

      closeModal()
    } catch (err) {
      console.error('Error al guardar texto web:', err)
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const sectionCount = sectionSummaries.reduce((total, section) => total + section.count, 0)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>TEXTOS WEB</h1>
          <p>Edita titulares, botones y textos visibles de la web desde base de datos.</p>
        </div>
        <button className={styles.primaryBtn} onClick={openCreateModal}>
          + Nuevo Texto
        </button>
      </header>

      <section className={styles.toolbarCard}>
        <div className={styles.searchGroup}>
          <label htmlFor="web-text-search">Buscar</label>
          <input
            id="web-text-search"
            type="text"
            placeholder="Busca por key, texto, seccion o tipo..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="web-text-locale">Idioma</label>
          <select
            id="web-text-locale"
            className={styles.selectInput}
            value={selectedLocale}
            onChange={(event) => {
              setSelectedLocale(event.target.value)
              setSelectedSection('all')
            }}
          >
            <option value="all">Todos</option>
            {locales.map((locale) => (
              <option key={locale} value={locale}>
                {locale.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </section>

      {error ? <div className={styles.errorBanner}>{error}</div> : null}
      {successMessage ? <div className={styles.successBanner}>{successMessage}</div> : null}

      <div className={styles.contentGrid}>
        <aside className={styles.sectionPanel}>
          <button
            className={`${styles.sectionButton} ${selectedSection === 'all' ? styles.active : ''}`}
            onClick={() => setSelectedSection('all')}
          >
            <span>Todas las secciones</span>
            <strong>{sectionCount}</strong>
          </button>

          {sectionSummaries.map(({ section, count }) => (
            <button
              key={section}
              className={`${styles.sectionButton} ${
                selectedSection === section ? styles.active : ''
              }`}
              onClick={() => setSelectedSection(section)}
            >
              <span>{getSectionLabel(section)}</span>
              <strong>{count}</strong>
            </button>
          ))}
        </aside>

        <section className={styles.textPanel}>
          {isLoading ? (
            <div className={styles.statusMessage}>Cargando textos configurables...</div>
          ) : visibleTexts.length > 0 ? (
            Object.entries(groupedTexts).map(([section, sectionTexts]) => (
              <div key={section} className={styles.sectionBlock}>
                <div className={styles.sectionHeader}>
                  <h2>{getSectionLabel(section)}</h2>
                  <span>{sectionTexts.length} textos</span>
                </div>

                <div className={styles.textList}>
                  {sectionTexts.map((text) => (
                    <article
                      key={text.id || `${text.key}-${text.locale}`}
                      className={styles.textCard}
                    >
                      <div className={styles.textCardHeader}>
                        <div>
                          <h3>{text.key}</h3>
                          <p>{text.section}</p>
                        </div>
                        <div className={styles.badges}>
                          <span className={styles.badge}>{text.locale.toUpperCase()}</span>
                          <span className={styles.badge}>{TYPE_LABELS[text.type]}</span>
                        </div>
                      </div>

                      <p className={styles.preview}>{getPreview(text.value)}</p>

                      <div className={styles.cardActions}>
                        <button className={styles.actionBtn} onClick={() => openEditModal(text)}>
                          Editar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.statusMessage}>
              {searchTerm || selectedSection !== 'all'
                ? 'No se han encontrado textos con esos filtros.'
                : 'No hay textos configurables registrados.'}
            </div>
          )}
        </section>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingText ? 'EDITAR TEXTO WEB' : 'NUEVO TEXTO WEB'}
        className={styles.webTextModal}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="web-text-key">Key</label>
              <input
                id="web-text-key"
                type="text"
                required
                disabled={isSubmitting || Boolean(editingText)}
                placeholder="home.hero.subtitle"
                value={formData.key}
                onChange={handleInputChange('key')}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="web-text-locale-form">Idioma</label>
              <input
                id="web-text-locale-form"
                type="text"
                required
                disabled={isSubmitting || Boolean(editingText)}
                placeholder="es"
                value={formData.locale}
                onChange={handleInputChange('locale')}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="web-text-section">Seccion</label>
              <input
                id="web-text-section"
                type="text"
                required
                disabled={isSubmitting}
                placeholder="home.hero"
                value={formData.section}
                onChange={handleInputChange('section')}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="web-text-type">Tipo</label>
              <select
                id="web-text-type"
                required
                disabled={isSubmitting}
                value={formData.type}
                onChange={handleInputChange('type')}
              >
                <option value="text">Texto corto</option>
                <option value="textarea">Texto largo</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="web-text-value">Contenido</label>
            {formData.type === 'text' ? (
              <input
                id="web-text-value"
                type="text"
                required
                disabled={isSubmitting}
                value={formData.value}
                onChange={handleInputChange('value')}
              />
            ) : (
              <textarea
                id="web-text-value"
                required
                disabled={isSubmitting}
                rows={8}
                value={formData.value}
                onChange={handleInputChange('value')}
              />
            )}
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : editingText ? 'Actualizar Texto' : 'Crear Texto'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
