import React, { useState } from 'react'
import styles from './Login.module.scss'
import { Modal } from '../Modal/Modal'
import { apiClient } from '../../api/axiosClient' // 👈 Importamos nuestro cliente

interface LoginProps {
  onLogin: () => void
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('') // 👈 Cambiado a email
  const [password, setPassword] = useState('')
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim() === '' || password.trim() === '') {
      setErrorMessage('Por favor, introduce tu email y tu contraseña para poder continuar.')
      setShowErrorModal(true)
      return
    }

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      })

      localStorage.setItem('cripta_token', response.data.access_token)
      localStorage.setItem('cripta_user', JSON.stringify(response.data.user))

      onLogin()
    } catch (error: any) {
      console.error(error)
      setErrorMessage(
        error.response?.data?.message ||
          'Email o contraseña incorrectos. Por favor, inténtalo de nuevo.'
      )
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
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="text"
              placeholder="admin@lacripta.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
