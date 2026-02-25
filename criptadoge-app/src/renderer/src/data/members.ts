// src/data/members.ts

export interface Member {
  id: string
  dni: string
  name: string
  email: string
  lastRenewal: string
  expirationDate: string
}

export const getMemberStatus = (expirationDate: string): 'Activo' | 'Inactivo' | 'Pendiente' => {
  if (!expirationDate) return 'Pendiente'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expiration = new Date(expirationDate)

  if (expiration < today) {
    return 'Inactivo'
  } else {
    return 'Activo'
  }
}

export const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    dni: '12345678A',
    name: 'Ana García',
    email: 'ana@ejemplo.com',
    lastRenewal: '2026-02-15',
    expirationDate: '2026-03-15'
  },
  {
    id: '2',
    dni: '87654321B',
    name: 'Carlos López',
    email: 'carlos@ejemplo.com',
    lastRenewal: '2025-12-01',
    expirationDate: '2026-01-01'
  },
  {
    id: '3',
    dni: '11223344C',
    name: 'Lucía Pérez',
    email: 'lucia@ejemplo.com',
    lastRenewal: '',
    expirationDate: ''
  },
  {
    id: '4',
    dni: '99887766D',
    name: 'Marcos Doge',
    email: 'marcos@cripta.com',
    lastRenewal: '2026-02-10',
    expirationDate: '2026-03-10'
  }
]
