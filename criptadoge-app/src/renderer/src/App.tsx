import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { UsersList } from './components/UsersList/UsersList'

const DummyDashboard = () => (
  //dashboard temporal!!
  <div style={{ padding: '3rem', color: 'white', fontFamily: 'Roboto' }}>
    <h1 style={{ fontFamily: 'Minecraft', fontSize: '2.5rem', marginBottom: '1rem' }}>
      DASHBOARD PRINCIPAL
    </h1>
    <p style={{ color: '#94a3b8' }}>
      Aquí irán las estadísticas generales: Socios activos, cuotas pendientes del mes, etc.
    </p>
  </div>
)

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DummyDashboard />} />
          <Route path="socios" element={<UsersList />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
