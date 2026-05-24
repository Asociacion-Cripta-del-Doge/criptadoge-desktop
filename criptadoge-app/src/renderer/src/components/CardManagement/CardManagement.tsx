import React, { useEffect, useMemo, useState } from 'react'
import styles from './CardManagement.module.scss'
import { Modal } from '../Modal/Modal'
import { StatCard } from '../StatCard/StatCard'
import {
  CardCollection,
  CardFormData,
  CardRarity,
  CardStats,
  CardsDashboard,
  CollectibleCard,
  CollectionFormData,
  PackConfig,
  cardRarityDropWeights,
  cardRarities,
  createCard,
  createCollection,
  deleteCard,
  deleteCollection,
  getCardStats,
  getCards,
  getCardsDashboard,
  getCollections,
  getPackConfig,
  updateCard,
  updateCollection,
  updatePackConfig,
  uploadCardImage,
  uploadCollectionImage
} from '../../api/cardsApi'

type Section = 'resumen' | 'colecciones' | 'cartas' | 'estadisticas' | 'sobres'
type SortKey = keyof CardStats

const emptyCollectionForm: CollectionFormData = {
  name: '',
  description: '',
  isActive: true
}

const emptyCardForm: CardFormData = {
  name: '',
  rarity: 'COMUN',
  dropWeight: cardRarityDropWeights.COMUN,
  collectionId: null
}

const emptyPackConfig: PackConfig = {
  price: 0,
  cardsPerPack: 0,
  isActive: false
}

const rarityLabels: Record<CardRarity, string> = {
  COMUN: 'Comun',
  RARA: 'Rara',
  EPICA: 'Epica',
  LEGENDARIA: 'Legendaria'
}

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response
    const message = response?.data?.message

    if (Array.isArray(message)) return message.join(' ')
    if (message) return message
  }

  return 'No se ha podido completar la operacion.'
}

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    reader.readAsDataURL(file)
  })
}

