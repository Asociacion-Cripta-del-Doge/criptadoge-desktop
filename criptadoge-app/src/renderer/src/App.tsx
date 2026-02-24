import React, { Suspense, lazy, useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  return (
    <HashRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {!isAuthenticated ? (
            <Route path="*" element={<Login onLogin={handleLogin} />} />
          ) : (
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="socios" element={<UsersList />} />
              <Route path="socios/:id" element={<MemberProfile />} />
              <Route path="eventos" element={<EventList />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          )}
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

