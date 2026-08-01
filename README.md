# GreenCode — Red Profesional para Desarrolladores

Aplicación web construida con **Angular 19** (standalone components, signals, lazy loading) que funciona como una red profesional tipo LinkedIn exclusiva para desarrolladores de software.

## Características

- **Feed**: Publicaciones, comentarios, likes, compartir y guardar
- **Perfil**: Experiencia, educación, habilidades, analíticas, edición en tiempo real
- **Empleos**: Búsqueda con filtros (remoto, postulación fácil, guardados)
- **Mensajería**: Conversaciones en tiempo real con respuestas automáticas
- **Mi Red**: Invitaciones, conexiones, sugerencias
- **Notificaciones**: Sistema completo con contador de no leídas
- **Autenticación**: LinkedIn OIDC + modo demo
- **Tema**: Verde con modo oscuro forzado, CSS variables
- **APIs reales**: randomuser.me, Picsum Photos, DiceBear

## Estructura del Proyecto

```
src/app/
├── app.component.ts          # Componente raíz
├── app.config.ts             # Configuración de la app (providers)
├── app.routes.ts             # Rutas con lazy loading
├── guards/
│   └── auth.guard.ts         # Guard de autenticación
├── models.ts                 # Interfaces TypeScript
├── pages/
│   ├── login/                # Pantalla de inicio de sesión
│   ├── auth-callback/        # Callback OAuth de LinkedIn
│   ├── layout/               # Layout principal con navbar
│   ├── feed/                 # Feed de publicaciones
│   ├── profile/              # Perfil de usuario
│   ├── network/              # Red de conexiones
│   ├── jobs/                 # Bolsa de empleo
│   ├── messaging/            # Mensajería
│   └── notifications/        # Notificaciones
└── services/
    ├── auth.service.ts       # Autenticación LinkedIn + demo
    ├── data.service.ts       # Estado global con signals
    └── real-api.service.ts   # Integración con APIs reales
```

## Servidor de desarrollo

```bash
ng serve
```

Navega a `http://localhost:4200/`.

## Build

```bash
ng build --configuration production
```

Los artefactos se guardan en `dist/`.

## Despliegue

El proyecto se despliega automáticamente a GitHub Pages mediante GitHub Actions al hacer push a `main`.

URL: https://atellodev.github.io/greencode/

## Tecnologías

- Angular 19.2 (standalone components, signals, control flow)
- TypeScript 5.6
- RxJS 7.8
- GitHub Actions (CI/CD)
- GitHub Pages (hosting)
