# Base de Datos

---

## Motor de Base de Datos

| Configuración | Valor |
|--------------|--------|
| Motor | PostgreSQL |
| Host | localhost |
| Puerto | 5432 |
| Base de Datos | semi1_schooltrack_prod |
| Usuario | semi1_schooltrack |
| Password | $eminario$c00lTrack |

---

### Cadena de conexión actual

```json
{
  "ConnectionStrings": {
    "PostgreSQLConnection": "Host=localhost;Port=5432;Database=semi1_schooltrack_prod;Username=semi1_schooltrack;Password=$eminario$c00lTrack"
  }
}
```

---

# Entity Framework

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

# Modelos

Actualmente el sistema cuenta con los siguientes modelos:

```text
Rol
Usuario
Acudiente
Conductor
Estudiante
Vehiculo
Historial
```

---

# Patrón Arquitectónico

El proyecto sigue una arquitectura por capas para separar responsabilidades y facilitar el mantenimiento del código.

```text
Controller
    ↓
Repository
    ↓
DbContext
    ↓
PostgreSQL
```

### Descripción de las capas

| Capa | Responsabilidad |
|--------|--------|
| Controller | Gestiona las solicitudes HTTP y las respuestas de la API |
| Repository | Contiene la lógica de acceso a datos |
| DbContext | Administra las entidades mediante Entity Framework Core |
| PostgreSQL | Almacena la información del sistema |

---

# Resumen General

| Elemento | Implementación |
|-----------|----------------|
| Base de Datos | PostgreSQL |
| ORM | Entity Framework Core |
| DbContext Principal | AppDbContext |
| Arquitectura | Controller → Repository → DbContext → PostgreSQL |
| Entidades | 7 |
