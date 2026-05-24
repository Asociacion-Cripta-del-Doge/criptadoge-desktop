import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen'
import { Login } from './components/Login/Login'
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute'

const Layout = lazy(() => import('./components/Layout/Layout').then((m) => ({ default: m.Layout })))
const Dashboard = lazy(() =>
  import('./components/Dashboard/Dashboard').then((m) => ({ default: m.Dashboard }))
)
const UsersList = lazy(() =>
  import('./components/UsersList/UsersList').then((m) => ({ default: m.UsersList }))
)
const MemberProfile = lazy(() =>
  import('./components/MemberProfile/MemberProfile').then((m) => ({ default: m.MemberProfile }))
)
const EventList = lazy(() =>
  import('./components/EventList/EventList').then((m) => ({ default: m.EventList }))
)
const EventProfile = lazy(() =>
  import('./components/EventProfile/EventProfile').then((m) => ({ default: m.EventProfile }))
)
const EventCalendar = lazy(() =>
  import('./components/EventCalendar/EventCalendar').then((m) => ({ default: m.EventCalendar }))
)
const EventLabelManagement = lazy(() =>
  import('./components/EventLabelManagement/EventLabelManagement').then((m) => ({
    default: m.EventLabelManagement
  }))
)
const ContactMessages = lazy(() =>
  import('./components/ContactMessages/ContactMessages').then((m) => ({
    default: m.ContactMessages
  }))
)
const MembershipRequests = lazy(() =>
  import('./components/MembershipRequests/MembershipRequests').then((m) => ({
    default: m.MembershipRequests
  }))
)
const MesaManagement = lazy(() =>
  import('./components/MesaManagement/MesaManagement').then((m) => ({
    default: m.MesaManagement
  }))
)
const ReservationManagement = lazy(() =>
  import('./components/ReservationManagement/ReservationManagement').then((m) => ({
    default: m.ReservationManagement
  }))
)
const WebTextManagement = lazy(() =>
  import('./components/WebTextManagement/WebTextManagement').then((m) => ({
    default: m.WebTextManagement
  }))
)
const CardManagement = lazy(() =>
  import('./components/CardManagement/CardManagement').then((m) => ({
    default: m.CardManagement
  }))
)

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="socios" element={<UsersList />} />
            <Route path="socios/:id" element={<MemberProfile />} />
            <Route path="eventos" element={<EventList />} />
            <Route path="eventos/:id" element={<EventProfile />} />
            <Route path="calendario" element={<EventCalendar />} />
            <Route path="etiquetas" element={<EventLabelManagement />} />
            <Route path="contacto" element={<ContactMessages />} />
            <Route path="membresias" element={<MembershipRequests />} />
            <Route path="mesas" element={<MesaManagement />} />
            <Route path="reservas" element={<ReservationManagement />} />
            <Route path="textos-web" element={<WebTextManagement />} />
            <Route path="cartas" element={<CardManagement />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  )
}
