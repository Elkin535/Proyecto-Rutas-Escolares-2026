
# Base de Datos

### **Motor:**

* PostgreSQL

# **Credenciales:**

**Host:**  localhost
**Port:** 5432

**Database:**
* semi1_schooltrack_prod

**User:**
* semi1_schooltrack

**Password:**
* $eminario$c00lTrack

**Cadena actual:**

{
  "ConnectionStrings": {
    "PostgreSQLConnection": "Host=localhost;Port=5432;Database=semi1_schooltrack_prod;Username=semi1_schooltrack;Password=$eminario$c00lTrack"
  }
}

# Entity Framework

###  **DbContext:**

**AppDbContext**

### **Tablas configuradas:**

DbSet<Rol> \
DbSet<Usuario> \
DbSet<Acudiente> \
DbSet<Conductor> \
DbSet<Estudiante> \
DbSet<Vehiculo> \
DbSet<Historial> \

## **Modelos:**

* Actualmente tenemos:

Rol\
Usuario\
Acudiente\
Conductor\
Estudiante\
Vehiculo\
Historial\

Patrón Arquitectónico

Actualmente se usas:

Controller\
↓\
Repository\
↓\
DbContext\
↓\
PostgreSQL\
