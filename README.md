# La Cripta del Doge — App de Gestión

Aplicación de escritorio para la gestión interna del club gaming **La Cripta del Doge**.
Permite administrar socios, controlar membresías y gestionar eventos del club.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Shell nativo | Electron 39 (frameless window, IPC) |
| Frontend | React 19 + TypeScript 5 |
| Estilos | SCSS + CSS Modules + CSS Custom Properties |
| Build | electron-vite + Vite 7 |
| Empaquetado | electron-builder |
| HTTP | Axios (con interceptores de auth) |
| Routing | React Router 7 (HashRouter) |
| Calendario | FullCalendar 6 |

## Requisitos previos

- **Node.js** 20 o superior
- **npm** 10 o superior

## Instalación y desarrollo

```bash
cd criptadoge-app
npm install
npm run dev       # Levanta Electron + renderer en modo desarrollo
```

> La app se conecta por defecto a `http://localhost:8080/api`, usando el Nginx del stack Docker de la web. Si necesitas conectar directamente al backend, define `VITE_API_URL=http://localhost:3000`.

## Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Modo desarrollo (Electron + Vite HMR) |
| `npm run build` | Typecheck + build de producción |
| `npm run build:win` | Genera instalador `.exe` para Windows |
| `npm run build:mac` | Genera `.dmg` para macOS |
| `npm run build:linux` | Genera AppImage/deb/snap para Linux |
| `npm run lint` | ESLint |
| `npm run typecheck` | Comprobación de tipos (node + web) |

## Documentación

- [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) — Arquitectura interna del sistema
