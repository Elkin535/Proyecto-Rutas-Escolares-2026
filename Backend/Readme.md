# Backend

---

## Configuración del Proyecto

### Target Framework

```xml
<TargetFramework>net10.0</TargetFramework>
```

---

# Deploy Backend

## Workflow

**Archivo de configuración**

```text
.github/workflows/deploy-backend.yml
```

---

## Flujo de Despliegue

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

## Descripción del Proceso

| Etapa | Descripción |
|---------|-------------|
| Checkout | Descarga el código fuente desde el repositorio. |
| .NET 10 | Configura el entorno de ejecución con .NET 10. |
| dotnet restore | Restaura todas las dependencias del proyecto. |
| dotnet publish | Compila y genera la versión lista para producción. |
| publish/ | Directorio donde se almacenan los archivos publicados. |
| rsync | Sincroniza los archivos generados con el servidor. |
| /home/schooltrack/backend/ | Ruta de destino en el servidor de producción. |
| systemctl restart | Reinicia el servicio para aplicar los cambios desplegados. |

---

## Resumen Técnico

| Configuración | Valor |
|--------------|--------|
| Framework | .NET 10 |
| Workflow | `deploy-backend.yml` |
| Ubicación | `.github/workflows/` |
| Comando de restauración | `dotnet restore` |
| Comando de compilación | `dotnet publish` |
| Directorio de salida | `publish/` |
| Método de despliegue | `rsync` |
| Ruta de despliegue | `/home/schooltrack/backend/` |
| Servicio | `schooltrack` |

---

## Arquitectura del Despliegue

```text
GitHub Repository
        │
        ▼
GitHub Actions
        │
        ▼
dotnet restore
        │
        ▼
dotnet publish
        │
        ▼
publish/
        │
        ▼
rsync
        │
        ▼
Servidor Linux
        │
        ▼
/home/schooltrack/backend/
        │
        ▼
sudo systemctl restart schooltrack
```
