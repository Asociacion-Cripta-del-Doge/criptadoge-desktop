export interface Member {
  id: string
  dni: string
  name: string
  email: string
  status: 'Activo' | 'Inactivo' | 'Pendiente'
  joinDate: string
}

export const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    dni: '12345678A',
    name: 'Ana García',
    email: 'ana@ejemplo.com',
    status: 'Activo',
    joinDate: '2025-01-15'
  },
  {
    id: '2',
    dni: '87654321B',
    name: 'Carlos López',
    email: 'carlos@ejemplo.com',
    status: 'Inactivo',
    joinDate: '2024-11-02'
  },
  {
    id: '3',
    dni: '11223344C',
    name: 'Lucía Pérez',
    email: 'lucia@ejemplo.com',
    status: 'Pendiente',
    joinDate: '2026-02-20'
  },
  {
    id: '4',
    dni: '99887766D',
    name: 'Marcos Doge',
    email: 'marcos@cripta.com',
    status: 'Activo',
    joinDate: '2023-08-10'
  }
]
