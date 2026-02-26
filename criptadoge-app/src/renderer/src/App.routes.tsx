import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen'
import { Login } from './components/Login/Login'

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

interface AppRoutesProps {
  isAuthenticated: boolean
  onLogin: () => void
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ isAuthenticated, onLogin }) => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {!isAuthenticated ? (
          <Route path="*" element={<Login onLogin={onLogin} />} />
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="socios" element={<UsersList />} />
            <Route path="socios/:id" element={<MemberProfile />} />
            <Route path="eventos" element={<EventList />} />
            <Route path="eventos/:id" element={<EventProfile />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        )}
      </Routes>
    </Suspense>
  )
}
