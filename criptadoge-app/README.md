# La Cripta del Doge

Aplicacion de escritorio Electron + React para la gestion interna de La Cripta del Doge.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## Generar el instalador de Windows

Antes de compilar, revisa `.env.production`:

```env
VITE_API_URL=http://localhost:8080/api
```

Ese valor sirve para el entorno local con el backend detras de Nginx. Para distribuir la app a otros equipos, cambia `VITE_API_URL` por la URL publica del servidor y, si es un dominio distinto, anadelo al `connect-src` de `src/renderer/index.html`.

Pasos habituales:

```bash
npm install
npm run build:win
```

`npm run build:win` ejecuta el typecheck, genera `out/` con `electron-vite` y empaqueta la aplicacion con `electron-builder`.

El instalador queda en:

```text
dist/la-cripta-del-doge-1.0.0-setup.exe
```

Si se cambia `version` en `package.json`, el nombre del instalador cambia con esa version.
