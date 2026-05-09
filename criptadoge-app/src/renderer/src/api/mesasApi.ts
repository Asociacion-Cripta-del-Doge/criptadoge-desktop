import { apiClient } from './axiosClient'

export interface Mesa {
  id: string
  asientos: number
  orden: number
  esDePago: boolean
}

export interface MesaFormData {
  asientos: number
  orden: number
  esDePago: boolean
}

type RawMesa = Partial<Mesa> & {
  _id?: string
}

type MesasResponse =
  | RawMesa[]
  | {
      items?: RawMesa[]
      data?: RawMesa[]
    }

const normalizeMesa = (mesa: RawMesa): Mesa => ({
  id: mesa.id ?? mesa._id ?? '',
  asientos: Number(mesa.asientos ?? 1),
  orden: Number(mesa.orden ?? 1),
  esDePago: Boolean(mesa.esDePago)
})

const sortMesas = (mesas: Mesa[]): Mesa[] => [...mesas].sort((a, b) => a.orden - b.orden)

export const getMesas = async (): Promise<Mesa[]> => {
  const { data } = await apiClient.get<MesasResponse>('/mesas')
  const mesas = Array.isArray(data) ? data : (data?.items ?? data?.data ?? [])

  return sortMesas(mesas.map(normalizeMesa))
}

export const createMesa = async (mesaData: MesaFormData): Promise<Mesa> => {
  const { data } = await apiClient.post<RawMesa>('/mesas', mesaData)
  return normalizeMesa(data)
}

export const updateMesa = async (id: string, mesaData: MesaFormData): Promise<Mesa> => {
  const { data } = await apiClient.put<RawMesa>(`/mesas/${id}`, mesaData)
  return normalizeMesa(data)
}

export const deleteMesa = async (id: string): Promise<void> => {
  await apiClient.delete(`/mesas/${id}`)
}

export { sortMesas }
