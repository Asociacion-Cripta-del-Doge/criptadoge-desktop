import { apiClient } from './axiosClient'

export type MembershipRequestStatus = 'Pendiente' | 'Revisada' | 'Aprobada' | 'Rechazada' | string

export interface MembershipRequest {
  id: string
  name: string
  email: string
  phone: string
  birthdate: string
  howDidYouKnow: string
  status: MembershipRequestStatus
  createdAt: string
  updatedAt: string
}

type RawMembershipRequest = Partial<MembershipRequest> & {
  _id?: string
}

type MembershipRequestsResponse =
  | RawMembershipRequest[]
  | {
      items?: RawMembershipRequest[]
      data?: RawMembershipRequest[]
    }

const normalizeMembershipRequest = (request: RawMembershipRequest): MembershipRequest => ({
  id: request.id ?? request._id ?? '',
  name: request.name ?? '',
  email: request.email ?? '',
  phone: request.phone ?? '',
  birthdate: request.birthdate ?? '',
  howDidYouKnow: request.howDidYouKnow ?? '',
  status: request.status ?? 'Pendiente',
  createdAt: request.createdAt ?? '',
  updatedAt: request.updatedAt ?? ''
})

export const getMembershipRequests = async (): Promise<MembershipRequest[]> => {
  const { data } = await apiClient.get<MembershipRequestsResponse>('/membership/requests')
  const requests = Array.isArray(data) ? data : (data?.items ?? data?.data ?? [])

  return requests
    .map(normalizeMembershipRequest)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
