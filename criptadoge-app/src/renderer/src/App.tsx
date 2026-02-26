import React, { useState } from 'react'
import { HashRouter } from 'react-router-dom'
import { AppRoutes } from './App.routes'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  return (
    <HashRouter>
      <AppRoutes isAuthenticated={isAuthenticated} onLogin={handleLogin} />
    </HashRouter>
  )
}

export default App