export const CardManagement: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('resumen')
  const [dashboard, setDashboard] = useState<CardsDashboard | null>(null)
  const [collections, setCollections] = useState<CardCollection[]>([])
  const [cards, setCards] = useState<CollectibleCard[]>([])
  const [stats, setStats] = useState<CardStats[]>([])
  const [packConfig, setPackConfig] = useState<PackConfig>(emptyPackConfig)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<CardCollection | null>(null)
  const [collectionForm, setCollectionForm] = useState<CollectionFormData>(emptyCollectionForm)

  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CollectibleCard | null>(null)
  const [cardForm, setCardForm] = useState<CardFormData>(emptyCardForm)

  const [cardRarityFilter, setCardRarityFilter] = useState<CardRarity | 'TODAS'>('TODAS')
  const [cardCollectionFilter, setCardCollectionFilter] = useState<number | 'TODAS'>('TODAS')

  const [cardImageTarget, setCardImageTarget] = useState<CollectibleCard | null>(null)
  const [collectionImageTarget, setCollectionImageTarget] = useState<CardCollection | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<
    | { type: 'card'; item: CollectibleCard }
    | { type: 'collection'; item: CardCollection }
    | null
  >(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('totalCopies')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const fetchAll = async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      const [dashboardData, collectionData, cardData, statsData, packData] = await Promise.all([
        getCardsDashboard(),
        getCollections(),
        getCards(),
        getCardStats(),
        getPackConfig()
      ])
      setDashboard(dashboardData)
      setCollections(collectionData)
      setCards(cardData)
      setStats(statsData)
      setPackConfig(packData)
    } catch (err) {
      console.error('Error al cargar gestion de cartas:', err)
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesRarity = cardRarityFilter === 'TODAS' || card.rarity === cardRarityFilter
      const matchesCollection =
        cardCollectionFilter === 'TODAS' || card.collectionId === cardCollectionFilter
      return matchesRarity && matchesCollection
    })
  }, [cards, cardCollectionFilter, cardRarityFilter])

  const sortedStats = useMemo(() => {
    return [...stats].sort((a, b) => {
      const aValue = a[sortKey]
      const bValue = b[sortKey]
      const direction = sortDirection === 'asc' ? 1 : -1

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction
      }

      return String(aValue).localeCompare(String(bValue)) * direction
    })
  }, [sortDirection, sortKey, stats])

  const refreshCards = async (): Promise<void> => {
    const [cardData, statsData, dashboardData] = await Promise.all([
      getCards(),
      getCardStats(),
      getCardsDashboard()
    ])
    setCards(cardData)
    setStats(statsData)
    setDashboard(dashboardData)
  }

  const openCreateCollection = (): void => {
    setEditingCollection(null)
    setCollectionForm(emptyCollectionForm)
    setIsCollectionModalOpen(true)
  }

  const openEditCollection = (collection: CardCollection): void => {
    setEditingCollection(collection)
    setCollectionForm({
      name: collection.name,
      description: collection.description,
      isActive: collection.isActive
    })
    setIsCollectionModalOpen(true)
  }

  const submitCollection = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      setError(null)
      const payload = {
        ...collectionForm,
        name: collectionForm.name.trim(),
        description: collectionForm.description?.trim()
      }
      const saved = editingCollection
        ? await updateCollection(editingCollection.id, payload)
        : await createCollection(payload)

      setCollections((prev) => {
        const next = editingCollection
          ? prev.map((item) => (item.id === saved.id ? saved : item))
          : [...prev, saved]
        return next.sort((a, b) => a.name.localeCompare(b.name))
      })
      setNotice('Coleccion guardada correctamente.')
      setIsCollectionModalOpen(false)
    } catch (err) {
      console.error('Error al guardar coleccion:', err)
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCreateCard = (): void => {
    setEditingCard(null)
    setCardForm({ ...emptyCardForm })
    setIsCardModalOpen(true)
  }

  const openEditCard = (card: CollectibleCard): void => {
    setEditingCard(card)
    setCardForm({
      name: card.name,
      rarity: card.rarity,
      dropWeight: cardRarityDropWeights[card.rarity],
      collectionId: card.collectionId
    })
    setIsCardModalOpen(true)
  }

  const submitCard = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      setError(null)
      const payload = {
        ...cardForm,
        name: cardForm.name.trim(),
        dropWeight: cardRarityDropWeights[cardForm.rarity],
        collectionId: cardForm.collectionId ?? null
      }
      const saved = editingCard
        ? await updateCard(editingCard.id, payload)
        : await createCard(payload)

      setCards((prev) => {
        const next = editingCard ? prev.map((item) => (item.id === saved.id ? saved : item)) : [...prev, saved]
        return next.sort((a, b) => a.id - b.id)
      })
      await refreshCards()
      setNotice('Carta guardada correctamente.')
      setIsCardModalOpen(false)
    } catch (err) {
      console.error('Error al guardar carta:', err)
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageFile = async (file: File | undefined): Promise<void> => {
    if (!file) return
    try {
      const base64 = await readFileAsDataUrl(file)
      setImagePreview(base64)
    } catch (err) {
      console.error('Error al leer imagen:', err)
      setError(getErrorMessage(err))
    }
  }

  const submitImage = async (): Promise<void> => {
    if (!imagePreview) return
    try {
      setIsSubmitting(true)
      setError(null)
      if (cardImageTarget) {
        const updated = await uploadCardImage(cardImageTarget.id, imagePreview)
        setCards((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        setCardImageTarget(null)
      }
      if (collectionImageTarget) {
        const updated = await uploadCollectionImage(collectionImageTarget.id, imagePreview)
        setCollections((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        setCollectionImageTarget(null)
      }
      setImagePreview(null)
      setNotice('Imagen subida correctamente.')
    } catch (err) {
      console.error('Error al subir imagen:', err)
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return
    try {
      setIsSubmitting(true)
      setError(null)
      if (deleteTarget.type === 'card') {
        await deleteCard(deleteTarget.item.id)
        await refreshCards()
      } else {
        await deleteCollection(deleteTarget.item.id)
        setCollections((prev) => prev.filter((item) => item.id !== deleteTarget.item.id))
      }
      setDeleteTarget(null)
      setNotice('Elemento eliminado correctamente.')
    } catch (err) {
      console.error('Error al eliminar:', err)
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitPackConfig = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      setError(null)
      const saved = await updatePackConfig({
        price: Math.max(0, Number(packConfig.price)),
        cardsPerPack: Math.max(1, Number(packConfig.cardsPerPack)),
        isActive: packConfig.isActive
      })
      setPackConfig(saved)
      setNotice('Configuracion de sobres guardada.')
    } catch (err) {
      console.error('Error al guardar configuracion de sobres:', err)
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleSort = (key: SortKey): void => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDirection('asc')
  }

  const closeImageModal = (): void => {
    if (isSubmitting) return
    setCardImageTarget(null)
    setCollectionImageTarget(null)
    setImagePreview(null)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>CARTAS COLECCIONABLES</h1>
          <p>Gestiona colecciones, cartas, sobres y estadisticas del sistema.</p>
        </div>
      </header>

      <nav className={styles.tabs} aria-label="Secciones de cartas">
        {(['resumen', 'colecciones', 'cartas', 'estadisticas', 'sobres'] as Section[]).map(
          (section) => (
            <button
              key={section}
              className={activeSection === section ? styles.activeTab : styles.tab}
              onClick={() => setActiveSection(section)}
            >
              {section}
            </button>
          )
        )}
      </nav>

      {error ? <div className={styles.errorBanner}>{error}</div> : null}
      {notice ? (
        <div className={styles.noticeBanner} onAnimationEnd={() => setNotice(null)}>
          {notice}
        </div>
      ) : null}

      {isLoading ? (
        <div className={styles.statusMessage}>Cargando sistema de cartas...</div>
      ) : (
        <>
          {activeSection === 'resumen' ? (
            <section className={styles.statsGrid}>
              <StatCard title="Usuarios" value={dashboard?.totalUsers ?? 0} subtitle="Registrados" />
              <StatCard title="Cartas" value={dashboard?.totalCards ?? 0} subtitle="Disponibles" />
              <StatCard title="Colecciones" value={dashboard?.totalCollections ?? 0} subtitle="Creadas" />
              <StatCard
                title="Sobres"
                value={dashboard?.totalPacks ?? 0}
                subtitle={`${dashboard?.packsOpened ?? 0} abiertos`}
              />
            </section>
          ) : null}

          {activeSection === 'colecciones' ? (
            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <h2>Colecciones</h2>
                <button className={styles.primaryBtn} onClick={openCreateCollection}>
                  + Nueva coleccion
                </button>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Descripcion</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((collection) => (
                    <tr key={collection.id}>
                      <td data-label="Imagen">
                        {collection.imageUrl ? (
                          <img className={styles.collectionThumb} src={collection.imageUrl} alt="" />
                        ) : (
                          <span className={styles.emptyThumb}>Sin imagen</span>
                        )}
                      </td>
                      <td data-label="Nombre">
                        <strong>{collection.name}</strong>
                      </td>
                      <td data-label="Descripcion">{collection.description || '-'}</td>
                      <td data-label="Estado">
                        <span className={`${styles.badge} ${collection.isActive ? styles.active : styles.inactive}`}>
                          {collection.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td data-label="Acciones">
                        <div className={styles.actions}>
                          <button className={styles.actionBtn} onClick={() => openEditCollection(collection)}>
                            Editar
                          </button>
                          <button
                            className={styles.actionBtn}
                            onClick={() => setCollectionImageTarget(collection)}
                          >
                            Imagen
                          </button>
                          <button
                            className={styles.dangerBtn}
                            onClick={() => setDeleteTarget({ type: 'collection', item: collection })}
                          >
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}

          {activeSection === 'cartas' ? (
            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <h2>Cartas</h2>
                <button className={styles.primaryBtn} onClick={openCreateCard}>
                  + Nueva carta
                </button>
              </div>
              <div className={styles.filters}>
                <select
                  value={cardRarityFilter}
                  onChange={(event) => setCardRarityFilter(event.target.value as CardRarity | 'TODAS')}
                >
                  <option value="TODAS">Todas las rarezas</option>
                  {cardRarities.map((rarity) => (
                    <option key={rarity} value={rarity}>
                      {rarityLabels[rarity]}
                    </option>
                  ))}
                </select>
                <select
                  value={cardCollectionFilter}
                  onChange={(event) =>
                    setCardCollectionFilter(
                      event.target.value === 'TODAS' ? 'TODAS' : Number(event.target.value)
                    )
                  }
                >
                  <option value="TODAS">Todas las colecciones</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Rareza</th>
                    <th>Peso por rareza</th>
                    <th>Coleccion</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCards.map((card) => (
                    <tr key={card.id}>
                      <td data-label="ID">#{card.id}</td>
                      <td data-label="Imagen">
                        {card.imageUrl ? (
                          <img className={styles.cardThumb} src={card.imageUrl} alt="" />
                        ) : (
                          <span className={styles.emptyThumb}>Sin imagen</span>
                        )}
                      </td>
                      <td data-label="Nombre">
                        <strong>{card.name}</strong>
                      </td>
                      <td data-label="Rareza">
                        <span className={`${styles.badge} ${styles[card.rarity.toLowerCase()]}`}>
                          {rarityLabels[card.rarity]}
                        </span>
                      </td>
                      <td data-label="Peso por rareza">{card.dropWeight}</td>
                      <td data-label="Coleccion">{card.collectionName}</td>
                      <td data-label="Acciones">
                        <div className={styles.actions}>
                          <button className={styles.actionBtn} onClick={() => openEditCard(card)}>
                            Editar
                          </button>
                          <button className={styles.actionBtn} onClick={() => setCardImageTarget(card)}>
                            Imagen
                          </button>
                          <button
                            className={styles.dangerBtn}
                            onClick={() => setDeleteTarget({ type: 'card', item: card })}
                          >
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}

          {activeSection === 'estadisticas' ? (
            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <h2>Estadisticas de cartas</h2>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>
                      <button onClick={() => toggleSort('name')}>Carta</button>
                    </th>
                    <th>
                      <button onClick={() => toggleSort('rarity')}>Rareza</button>
                    </th>
                    <th>
                      <button onClick={() => toggleSort('ownedByUsers')}>Usuarios con carta</button>
                    </th>
                    <th>
                      <button onClick={() => toggleSort('totalCopies')}>Copias</button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStats.map((row) => (
                    <tr key={row.cardId}>
                      <td data-label="Carta">{row.name}</td>
                      <td data-label="Rareza">{rarityLabels[row.rarity]}</td>
                      <td data-label="Usuarios con carta">{row.ownedByUsers}</td>
                      <td data-label="Copias">{row.totalCopies}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}

          {activeSection === 'sobres' ? (
            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <h2>Configuracion de sobres</h2>
              </div>
              <form className={styles.form} onSubmit={submitPackConfig}>
                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label>Precio</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={packConfig.price}
                      onChange={(event) =>
                        setPackConfig((prev) => ({ ...prev, price: Number(event.target.value) }))
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Cartas por sobre</label>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={packConfig.cardsPerPack}
                      onChange={(event) =>
                        setPackConfig((prev) => ({
                          ...prev,
                          cardsPerPack: Number(event.target.value)
                        }))
                      }
                    />
                  </div>
                </div>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={packConfig.isActive}
                    onChange={(event) =>
                      setPackConfig((prev) => ({ ...prev, isActive: event.target.checked }))
                    }
                  />
                  Sobres activos
                </label>
                <div className={styles.modalActions}>
                  <button className={styles.submitBtn} type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Guardar configuracion'}
                  </button>
                </div>
              </form>
            </section>
          ) : null}
        </>
      )}

      <Modal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        title={editingCollection ? 'EDITAR COLECCION' : 'NUEVA COLECCION'}
        className={styles.managementModal}
      >
        <form className={styles.form} onSubmit={submitCollection}>
          <div className={styles.formGroup}>
            <label>Nombre</label>
            <input
              required
              value={collectionForm.name}
              onChange={(event) =>
                setCollectionForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label>Descripcion</label>
            <textarea
              rows={4}
              value={collectionForm.description}
              onChange={(event) =>
                setCollectionForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </div>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={collectionForm.isActive}
              onChange={(event) =>
                setCollectionForm((prev) => ({ ...prev, isActive: event.target.checked }))
              }
            />
            Coleccion activa
          </label>
          <div className={styles.modalActions}>
            <button className={styles.secondaryBtn} type="button" onClick={() => setIsCollectionModalOpen(false)}>
              Cancelar
            </button>
            <button className={styles.submitBtn} type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        title={editingCard ? 'EDITAR CARTA' : 'NUEVA CARTA'}
        className={styles.managementModal}
      >
        <form className={styles.form} onSubmit={submitCard}>
          <div className={styles.formGroup}>
            <label>Nombre</label>
            <input
              required
              value={cardForm.name}
              onChange={(event) => setCardForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Rareza</label>
              <select
                value={cardForm.rarity}
                onChange={(event) => {
                  const rarity = event.target.value as CardRarity
                  setCardForm((prev) => ({
                    ...prev,
                    rarity,
                    dropWeight: cardRarityDropWeights[rarity]
                  }))
                }}
              >
                {cardRarities.map((rarity) => (
                  <option key={rarity} value={rarity}>
                    {rarityLabels[rarity]}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Peso por rareza</label>
              <div className={styles.readOnlyValue}>{cardRarityDropWeights[cardForm.rarity]}</div>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Coleccion</label>
            <select
              value={cardForm.collectionId ?? ''}
              onChange={(event) =>
                setCardForm((prev) => ({
                  ...prev,
                  collectionId: event.target.value ? Number(event.target.value) : null
                }))
              }
            >
              <option value="">Sin coleccion</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.modalActions}>
            <button className={styles.secondaryBtn} type="button" onClick={() => setIsCardModalOpen(false)}>
              Cancelar
            </button>
            <button className={styles.submitBtn} type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(cardImageTarget || collectionImageTarget)}
        onClose={closeImageModal}
        title="SUBIR IMAGEN"
        className={styles.managementModal}
      >
        <div className={styles.form}>
          <input
            className={styles.fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) => handleImageFile(event.target.files?.[0])}
          />
          {imagePreview ? <img className={styles.imagePreview} src={imagePreview} alt="" /> : null}
          <div className={styles.modalActions}>
            <button className={styles.secondaryBtn} type="button" onClick={closeImageModal}>
              Cancelar
            </button>
            <button
              className={styles.submitBtn}
              type="button"
              onClick={submitImage}
              disabled={!imagePreview || isSubmitting}
            >
              {isSubmitting ? 'Subiendo...' : 'Subir imagen'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="CONFIRMAR BORRADO">
        <p className={styles.modalText}>
          Quieres borrar <strong>{deleteTarget?.item.name}</strong>? Esta accion no se puede deshacer.
        </p>
        <div className={styles.modalActions}>
          <button className={styles.secondaryBtn} type="button" onClick={() => setDeleteTarget(null)}>
            Volver
          </button>
          <button className={styles.dangerBtn} type="button" onClick={confirmDelete} disabled={isSubmitting}>
            {isSubmitting ? 'Borrando...' : 'Si, borrar'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
