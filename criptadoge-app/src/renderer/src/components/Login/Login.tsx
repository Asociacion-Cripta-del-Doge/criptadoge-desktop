import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Login.module.scss'
import { Modal } from '../Modal/Modal'
import { apiClient } from '../../api/axiosClient'
import { useAuth } from '../../context/AuthContext'

export const Login: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const savedEmail = localStorage.getItem('cripta_remembered_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

      if (rememberMe) {
        localStorage.setItem('cripta_remembered_email', email)
      } else {
        localStorage.removeItem('cripta_remembered_email')
      }

      login(response.data.access_token, response.data.user)
      navigate('/')
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

          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className={styles.checkboxLabel}>Recordar mi email</span>
            </label>
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
