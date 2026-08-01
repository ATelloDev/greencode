<div align="center">

# GreenCode

### Red Profesional para Desarrolladores de Software

Construida con **Angular 19** - Standalone Components - Signals - Lazy Loading

[![Deploy](https://github.com/ATelloDev/greencode/actions/workflows/deploy.yml/badge.svg)](https://github.com/ATelloDev/greencode/actions)
![Angular](https://img.shields.io/badge/Angular-19.2-16a34a?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-16a34a)

**[Ver aplicacion en vivo](https://atellodev.github.io/greencode/)**

</div>

---

## Descripcion

**GreenCode** es una aplicacion web tipo red profesional (estilo LinkedIn) diseñada exclusivamente para desarrolladores de software. Permite a los devs crear su perfil profesional, publicar contenido tecnico, conectar con otros desarrolladores, buscar empleo, enviar mensajes privados y recibir notificaciones.

El proyecto utiliza las ultimas caracteristicas de Angular 19: **standalone components** (sin NgModules), **signals** para gestion de estado reactiva, **lazy loading** con `loadComponent()`, y el nuevo **control flow** nativo (`@if`, `@for`).

---

## Caracteristicas

| Modulo | Descripcion |
|--------|-------------|
| **Feed** | Publicaciones, comentarios, likes, compartir y guardar posts |
| **Perfil** | Experiencia, educacion, habilidades con endorsements, analiticas con grafico semanal |
| **Empleos** | Busqueda reactiva con filtros: remoto, postulacion facil, aplicados, guardados |
| **Mensajeria** | Conversaciones en tiempo real con respuestas automaticas simuladas |
| **Mi Red** | Invitaciones pendientes, conexiones activas, sugerencias de personas |
| **Notificaciones** | Sistema completo con contador de no leidas y marca individual |
| **Autenticacion** | LinkedIn OIDC (OAuth 2.0 + PKCE) y modo demo para desarrollo |
| **Tema** | Verde con modo oscuro forzado, CSS variables, diseño responsive |

---

## Tecnologias

- **Angular 19.2** — Standalone components, signals, control flow nativo
- **TypeScript 5.7** — Tipado estricto en toda la aplicacion
- **RxJS 7.8** — Usado con `firstValueFrom` para peticiones HTTP
- **CSS Personalizado** — Variables CSS, Grid, Flexbox, responsive design
- **GitHub Actions** — CI/CD automatico a GitHub Pages
- **Inter Font** — Tipografia desde Google Fonts

---

## Estructura del Proyecto

```
src/app/
├── app.component.ts              # Componente raiz
├── app.config.ts                 # Providers (router, http, zone)
├── app.routes.ts                 # Rutas con lazy loading
├── guards/
│   └── auth.guard.ts             # Guard de autenticacion (CanActivateFn)
├── models.ts                     # Interfaces TypeScript
├── pages/
│   ├── login/                    # Pantalla de inicio de sesion
│   ├── auth-callback/            # Callback OAuth de LinkedIn
│   ├── layout/                   # Layout principal con navbar
│   ├── feed/                     # Feed de publicaciones
│   ├── profile/                  # Perfil de usuario editable
│   ├── network/                  # Red de conexiones
│   ├── jobs/                     # Bolsa de empleo
│   ├── messaging/                # Mensajeria privada
│   └── notifications/            # Centro de notificaciones
└── services/
    ├── auth.service.ts           # Autenticacion LinkedIn + demo
    ├── data.service.ts           # Estado global con signals
    └── real-api.service.ts       # Integracion con APIs reales
```

---

## Arquitectura

### Componentes (Standalone)

Cada componente es autonomo y declara sus dependencias en el decorator `@Component`. No hay NgModules. El routing usa `loadComponent()` para cargar cada pagina bajo demanda, reduciendo el bundle inicial a ~83 kB transferidos.

### Estado con Signals

El `DataService` centraliza todo el estado usando `signal()` y `computed()`:

```typescript
readonly posts = signal<Post[]>([]);
readonly profile = signal<UserProfile | null>(null);
readonly analytics = signal<ProfileAnalytics | null>(null);
```

Los componentes consumen el estado reactivamente con `computed()`, sin suscripciones manuales.

### Persistencia

Todos los datos se guardan automaticamente en `localStorage` con keys versionadas (`greencode_*`). Al recargar, el estado se restaura sin perdida de datos.

### Autenticacion

Doble modo:
- **LinkedIn OIDC**: OAuth 2.0 con PKCE usando Web Crypto API
- **Demo**: Usuario "Leonel Espinoza" para desarrollo inmediato

---

## Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/ATelloDev/greencode.git
cd greencode

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

La aplicacion estara disponible en `http://localhost:4200/`.

---

## Scripts Disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm start` | Servidor de desarrollo en `localhost:4200` |
| `npm run build` | Build de produccion en `dist/greencode/` |
| `npm run watch` | Build incremental en modo desarrollo |

---

## Docker

La aplicacion incluye configuracion Docker lista para usar:

```bash
# Construir y ejecutar con docker compose
docker compose up --build

# O construir y ejecutar manualmente
docker build -t greencode .
docker run -p 8080:80 greencode
```

La aplicacion estara disponible en `http://localhost:8080/`.

El `Dockerfile` usa multi-stage build:
1. **Build stage**: Node 20 Alpine instala dependencias y compila Angular
2. **Serve stage**: Nginx Alpine sirve los archivos estaticos con gzip y SPA routing

---

## Despliegue

El despliegue es **automatico** mediante GitHub Actions:

1. Cada push a `main` dispara el workflow
2. `npm ci` instala dependencias
3. `ng build --configuration production` compila la app
4. El artifact se sube a GitHub Pages

**URL de produccion**: [https://atellodev.github.io/greencode/](https://atellodev.github.io/greencode/)

---

## APIs Integradas

| API | Uso | URL |
|-----|-----|-----|
| **randomuser.me** | Perfiles, nombres, fotos y ubicaciones reales | `https://randomuser.me/api/` |
| **Picsum Photos** | Imagenes de portadas y posts | `https://picsum.photos/` |
| **DiceBear** | Avatares fallback generados | `https://api.dicebear.com/7.x/` |
| **LinkedIn OIDC** | Autenticacion con LinkedIn | `https://api.linkedin.com/v2/userinfo` |

El `RealApiService` maneja fallbacks graceful cuando las APIs no responden.

---

## Documentacion

La carpeta `docs/` contiene los documentos PDF del proyecto:

- **`Avance2_GreenCode.pdf`** — Planeacion: componentes, rutas, servicios y conclusiones
- **`EntregaFinal_GreenCode.pdf`** — Resultados finales, estilos, despliegue y experiencia

---

<div align="center">

**GreenCode** © 2026 — Hecho con Angular 19

</div>
