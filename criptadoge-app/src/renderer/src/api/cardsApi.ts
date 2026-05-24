import { apiClient } from './axiosClient'

export type CardRarity = 'COMUN' | 'RARA' | 'EPICA' | 'LEGENDARIA'

export interface CardCollection {
  id: number
  name: string
  description: string
  isActive: boolean
  imageUrl?: string
}

export interface CollectibleCard {
  id: number
  name: string
  rarity: CardRarity
  dropWeight: number
  collectionId: number | null
  collectionName: string
  imageUrl?: string
}

export interface CollectionFormData {
  name: string
  description?: string
  isActive: boolean
}

export interface CardFormData {
  name: string
  rarity: CardRarity
  dropWeight: number
  collectionId?: number | null
}

export interface PackConfig {
  price: number
  cardsPerPack: number
  isActive: boolean
}

export interface CardsDashboard {
  totalUsers: number
  totalCards: number
  totalPacks: number
  totalCollections: number
  packsOpened: number
  packsUnopened: number
}

export interface CardStats {
  cardId: number
  name: string
  rarity: CardRarity
  dropWeight: number
  imageUrl?: string
  collectionName: string
  ownedByUsers: number
  totalCopies: number
}

type RawEntity = Record<string, unknown>

type ListResponse<T> =
  | T[]
  | {
      items?: T[]
      data?: T[]
    }

const rarities: CardRarity[] = ['COMUN', 'RARA', 'EPICA', 'LEGENDARIA']

const rarityDropWeights: Record<CardRarity, number> = {
  COMUN: 60,
  RARA: 25,
  EPICA: 12,
  LEGENDARIA: 3
}

const getList = <T>(response: ListResponse<T>): T[] => {
  if (Array.isArray(response)) return response
  return response.items ?? response.data ?? []
}

const toNumber = (value: unknown, fallback = 0): number => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : fallback
}

const toString = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' ? value : fallback
}

const normalizeImageUrl = (value: unknown): string | undefined => {
  const imageUrl = toString(value, '').trim()
  if (!imageUrl) return undefined

  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://') ||
    imageUrl.startsWith('data:') ||
    imageUrl.startsWith('blob:') ||
    imageUrl.startsWith('file:')
  ) {
    return imageUrl
  }

  const baseUrl = apiClient.defaults.baseURL
  if (!baseUrl) return imageUrl

  try {
    const normalizedBase = new URL(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`)
    const basePath = normalizedBase.pathname.replace(/\/$/, '')
    const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`

    if (basePath && normalizedPath.startsWith(`${basePath}/`)) {
      return `${normalizedBase.origin}${normalizedPath}`
    }

    return `${normalizedBase.origin}${basePath}${normalizedPath}`
  } catch {
    return imageUrl
  }
}

const toRarity = (value: unknown): CardRarity => {
  return rarities.includes(value as CardRarity) ? (value as CardRarity) : 'COMUN'
}

const getId = (entity: RawEntity): number => toNumber(entity.id ?? entity._id)

const normalizeCollection = (collection: RawEntity): CardCollection => ({
  id: getId(collection),
  name: toString(collection.name),
  description: toString(collection.description),
  isActive: Boolean(collection.isActive),
  imageUrl: normalizeImageUrl(collection.imageUrl ?? collection.image)
})

const normalizeCard = (card: RawEntity): CollectibleCard => {
  const collection = card.collection as RawEntity | undefined
  const collectionId = card.collectionId ?? collection?.id ?? collection?._id ?? null

  return {
    id: getId(card),
    name: toString(card.name),
    rarity: toRarity(card.rarity),
    dropWeight: toNumber(card.dropWeight),
    collectionId: collectionId === null || collectionId === undefined ? null : toNumber(collectionId),
    collectionName: toString(collection?.name, 'Sin coleccion'),
    imageUrl: normalizeImageUrl(card.imageUrl ?? card.image)
  }
}

const normalizePackConfig = (config: RawEntity): PackConfig => ({
  price: toNumber(config.price),
  cardsPerPack: toNumber(config.cardsPerPack),
  isActive: Boolean(config.isActive)
})

