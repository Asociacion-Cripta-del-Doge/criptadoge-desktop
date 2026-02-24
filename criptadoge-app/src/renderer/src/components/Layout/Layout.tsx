import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import styles from './Layout.module.scss'

export const Layout: React.FC = () => {
  return (
    <div className={styles.layoutContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <h2>LA CRIPTA</h2>
          <p>Panel de Control</p>
        </div>

        <nav className={styles.nav}>
          <NavLink to="/" className={styles.navItem}>
            Dashboard
          </NavLink>
          <NavLink to="/socios" className={styles.navItem}>
            Gestión de Socios
          </NavLink>
          <NavLink to="/eventos" className={styles.navItem}>
            Gestión de Eventos
          </NavLink>
        </nav>

        <div className={styles.userMenu}>
          <div className={styles.userInfo}></div>
        </div>
      </aside>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  )
}
