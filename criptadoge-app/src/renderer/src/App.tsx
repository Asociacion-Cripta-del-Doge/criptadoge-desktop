import { HashRouter } from 'react-router-dom'
import { AppRoutes } from './App.routes'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { TitleBar } from './components/TitleBar/TitleBar'
import styles from './App.module.scss'

function App() {
  return (
    <SettingsProvider>
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
    </SettingsProvider>
  )
}

export default App
