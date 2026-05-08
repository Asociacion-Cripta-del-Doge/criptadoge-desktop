# AGENTS.md

Guia operativa para agentes que trabajen en este repositorio.

## Contexto del proyecto

Este repositorio contiene la aplicacion de escritorio de **La Cripta del Doge**, una app interna de gestion para socios, membresias, eventos y operaciones del club.

Antes de tocar arquitectura, autenticacion, temas, IPC, Capacitor o contacto, lee:

- `docs/ARQUITECTURA.md`
- `README.md`
- `criptadoge-app/README.md` si necesitas contexto local de Electron

## Estructura principal

- `criptadoge-app/`: aplicacion Electron + React + TypeScript.
- `criptadoge-app/src/main/`: proceso principal de Electron.
- `criptadoge-app/src/preload/`: Context Bridge y tipados de `window.api`.
- `criptadoge-app/src/renderer/`: frontend React.
- `docs/`: documentacion tecnica del proyecto.

## Stack

- Electron 39 con ventana frameless e IPC seguro.
- React 19 + TypeScript 5.
- React Router 7 con `HashRouter`.
- SCSS + CSS Modules + CSS Custom Properties.
- Axios con interceptores de autenticacion.
- electron-vite, Vite 7 y electron-builder.
- Capacitor para build Android.

## Comandos habituales

Ejecutar desde `criptadoge-app/`:

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

Para Android:

```bash
npm run build:mobile
npm run open:android
```

La app usa por defecto `http://localhost:3000` como backend. Para Android, configurar `VITE_API_URL` en `criptadoge-app/.env.production` con una URL accesible desde el dispositivo.

## Flujo de trabajo

- Base habitual: `dev`.
- Crear ramas descriptivas con prefijos como `feat/`, `fix/`, `refactor/`, `style/`, `docs/` o `chore/`.
- No revertir cambios existentes sin confirmacion expresa: puede haber trabajo local del usuario.
- Mantener los cambios acotados al objetivo de la tarea.
- Actualizar documentacion cuando cambien flujos, comandos, arquitectura o comportamiento visible.

## Commits

Usar Conventional Commits en espanol, con formato estricto:

```text
tipo: descripcion breve en minusculas
```

Tipos permitidos:

- `feat`
- `fix`
- `refactor`
- `style`
- `docs`
- `chore`

Ejemplos:

```text
feat: anade gestion de mesas
fix: corrige validacion de sesion caducada
docs: documenta flujo de ipc
```

## Frontend

- Seguir los patrones existentes antes de crear abstracciones nuevas.
- Usar SCSS Modules cuando la pantalla o componente ya siga ese estilo.
- Consumir variables CSS del sistema de temas; no hardcodear colores si ya existe token equivalente.
- En temas dinamicos, recordar que las variables SCSS pueden apuntar a `var(...)`.
- Para transparencias con colores dinamicos, usar canales RGB CSS, por ejemplo `rgba(var(--color-primary-rgb), 0.5)`.
- Mantener componentes Electron-only protegidos con guards de `window.api` para compatibilidad web/Android.

## Autenticacion y API

- El token se guarda como `cripta_token` en `localStorage`.
- El usuario se guarda como `cripta_user`.
- El cliente HTTP principal vive en `axiosClient.ts`.
- Los 401 disparan `auth:unauthorized`; `AuthContext` gestiona el logout.
- Las rutas protegidas deben pasar por `ProtectedRoute.tsx`.

## IPC y Electron

- Exponer APIs nativas solo desde `src/preload/` mediante Context Bridge.
- Mantener tipados sincronizados en `src/preload/index.d.ts`.
- Usar `ipcMain.handle` + `ipcRenderer.invoke` para llamadas con respuesta.
- Usar `ipcMain.on` + `ipcRenderer.send` para acciones fire-and-forget.
- No acceder directamente a APIs de Node desde el renderer.

## Verificacion

Antes de cerrar una tarea, ejecutar la verificacion mas cercana al cambio:

- `npm run typecheck` para cambios TypeScript.
- `npm run lint` para estilo y reglas ESLint.
- `npm run build` para cambios de mayor alcance.

Si no se puede ejecutar una comprobacion, indicarlo claramente junto con el motivo.

## Documentacion

- `docs/ARQUITECTURA.md` es la fuente para arquitectura y flujos tecnicos.
- Este archivo debe ser breve y accionable: comandos, convenciones, rutas clave y reglas de trabajo.
- Evitar duplicar bloques largos de arquitectura aqui; enlazar o resumir.
