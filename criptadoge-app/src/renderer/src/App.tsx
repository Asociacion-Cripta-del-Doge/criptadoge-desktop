import React, { useState } from 'react'
import { HashRouter } from 'react-router-dom'
import { AppRoutes } from './App.routes'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem('cripta_token')
  )

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('cripta_token')
    localStorage.removeItem('cripta_user')
    setIsAuthenticated(false)
  }

  return (
    <HashRouter>
      <AppRoutes isAuthenticated={isAuthenticated} onLogin={handleLogin} onLogout={handleLogout} />
    </HashRouter>
  )
}

export default App
