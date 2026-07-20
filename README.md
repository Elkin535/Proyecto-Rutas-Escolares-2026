
<div align="center">

# 📍 SchoolTrack 📍

### Fullstack | Proyecto Educativo | API REST + Interfaz Web

Plataforma web integral desarrollada con **React**, **Vite**, **ASP.NET Core** y **PostgreSQL** para la gestión logística del transporte escolar. Permite seguimiento GPS en tiempo real, administración de conductores, gestión de estudiantes, control de rutas y monitoreo de horarios para mejorar la seguridad y eficiencia del servicio.

---

![Estado](https://img.shields.io/badge/STATUS-En%20Desarrollo-00ffcc?style=for-the-badge&logo=github)
![Licencia](https://img.shields.io/badge/Licencia-MIT-8a2be2?style=for-the-badge)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![ASP.NET](https://img.shields.io/badge/.NET_10-512BD4?style=for-the-badge&logo=dotnet)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)

[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

</div>

---

# 📑 Contenido

- 🎯 Visión
- 🎯 Objetivos
- 🚨 Problema que Resuelve
- 👥 Usuarios del Sistema
- ⚙️ Funcionalidades Principales
- 🌐 URLs del Proyecto
- 🏗️ Arquitectura General
- 🔧 Backend
- 🗄️ Base de Datos
- 💻 Frontend
- 🚀 CI/CD y Deploy
- 📋 Scrum
- 👥 Equipo
- 📄 Licencia

---

# 🎯 Visión

El proyecto consiste en el desarrollo de una plataforma web y móvil de alta escalabilidad diseñada para optimizar la seguridad y la gestión del transporte escolar. El sistema conecta en tiempo real a acudientes, conductores e instituciones educativas mediante herramientas de monitoreo y comunicación.

---

# 🎯 Objetivos

## Objetivo General

Diseñar e implementar una aplicación que permita realizar seguimiento en tiempo real a los vehículos escolares, garantizando la seguridad de los estudiantes y optimizando la gestión del transporte.

## Objetivos Específicos

- Permitir el seguimiento GPS en tiempo real.
- Mejorar la comunicación entre acudientes y conductores.
- Registrar eventos e incidencias del transporte.
- Centralizar la información de estudiantes, conductores y vehículos.
- Optimizar la gestión de rutas escolares.

---

# 🚨 Problema que Resuelve

Actualmente los padres de familia tienen poca visibilidad sobre el trayecto diario de sus hijos, generando incertidumbre respecto a horarios, ubicación y seguridad.

Adicionalmente, los colegios y transportadores carecen de herramientas centralizadas para registrar novedades y monitorear rutas en tiempo real.

SchoolTrack busca solucionar estos problemas mediante una plataforma unificada, accesible y segura.

---

# 👥 Usuarios del Sistema

- 👨‍👩‍👧 Acudientes
- 🚌 Conductores
- 🏫 Instituciones Educativas
- 👨‍💼 Administradores

---

# ⚙️ Funcionalidades Principales

- Seguimiento GPS en tiempo real.
- Gestión de estudiantes.
- Gestión de conductores.
- Gestión de vehículos.
- Administración de rutas.
- Registro de eventos e incidencias.
- Panel administrativo.
- Autenticación y control de acceso por roles.

---
# 🏁 Resultado Esperado

Al finalizar los cuatro Sprints el sistema permitirá:

- ✅ Administración completa de usuarios y rutas.
- ✅ Seguimiento GPS en tiempo real.
- ✅ Monitoreo simultáneo de múltiples vehículos.
- ✅ Registro digital de abordaje y entrega.
- ✅ Notificaciones automáticas a los acudientes.
- ✅ Dashboard administrativo con reportes históricos.
- ✅ Plataforma segura mediante autenticación 



# 🌐 URLs del Proyecto

| Servicio | URL |
|-----------|-----|
| Frontend | https://schooltrack.seminario1.eleueleo.com |
| Backend API | https://schooltrack.seminario1.eleueleo.com/api |

## Estado Actual

```text
502 Bad Gateway
````

---

# 🏗️ Arquitectura General

```text
Frontend (React + Vite)
          │
          ▼
 ASP.NET Core REST API
          │
          ▼
 Entity Framework Core
          │
          ▼
      PostgreSQL
```

---

# 🔧 Backend

## Tecnologías

| Tecnología            | Uso            |
| --------------------- | -------------- |
| ASP.NET Core 10       | API REST       |
| Entity Framework Core | ORM            |
| PostgreSQL            | Persistencia   |
| Repository Pattern    | Acceso a datos |
| GitHub Actions        | CI/CD          |

## Target Framework

```xml
<TargetFramework>net10.0</TargetFramework>
```

---

# 🗄️ Base de Datos

## Motor de Base de Datos

| Configuración | Valor                  |
| ------------- | ---------------------- |
| Motor         | PostgreSQL             |
| Host          | localhost              |
| Puerto        | 5432                   |
| Base de Datos | semi1_schooltrack_prod |

## Entidades

```text
Rol
Usuario
Acudiente
Conductor
Estudiante
Vehiculo
Historial
```

## DbContext

```csharp
AppDbContext
```

## Tablas Configuradas

```csharp
DbSet<Rol>
DbSet<Usuario>
DbSet<Acudiente>
DbSet<Conductor>
DbSet<Estudiante>
DbSet<Vehiculo>
DbSet<Historial>
```

---

# 💻 Frontend

## Ubicación

```text
Frontend/transporte-escolar-web
```

## Tecnologías

* React
* Vite
* HTML
* CSS
* JavaScript

## Estado Actual

### Completado

* ✅ Home
* ✅ Login
* ✅ Deploy automático funcionando

### Pendiente

* ⏳ Consumo de API
* ⏳ Integración con PostgreSQL

## URL Pública

https://schooltrack.seminario1.eleueleo.com

---

# 🚀 CI/CD y Deploy

## Frontend

### Workflow

```text
.github/workflows/primero.yml
```

### Flujo

```text
Checkout
    ↓
Node.js 24.16.0
    ↓
npm install
    ↓
npm run build
    ↓
rsync dist/
    ↓
Servidor
```

---

## Backend

### Workflow

```text
.github/workflows/deploy-backend.yml
```

### Flujo

```text
Checkout
    ↓
.NET 10
    ↓
dotnet restore
    ↓
dotnet publish
    ↓
publish/
    ↓
rsync
    ↓
/home/schooltrack/backend/
    ↓
sudo systemctl restart schooltrack
```

---

# 📋 Scrum

## Herramienta Utilizada

Trello

https://trello.com/invite/b/69be1364f3228e2addf4032d/ATTIb2742128c14ad31a945f30b16f52bafa0CDEEB0E/seminarioproyecto

---

# 🔒 Estado del Proyecto

```text
🟡 Próximo a desarrollar
```

---

# 👥 Equipo de Trabajo

| Rol                | Integrante             |
| ------------------ | -----------------------|
| Scrum Master       | Daniella Rodriguez     |
| Frontend Developer | Luisa                  |
| Frontend Developer | Karol Caicedo          |
| Backend Developer  | Christian Tellez       |
| Backend Developer  | Elkin  Andres Chalarka |
| Base de Datos      | Christian Tellez       |

---

# 📄 Licencia

Este proyecto es de uso académico y puede ser modificado para fines educativos.

```
```



