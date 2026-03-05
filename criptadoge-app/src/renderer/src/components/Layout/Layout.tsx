import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import styles from './Layout.module.scss'

interface LayoutProps {
  onLogout?: () => void
}

export const Layout: React.FC<LayoutProps> = ({ onLogout }) => {
  return (
    <div className={styles.layoutContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>LA CRIPTA</h1>
          <p className={styles.subtitle}>Panel de Control</p>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/socios"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Socios
          </NavLink>
          <NavLink
            to="/eventos"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Eventos
          </NavLink>
        </nav>

        <div className={styles.logoutWrapper}>
          <button onClick={onLogout} className={styles.logoutBtn}>
            CERRAR SESIÓN
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  )
}
