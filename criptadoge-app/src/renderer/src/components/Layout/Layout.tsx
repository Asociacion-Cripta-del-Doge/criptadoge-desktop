import React, { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import styles from './Layout.module.scss'
import { useAuth } from '../../context/AuthContext'

export const Layout: React.FC = () => {
  const { logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = (): void => setIsMenuOpen(false)

  return (
    <div className={styles.layoutContainer}>
      <div className={styles.topBar}>
        <span className={styles.topBarLogo}>LA CRIPTA</span>
        <button
          className={styles.hamburger}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Abrir menú"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {isMenuOpen && <div className={styles.overlay} onClick={closeMenu} />}

      <aside className={`${styles.sidebar} ${isMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>LA CRIPTA</h1>
          <p className={styles.subtitle}>Panel de Control</p>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/"
            end
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/socios"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Socios
          </NavLink>
          <NavLink
            to="/eventos"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Eventos
          </NavLink>
          <NavLink
            to="/calendario"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Calendario
          </NavLink>
          <NavLink
            to="/contacto"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Contacto
          </NavLink>
          <NavLink
            to="/mesas"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Mesas
          </NavLink>
          <NavLink
            to="/reservas"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Reservas
          </NavLink>
        </nav>

        <div className={styles.logoutWrapper}>
          <button onClick={logout} className={styles.logoutBtn}>
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
