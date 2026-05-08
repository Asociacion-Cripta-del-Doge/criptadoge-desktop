import { apiClient } from './axiosClient'
import { Mesa } from './mesasApi'

export type ReservaEstado = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA' | string

export interface ReservaUser {
  id: string
  name: string
  email: string
  role?: string
  status?: string
}

export interface ReservaMesa {
  id: string
  mesaId: string
  userId: string
  fechaHoraInicio: string
  fechaHoraFin: string
  asientosReservados: number
  precio: number
  estado: ReservaEstado
  mesa?: Mesa
  user?: ReservaUser
}

export interface ReservaFormData {
  mesaId: string
  fechaHoraInicio: string
  fechaHoraFin: string
  asientosReservados: number
}

export interface DisponibilidadReserva {
  mesa: Mesa
  fechaHoraInicio: string
  fechaHoraFin: string
  asientosTotales: number
  asientosOcupados: number
  asientosDisponibles: number
  asientosSolicitados: number
  disponible: boolean
}

type RawMesa = Partial<Mesa> & {
  _id?: string
}

type RawReserva = Partial<ReservaMesa> & {
  _id?: string
  mesa?: RawMesa
  user?: Partial<ReservaUser>
}

type ReservaResponse =
  | RawReserva[]
  | {
      items?: RawReserva[]
      data?: RawReserva[]
    }

type RawDisponibilidad = Partial<DisponibilidadReserva> & {
  mesa?: RawMesa
}

const normalizeMesa = (mesa?: RawMesa): Mesa | undefined => {
  if (!mesa) return undefined

  return {
    id: mesa.id ?? mesa._id ?? '',
    asientos: Number(mesa.asientos ?? 1),
    orden: Number(mesa.orden ?? 1),
    esDePago: Boolean(mesa.esDePago)
  }
}

const normalizePrice = (precio: unknown): number => {
  if (typeof precio === 'number') return precio
  if (typeof precio === 'string') return Number(precio)
  if (typeof precio === 'object' && precio !== null && 'toString' in precio) {
    return Number(precio.toString())
  }

  return 0
}

const normalizeReserva = (reserva: RawReserva): ReservaMesa => ({
  id: reserva.id ?? reserva._id ?? '',
  mesaId: reserva.mesaId ?? reserva.mesa?.id ?? reserva.mesa?._id ?? '',
  userId: reserva.userId ?? reserva.user?.id ?? '',
  fechaHoraInicio: reserva.fechaHoraInicio ?? '',
  fechaHoraFin: reserva.fechaHoraFin ?? '',
  asientosReservados: Number(reserva.asientosReservados ?? 1),
  precio: normalizePrice(reserva.precio),
  estado: reserva.estado ?? 'PENDIENTE',
  mesa: normalizeMesa(reserva.mesa),
  user: reserva.user
    ? {
        id: reserva.user.id ?? '',
        name: reserva.user.name ?? 'Sin nombre',
        email: reserva.user.email ?? '',
        role: reserva.user.role,
        status: reserva.user.status
      }
    : undefined
})

const sortReservas = (reservas: ReservaMesa[]): ReservaMesa[] =>
  [...reservas].sort(
    (a, b) => new Date(b.fechaHoraInicio).getTime() - new Date(a.fechaHoraInicio).getTime()
  )

export const normalizeReservaDates = (data: ReservaFormData): ReservaFormData => ({
  ...data,
  fechaHoraInicio: new Date(data.fechaHoraInicio).toISOString(),
  fechaHoraFin: new Date(data.fechaHoraFin).toISOString()
})

export const getReservas = async (): Promise<ReservaMesa[]> => {
  const { data } = await apiClient.get<ReservaResponse>('/reservas')
  const reservas = Array.isArray(data) ? data : (data?.items ?? data?.data ?? [])

  return sortReservas(reservas.map(normalizeReserva))
}

export const createReserva = async (reservaData: ReservaFormData): Promise<ReservaMesa> => {
  const { data } = await apiClient.post<RawReserva>('/reservas', normalizeReservaDates(reservaData))
  return normalizeReserva(data)
}

export const cancelReserva = async (id: string): Promise<ReservaMesa> => {
  const { data } = await apiClient.patch<RawReserva>(`/reservas/${id}/cancelar`)
  return normalizeReserva(data)
}

export const checkReservaDisponibilidad = async (
  reservaData: ReservaFormData
): Promise<DisponibilidadReserva> => {
  const { data } = await apiClient.get<RawDisponibilidad>('/reservas/disponibilidad', {
    params: normalizeReservaDates(reservaData)
  })

  return {
    mesa: normalizeMesa(data.mesa) ?? {
      id: reservaData.mesaId,
      asientos: Number(data.asientosTotales ?? 0),
      orden: 0,
      esDePago: false
    },
    fechaHoraInicio: data.fechaHoraInicio ?? '',
    fechaHoraFin: data.fechaHoraFin ?? '',
    asientosTotales: Number(data.asientosTotales ?? 0),
    asientosOcupados: Number(data.asientosOcupados ?? 0),
    asientosDisponibles: Number(data.asientosDisponibles ?? 0),
    asientosSolicitados: Number(data.asientosSolicitados ?? reservaData.asientosReservados),
    disponible: Boolean(data.disponible)
  }
}

export { sortReservas }
