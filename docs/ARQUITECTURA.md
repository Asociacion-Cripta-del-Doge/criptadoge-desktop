# Arquitectura — La Cripta del Doge App

## 1. Sistema de Autenticación

### Flujo de login
1. El usuario introduce credenciales en `Login.tsx`
2. Se hace `POST /auth/login` al backend
3. La respuesta devuelve `{ token, user }` que se persiste en `localStorage`:
   - `cripta_token` — Bearer JWT
   - `cripta_user` — JSON con `{ id, email, role }`

### Validación de sesión al arrancar
`AuthContext.tsx` valida la sesión contra el backend en cada inicio de la app:

```
App monta → AuthProvider.useEffect →
  localStorage tiene token? → GET /usuarios/:id →
    OK → setUser + setIsAuthenticated(true)
    Error → logout() (limpia localStorage)
  No token → isLoading = false, redirige a /login
```

### Interceptores Axios (`axiosClient.ts`)
- **Request interceptor**: añade `Authorization: Bearer <token>` a cada petición
- **Response interceptor**: en error 401 emite `window.dispatchEvent(new Event('auth:unauthorized'))`
- `AuthContext` escucha ese evento y llama a `logout()` automáticamente

### Rutas protegidas
`ProtectedRoute.tsx` bloquea el acceso mientras `isLoading === true` (muestra `LoadingScreen`)
y redirige a `/login` si `!isAuthenticated`.

---

## 2. Sistema de Temas Dinámicos

> Implementado en la rama `feat/menu-opciones`.

### CSS Custom Properties
Los colores del sistema se definen como variables CSS nativas en `_variables.scss`:

```css
:root {
  --bg-main: #0f172a;         /* tema oscuro (defecto) */
  --bg-card: #1e293b;
  --color-primary: #173d8d;
  /* ... */
  --bg-card-rgb: 30, 41, 59; /* canales RGB para rgba() */
}

body.theme-light {
  --bg-main: #f1f5f9;         /* overrides tema claro */
  --bg-card: #ffffff;
  /* ... */
}
```

Las variables SCSS son bridges: `$bg-main: var(--bg-main)` — permiten usar la sintaxis SCSS
habitual en los módulos mientras el valor es dinámico en runtime.

> **Limitación SCSS:** `rgba(v.$color-primary, 0.5)` no funciona cuando la variable SCSS
> apunta a un `var()`. Solución: usar `rgba(var(--color-primary-rgb), 0.5)` con los canales RGB
> predefinidos.

### SettingsContext (`context/SettingsContext.tsx`)
Gestiona tema y autoStart de forma reactiva:

```typescript
setTheme('light') →
  localStorage.setItem('cripta_theme', 'light')
  document.body.classList.add('theme-light')  // activa los overrides CSS
```

El estado inicial se lee de `localStorage`. La clase en `body` es el único punto de control
del tema — todos los componentes responden automáticamente sin re-renderizados.

---

## 3. Comunicación con la API Nativa de Electron (IPC)

La ventana es frameless (`frame: false`), por lo que los controles y la comunicación nativa
se implementan vía IPC seguro a través del Context Bridge.

### Arquitectura de capas

```
Renderer (React)           Preload (Context Bridge)      Main Process (Electron)
──────────────────         ───────────────────────────   ───────────────────────
window.api.minimize()  →   ipcRenderer.send('...')    →  ipcMain.on('window-minimize')
window.api.maximize()  →   ipcRenderer.send('...')    →  ipcMain.on('window-maximize')
window.api.close()     →   ipcRenderer.send('...')    →  ipcMain.on('window-close')

window.api.getAutoStart() → ipcRenderer.invoke('get-autostart') → ipcMain.handle → app.getLoginItemSettings()
window.api.setAutoStart() → ipcRenderer.invoke('set-autostart') → ipcMain.handle → app.setLoginItemSettings()

                        ←   ipcRenderer.on('window-maximized') ← mainWindow.webContents.send(...)
```

### Patrones IPC

| Patrón | Cuándo usarlo | Ejemplo |
|--------|---------------|---------|
| `ipcMain.on` + `ipcRenderer.send` | Fire & forget, sin respuesta | Controles de ventana |
| `ipcMain.handle` + `ipcRenderer.invoke` | Request/response async | `getAutoStart` |
| `webContents.send` + `ipcRenderer.on` | Push desde main → renderer | Estado maximizado |

### API expuesta (`window.api`)
Definida en `src/preload/index.ts` y tipada en `src/preload/index.d.ts`:

```typescript
window.api = {
  minimize: () => void
  maximize: () => void
  close: () => void
  onMaximizeChange: (cb: (isMaximized: boolean) => void) => void
  setAutoStart: (enable: boolean) => Promise<void>   // feat/menu-opciones
  getAutoStart: () => Promise<boolean>               // feat/menu-opciones
}
```

