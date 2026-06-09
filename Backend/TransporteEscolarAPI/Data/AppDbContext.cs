using Microsoft.EntityFrameworkCore;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Data
{
    public class AppDbContext : DbContext
    {
        // El constructor recibe la configuración de conexión (la que pusimos en Program.cs)
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Cada DbSet representa una tabla en tu base de datos PostgreSQL
        public DbSet<Rol> Roles { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Acudiente> Acudientes { get; set; }
        public DbSet<Conductor> Conductores { get; set; }
        public DbSet<Estudiante> Estudiantes { get; set; }
        public DbSet<Vehiculo> Vehiculos { get; set; }
        public DbSet<Historial> Historiales { get; set; }
        public DbSet<Ruta> Rutas { get; set; }
        public DbSet<Parada> Paradas { get; set; }
        public DbSet<AsistenciaViaje> AsistenciasViajes { get; set; }

        // Este método sirve para configurar reglas avanzadas (mapeos, llaves compuestas, etc.)
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seeding default roles
            modelBuilder.Entity<Rol>().HasData(
                new Rol { IdRol = 1, NombreRol = "Administrador" },
                new Rol { IdRol = 2, NombreRol = "Conductor" },
                new Rol { IdRol = 3, NombreRol = "Acudiente" }
            );

            // Seeding default users
            modelBuilder.Entity<Usuario>().HasData(
                new Usuario
                {
                    IdUsuario = 1,
                    IdRol = 1, // Administrador
                    Nombre = "Admin",
                    Apellido = "SchoolTrack",
                    Correo = "admin@schooltrack.com",
                    Contrasena = "admin123",
                    Telefono = "123456789",
                    FechaCreacion = new DateTime(2026, 6, 8, 0, 0, 0, DateTimeKind.Utc)
                },
                new Usuario
                {
                    IdUsuario = 2,
                    IdRol = 2, // Conductor
                    Nombre = "Carlos",
                    Apellido = "Driver",
                    Correo = "conductor.carlos@schooltrack.com",
                    Contrasena = "conductor123",
                    Telefono = "987654321",
                    FechaCreacion = new DateTime(2026, 6, 8, 0, 0, 0, DateTimeKind.Utc)
                },
                new Usuario
                {
                    IdUsuario = 3,
                    IdRol = 3, // Acudiente
                    Nombre = "Maria",
                    Apellido = "Parent",
                    Correo = "acudiente.maria@schooltrack.com",
                    Contrasena = "acudiente123",
                    Telefono = "555123456",
                    FechaCreacion = new DateTime(2026, 6, 8, 0, 0, 0, DateTimeKind.Utc)
                }
            );
        }
    }
}