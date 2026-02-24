import React, { Suspense, lazy } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen'

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
  return (
    <HashRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="socios" element={<UsersList />} />
            <Route path="socios/:id" element={<MemberProfile />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