### Auto-arranque con el sistema
`app.setLoginItemSettings({ openAtLogin: true/false })` registra/elimina la entrada
en el registro de Windows (`HKCU\Software\Microsoft\Windows\CurrentVersion\Run`),
LaunchAgents en macOS, o XDG autostart en Linux.
Al arrancar la app, `SettingsContext` consulta el estado real del SO con `getAutoStart()`
y lo usa como fuente de verdad (en lugar de `localStorage`).

---

## 4. Build Móvil con Capacitor (Android)

Capacitor envuelve la misma aplicación React en un WebView nativo para generar una APK
instalable en Android, **sin modificar el pipeline de Electron**.

### Configuración (`capacitor.config.ts`)

```typescript
{
  appId: 'com.lacripta.app',
  appName: 'La Cripta',
  webDir: 'out/renderer'   // salida del build de electron-vite
}
```

### Coexistencia con Electron

Los componentes que usan `window.api` (exclusivo de Electron) están protegidos con guards:

```typescript
// TitleBar.tsx — no se renderiza en contexto móvil/web
const isElectron = typeof window.api !== 'undefined'
if (!isElectron) return null

// SettingsContext.tsx — las llamadas IPC se saltan silenciosamente
if (typeof window.api !== 'undefined') {
  await window.api.setAutoStart(v)
}
```

### URL del backend (`axiosClient.ts`)

```typescript
baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
```

Configurar en `.env.production` antes de compilar la APK:

```env
VITE_API_URL=http://<IP-del-servidor>:<puerto>
```

> En Android, `localhost` apunta al propio dispositivo, no al servidor de desarrollo.
> Usar la IP real de la máquina o la URL de producción.

### Flujo completo para generar la APK

```
1. Configurar la URL del backend
   → Editar criptadoge-app/.env.production
   → VITE_API_URL=http://<IP-servidor>:3000

2. Compilar el frontend y sincronizar con Android
   cd criptadoge-app
   npm run build:mobile
   # equivale a: npm run build && npx cap sync

3. Abrir el proyecto en Android Studio
   npm run open:android
   # equivale a: npx cap open android

4. En Android Studio
   → Build > Generate Signed Bundle / APK
   → Seleccionar APK
   → Configurar keystore (o crear uno nuevo)
   → Elegir variante: debug (pruebas) o release (distribución)
   → Finish → el .apk se genera en android/app/build/outputs/apk/

5. Instalar en el dispositivo
   → Copiar el .apk al teléfono y abrir
   → O usar: adb install app-debug.apk
```

### Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run build:mobile` | Compila React + sincroniza archivos con la carpeta `android/` |
| `npm run open:android` | Abre el proyecto en Android Studio |

> La carpeta `android/` está en `.gitignore` — se regenera localmente con `npx cap add android`
> tras clonar el repositorio.

---

## 5. Mensajes de contacto

El formulario publico de contacto crea mensajes mediante `POST /contacto` en el backend NestJS,
o `POST /api/contacto` cuando se accede a traves de Nginx. No requiere autenticacion y recibe:

```json
{
  "nombre": "string",
  "email": "email valido",
  "asunto": "string",
  "mensaje": "string"
}
```

Todos los campos son obligatorios y `email` debe tener formato valido. Si la peticion es correcta,
el backend responde `201 Created` con el mensaje guardado en MongoDB, incluyendo `_id`,
`estado: "pendiente"`, `createdAt` y `updatedAt`.

La vista de administracion `#/contacto` usa el cliente Axios protegido para solicitar `GET /contacto`.
Este endpoint de lectura esta protegido para administradores con el patron `JwtAuthGuard`,
`RolesGuard` y `@Roles('ADMIN')`, y devuelve los mensajes guardados en MongoDB.

El frontend muestra los mensajes ordenados de mas reciente a mas antiguo y normaliza tanto respuestas
en array como respuestas paginadas con `items` o `data`.

Actualmente el flujo de contacto no envia emails; solo persiste el mensaje en MongoDB.

---

## 6. Reservas de mesas

La vista de administracion `#/reservas` consume el modulo backend `/reservas` para listar todas
las reservas, comprobar disponibilidad por mesa y franja horaria, crear reservas para el usuario
autenticado y cancelar reservas activas.

El formulario envia los campos del DTO del backend:

```json
{
  "mesaId": "uuid",
  "fechaHoraInicio": "ISO 8601",
  "fechaHoraFin": "ISO 8601",
  "asientosReservados": 1
}
```

La disponibilidad se consulta antes de crear mediante `GET /reservas/disponibilidad`. La tabla
principal usa `GET /reservas`, por lo que esta pestana queda restringida al rol `ADMIN` igual que
el resto del panel interno.
