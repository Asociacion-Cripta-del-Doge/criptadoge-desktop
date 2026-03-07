import { HashRouter } from 'react-router-dom'
import { AppRoutes } from './App.routes'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  )
}

export default App
