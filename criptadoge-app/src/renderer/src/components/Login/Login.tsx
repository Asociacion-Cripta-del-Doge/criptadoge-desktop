import React from 'react'
import styles from './Login.module.scss'

interface LoginProps {
  // sessionActive:boolean
  onLogin: () => void
}

export const Login: React.FC<LoginProps> = ({
  // sessionActive
  onLogin
  // ()=>{sessionActive=true;console.log(sessionActive);}
  }) => {
  return (
    <div className={styles.card}>
      <label htmlFor="nombre">Nombre</label>
      <input id="nombre" type="text"></input>
      <label htmlFor="pass">Contraseña</label>
      <input id="pass" type="password"></input>
      <button onClick={onLogin}>Iniciar Sesion</button>
    </div>
  )
}
