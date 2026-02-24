import React, { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import styles from './Layout.module.scss'

export const Layout: React.FC = () => {
  return (
    <div className={styles.layoutContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          LA CRIPTA <br />
          <span className={styles.brandDoge}>DE DOGE</span>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/socios"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            Gestión de Socios
          </NavLink>
          <NavLink to="/eventos" className={styles.navItem}>
            Gestión de Eventos
          </NavLink>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  )
}
