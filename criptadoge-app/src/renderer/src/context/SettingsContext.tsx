import React, { createContext, useContext, useState, useEffect } from 'react'

interface Settings {
  theme: 'light' | 'dark'
  autoStart: boolean
}

interface SettingsContextType {
  theme: 'light' | 'dark'
  autoStart: boolean
  setTheme: (t: 'light' | 'dark') => void
  setAutoStart: (v: boolean) => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | null>(null)

const DEFAULTS: Settings = { theme: 'dark', autoStart: false }

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('cripta_theme') as 'light' | 'dark') ?? DEFAULTS.theme
  })

  const [autoStart, setAutoStartState] = useState<boolean>(() => {
    return localStorage.getItem('cripta_autostart') === 'true'
  })

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('theme-light')
    } else {
      document.body.classList.remove('theme-light')
    }
  }, [theme])

  const setTheme = (t: 'light' | 'dark') => {
    localStorage.setItem('cripta_theme', t)
    setThemeState(t)
  }

  useEffect(() => {
    window.api.getAutoStart().then((osValue) => {
      setAutoStartState(osValue)
      localStorage.setItem('cripta_autostart', String(osValue))
    })
  }, [])

  const setAutoStart = async (v: boolean): Promise<void> => {
    localStorage.setItem('cripta_autostart', String(v))
    setAutoStartState(v)
    await window.api.setAutoStart(v)
  }

  return (
    <SettingsContext.Provider value={{ theme, autoStart, setTheme, setAutoStart }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = (): SettingsContextType => {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
