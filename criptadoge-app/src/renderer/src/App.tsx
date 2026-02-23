import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { UsersList } from './components/UsersList/UsersList'
import { MemberProfile } from './components/MemberProfile/MemberProfile'
import { Dashboard } from './components/Dashboard/Dashboard'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="socios" element={<UsersList />} />
          <Route path="socios/:id" element={<MemberProfile />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
