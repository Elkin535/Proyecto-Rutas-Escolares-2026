# Deploy Frontend

---

## Workflow de Despliegue

**Archivo de configuración:**

```text
.github/workflows/primero.yml
```

---

## Flujo de Ejecución

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

## Descripción del Proceso

| Etapa | Descripción |
|--------|-------------|
| Checkout | Descarga el código fuente del repositorio. |
| Node.js 24.16.0 | Configura el entorno de ejecución con la versión especificada de Node.js. |
| npm install | Instala todas las dependencias del proyecto. |
| npm run build | Genera la versión de producción de la aplicación. |
| rsync dist/ | Sincroniza los archivos compilados con el servidor de destino. |
| Servidor | Recibe y publica la nueva versión del frontend. |

---

## Resumen Técnico

| Configuración | Valor |
|--------------|--------|
| Workflow | `primero.yml` |
| Ubicación | `.github/workflows/` |
| Runtime | Node.js 24.16.0 |
| Gestor de paquetes | npm |
| Comando de compilación | `npm run build` |
| Directorio generado | `dist/` |
| Método de despliegue | `rsync` |

---

## Diagrama de Despliegue

```text
GitHub Repository
        │
        ▼
GitHub Actions
        │
        ▼
Instalación de Dependencias
        │
        ▼
Compilación (Build)
        │
        ▼
Generación de dist/
        │
        ▼
Transferencia con rsync
        │
        ▼
Servidor de Producción
```
