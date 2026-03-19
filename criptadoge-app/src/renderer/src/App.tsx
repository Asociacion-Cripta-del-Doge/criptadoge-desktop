import { HashRouter } from 'react-router-dom'
import { AppRoutes } from './App.routes'
import { AuthProvider } from './context/AuthContext'
import { TitleBar } from './components/TitleBar/TitleBar'
import styles from './App.module.scss'

function App() {
  return (
    <div className={styles.appRoot}>
      <TitleBar />
      <div className={styles.appContent}>
        <HashRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </HashRouter>
      </div>
    </div>
  )
}

export default App
