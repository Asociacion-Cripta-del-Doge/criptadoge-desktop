import React, { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import styles from './Layout.module.scss'

export const Layout: React.FC = () => {
  const [sessionActive, setSession] = useState(false)

  return (
    <div className={styles.layoutContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          LA CRIPTA <br />
          <span className={styles.brandDoge}>DE DOGE</span>
        </div>

        <nav className={styles.nav}>
          <NavLink
            // hidden={!sessionActive}
            to="/dashboard"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            // hidden={!sessionActive}
            to="/socios"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            Gestión de Socios
          </NavLink>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  )
}