const normalizeDashboard = (dashboard: RawEntity): CardsDashboard => ({
  totalUsers: toNumber(dashboard.totalUsers),
  totalCards: toNumber(dashboard.totalCards),
  totalPacks: toNumber(dashboard.totalPacks),
  totalCollections: toNumber(dashboard.totalCollections),
  packsOpened: toNumber(dashboard.packsOpened),
  packsUnopened: toNumber(dashboard.packsUnopened)
})

const normalizeStats = (stats: RawEntity): CardStats => {
  const collection = stats.collection as RawEntity | undefined

  return {
    cardId: toNumber(stats.cardId ?? stats.id),
    name: toString(stats.name),
    rarity: toRarity(stats.rarity),
    dropWeight: toNumber(stats.dropWeight),
    imageUrl: normalizeImageUrl(stats.imageUrl ?? stats.image),
    collectionName: toString(collection?.name, 'Sin coleccion'),
    ownedByUsers: toNumber(stats.ownedByUsers ?? stats.ownersCount),
    totalCopies: toNumber(stats.totalCopies)
  }
}

export const getCardsDashboard = async (): Promise<CardsDashboard> => {
  const { data } = await apiClient.get<RawEntity>('/admin/dashboard')
  return normalizeDashboard(data)
}

export const getCollections = async (): Promise<CardCollection[]> => {
  const { data } = await apiClient.get<ListResponse<RawEntity>>('/collections')
  return getList(data).map(normalizeCollection).sort((a, b) => a.name.localeCompare(b.name))
}

export const createCollection = async (
  collectionData: CollectionFormData
): Promise<CardCollection> => {
  const { data } = await apiClient.post<RawEntity>('/collections', collectionData)
  return normalizeCollection(data)
}

export const updateCollection = async (
  id: number,
  collectionData: CollectionFormData
): Promise<CardCollection> => {
  const { data } = await apiClient.patch<RawEntity>(`/collections/${id}`, collectionData)
  return normalizeCollection(data)
}

export const deleteCollection = async (id: number): Promise<void> => {
  await apiClient.delete(`/collections/${id}`)
}

export const uploadCollectionImage = async (id: number, base64: string): Promise<CardCollection> => {
  const { data } = await apiClient.post<RawEntity>(`/collections/${id}/image`, { base64 })
  return normalizeCollection(data)
}

export const getCards = async (): Promise<CollectibleCard[]> => {
  const { data } = await apiClient.get<ListResponse<RawEntity>>('/cards')
  return getList(data).map(normalizeCard).sort((a, b) => a.id - b.id)
}

export const createCard = async (cardData: CardFormData): Promise<CollectibleCard> => {
  const { data } = await apiClient.post<RawEntity>('/cards', cardData)
  return normalizeCard(data)
}

export const updateCard = async (
  id: number,
  cardData: Partial<CardFormData>
): Promise<CollectibleCard> => {
  const { data } = await apiClient.patch<RawEntity>(`/cards/${id}`, cardData)
  return normalizeCard(data)
}

export const deleteCard = async (id: number): Promise<void> => {
  await apiClient.delete(`/cards/${id}`)
}

export const uploadCardImage = async (id: number, base64: string): Promise<CollectibleCard> => {
  const { data } = await apiClient.post<RawEntity>(`/cards/${id}/image`, { base64 })
  return normalizeCard(data)
}

export const getPackConfig = async (): Promise<PackConfig> => {
  const { data } = await apiClient.get<RawEntity>('/admin/pack-config')
  return normalizePackConfig(data)
}

export const updatePackConfig = async (
  configData: Partial<PackConfig>
): Promise<PackConfig> => {
  const { data } = await apiClient.patch<RawEntity>('/admin/pack-config', configData)
  return normalizePackConfig(data)
}

export const getCardStats = async (): Promise<CardStats[]> => {
  const { data } = await apiClient.get<ListResponse<RawEntity>>('/admin/cards/stats')
  return getList(data).map(normalizeStats)
}

export const cardRarities = rarities
export const cardRarityDropWeights = rarityDropWeights
