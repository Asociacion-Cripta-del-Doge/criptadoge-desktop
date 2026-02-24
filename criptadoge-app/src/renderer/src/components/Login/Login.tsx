import React, { useState } from 'react'
import styles from './Login.module.scss'
import { Modal } from '../Modal/Modal'

interface LoginProps {
  onLogin: () => void
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim() === '' || password.trim() === '') {
      setErrorMessage('Por favor, introduce tu usuario y tu contraseña para poder continuar.')
      setShowErrorModal(true)
    } else if (username === 'admin' && password === '1234') {
      onLogin()
    } else {
      setErrorMessage('Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.')
      setShowErrorModal(true)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>LA CRIPTA</h2>
        <p>Panel de Administración</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="nombre">Usuario</label>
            <input
              id="nombre"
              type="text"
              placeholder="Ej: admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="pass">Contraseña</label>
            <input
              id="pass"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Iniciar Sesión
          </button>
        </form>
      </div>

      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="ERROR DE ACCESO"
      >
        <p className={styles.modalText}>{errorMessage}</p>
        <div className={styles.modalActions}>
          <button className={styles.modalBtn} onClick={() => setShowErrorModal(false)}>
            Aceptar
          </button>
        </div>
      </Modal>
    </div>
  )
}
