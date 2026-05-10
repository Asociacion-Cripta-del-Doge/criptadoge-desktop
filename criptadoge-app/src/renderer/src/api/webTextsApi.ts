import { apiClient } from './axiosClient'

export type WebTextType = 'text' | 'textarea' | 'markdown'

export interface WebText {
  id: string
  key: string
  value: string
  section: string
  type: WebTextType
  locale: string
  createdAt: string
  updatedAt: string
}

export interface WebTextFormData {
  key: string
  value: string
  section: string
  type: WebTextType
  locale: string
}

type RawWebText = Partial<WebText> & {
  _id?: string
}

type WebTextsResponse =
  | RawWebText[]
  | {
      items?: RawWebText[]
      data?: RawWebText[]
    }

const VALID_TYPES: WebTextType[] = ['text', 'textarea', 'markdown']

const normalizeType = (type?: string): WebTextType => {
  if (type && VALID_TYPES.includes(type as WebTextType)) return type as WebTextType
  return 'text'
}

const normalizeWebText = (text: RawWebText): WebText => ({
  id: text.id ?? text._id ?? '',
  key: text.key ?? '',
  value: text.value ?? '',
  section: text.section ?? '',
  type: normalizeType(text.type),
  locale: text.locale ?? 'es',
  createdAt: text.createdAt ?? '',
  updatedAt: text.updatedAt ?? ''
})

export const sortWebTexts = (texts: WebText[]): WebText[] =>
  [...texts].sort((a, b) => {
    const sectionCompare = a.section.localeCompare(b.section, 'es')
    if (sectionCompare !== 0) return sectionCompare

    const keyCompare = a.key.localeCompare(b.key, 'es')
    if (keyCompare !== 0) return keyCompare

    return a.locale.localeCompare(b.locale, 'es')
  })

export const getWebTexts = async (): Promise<WebText[]> => {
  const { data } = await apiClient.get<WebTextsResponse>('/web-texts/admin')
  const texts = Array.isArray(data) ? data : (data?.items ?? data?.data ?? [])

  return sortWebTexts(texts.map(normalizeWebText))
}

export const createWebText = async (textData: WebTextFormData): Promise<WebText> => {
  const { data } = await apiClient.post<RawWebText>('/web-texts', textData)
  return normalizeWebText(data)
}

export const updateWebText = async (
  id: string,
  textData: Partial<WebTextFormData>
): Promise<WebText> => {
  const { data } = await apiClient.patch<RawWebText>(`/web-texts/${id}`, textData)
  return normalizeWebText(data)
}
