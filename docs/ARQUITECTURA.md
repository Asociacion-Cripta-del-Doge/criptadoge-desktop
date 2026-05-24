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
baseURL: import.meta.env.VITE_API_URL?.trim() || 'http://localhost:8080/api'
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
   → VITE_API_URL=http://<IP-servidor>:8080/api

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

## 5. Componentes UI compartidos

### Modal (`src/renderer/src/components/Modal`)

`Modal.tsx` centraliza el overlay, el cierre al pulsar fuera y la tarjeta base de dialogo. El
componente acepta `className` para que cada pantalla pueda ajustar el ancho del dialogo sin
duplicar la estructura ni romper otros modales.

El modal base:

- centra la tarjeta con `position: fixed`, `inset: 0`, `display: flex` y padding de seguridad;
- limita la altura con `max-height: 90vh` y permite scroll interno con `overflow: auto`;
- usa `width: min(100%, 500px)` como tamano por defecto.

Los formularios que necesitan mas espacio deben definir una clase de modulo SCSS y pasarla como
`className`, por ejemplo:

```tsx
<Modal className={styles.reservationModal} ...>
```

Patrones actuales:

- `MesaManagement`: `managementModal`, ancho maximo `500px`.
- `ReservationManagement`: `reservationModal`, ancho maximo `600px`; los campos de fecha usan
  grid responsive para evitar scroll horizontal con `datetime-local`.
- `WebTextManagement`: `webTextModal`, ancho maximo `720px`; inputs, selects y textarea usan
  `width: 100%` y `min-width: 0` para no forzar desbordes.

Cuando se anadan nuevos modales con filas de formulario, mantener `min-width: 0` en contenedores
grid/flex e inputs nativos para que el centrado visual no se rompa por anchos minimos del navegador.

---

## 6. Mensajes de contacto

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

La misma vista permite actualizar el seguimiento del mensaje con `PATCH /contacto/:id`,
enviando:

```json
{
  "estado": "pendiente | en_proceso | respondido | resuelto | archivado"
}
```

La respuesta debe devolver el mensaje actualizado con `_id`, `estado`, `createdAt` y `updatedAt`.

El frontend muestra los mensajes ordenados de mas reciente a mas antiguo y normaliza tanto respuestas
en array como respuestas paginadas con `items` o `data`.

Actualmente el flujo de contacto no envia emails; solo persiste el mensaje en MongoDB.

---

## 7. Reservas de mesas

La vista de administracion `#/reservas` consume el modulo backend `/reservas` para listar todas
las reservas, comprobar disponibilidad por mesa y franja horaria, crear reservas para el usuario
autenticado y cancelar reservas activas.

El formulario envia los campos del DTO del backend:

```json
{
  "mesaId": "uuid",
  "fechaHoraInicio": "ISO 8601",
  "fechaHoraFin": "ISO 8601",
  "asientosReservados": 2
}
```

La disponibilidad se consulta antes de crear mediante `GET /reservas/disponibilidad`. La reserva
solo permite cantidades pares desde 2 asientos y nunca por encima de la capacidad de la mesa.

El backend calcula el precio informativo al crear la reserva: las mesas gratuitas quedan a `0`,
y las mesas de pago aplican la primera hora gratis para socios activos y despues `1.25` euros por
asiento y hora facturable. La tabla principal muestra ese precio guardado y usa `GET /reservas`,
por lo que esta pestana queda restringida al rol `ADMIN` igual que el resto del panel interno.

---

## 8. Textos configurables de la web

La vista de administracion `#/textos-web` permite gestionar desde la app los textos visibles que la
web carga desde MongoDB. La pantalla consume `GET /web-texts/admin`, agrupa los registros por
`section`, permite filtrar por idioma y buscar por `key`, texto, seccion o tipo.

El formulario de creacion envia:

```json
{
  "key": "home.hero.subtitle",
  "value": "Texto visible en la web",
  "section": "home.hero",
  "type": "textarea",
  "locale": "es"
}
```

La edicion usa `PATCH /web-texts/:id`. Las keys y el locale quedan bloqueados durante la edicion
para evitar duplicados contra el indice unico `{ key, locale }`; si hace falta otro idioma, se crea
un nuevo registro con la misma key y distinto `locale`.

---

## 9. Solicitudes de membresia

La vista de administracion `#/membresias` muestra las solicitudes enviadas desde el formulario
publico de membresia de la web. La pantalla consume `GET /membership/requests`, endpoint protegido
para administracion, y normaliza respuestas en array directo o paginadas mediante `items`/`data`.

Cada solicitud muestra nombre, email, telefono, fecha de nacimiento, origen opcional, estado y fecha
de recepcion. La pantalla es de solo lectura: no modifica estados porque el endpoint de actualizacion
no forma parte del contrato documentado de la API.

---

## 10. Cartas coleccionables

La vista de administracion `#/cartas` agrupa el sistema de cartas coleccionables de la web. Consume
endpoints protegidos para administracion y reutiliza el `apiClient`, por lo que el token
`cripta_token` se envia como `Authorization: Bearer <token>` y los 401 fuerzan salida al login.

La pantalla incluye resumen de `GET /admin/dashboard`, gestion de colecciones con subida de imagen,
gestion de cartas con filtros por rareza y coleccion, estadisticas ordenables desde
`GET /admin/cards/stats` y formulario de configuracion de sobres contra `GET/PATCH /admin/pack-config`.
Las imagenes se leen en el renderer mediante `FileReader` como Data URL antes de enviarse a los
endpoints `/cards/:id/image` y `/collections/:id/image`.
