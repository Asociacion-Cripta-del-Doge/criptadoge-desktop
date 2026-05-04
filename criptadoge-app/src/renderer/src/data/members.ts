// src/data/members.ts

export interface Member {
  id: string
  dni: string | null
  name: string
  email: string
  role: string
  status: string
  lastRenewal: string | null
  expirationDate: string | null
}

export interface User {
  id: string
  dni: string | null
  name: string
  email: string
  role: string
  status: string
  lastRenewal: string | null
  expirationDate: string | null
}

export const getMemberStatus = (
  member: Member
): 'Activo' | 'Inactivo' | 'Pendiente' | 'Desactivado' => {
  if (member.status === 'Desactivado') return 'Desactivado'
  if (!member.expirationDate) return 'Pendiente'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expiration = new Date(member.expirationDate)

  if (expiration < today) {
    return 'Inactivo'
  } else {
    return 'Activo'
  }
}
//Deprecated, los dejo por si queremos mockear algo
export const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    dni: '12345678A',
    name: 'Ana García',
    email: 'ana@ejemplo.com',
    role: 'MEMBER',
    status: 'Activo',
    lastRenewal: '2026-02-15',
    expirationDate: '2026-03-15'
  },
  {
    id: '2',
    dni: '87654321B',
    name: 'Carlos López',
    email: 'carlos@ejemplo.com',
    role: 'MEMBER',
    status: 'Activo',
    lastRenewal: '2025-12-01',
    expirationDate: '2026-01-01'
  },
  {
    id: '3',
    dni: '11223344C',
    name: 'Lucía Pérez',
    email: 'lucia@ejemplo.com',
    role: 'MEMBER',
    status: 'Activo',
    lastRenewal: null,
    expirationDate: null
  },
  {
    id: '4',
    dni: '99887766D',
    name: 'Marcos Doge',
    email: 'marcos@cripta.com',
    role: 'MEMBER',
    status: 'Activo',
    lastRenewal: '2026-02-10',
    expirationDate: '2026-03-10'
  }
]
