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

        // Este método sirve para configurar reglas avanzadas (mapeos, llaves compuestas, etc.)
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Nota: Como en tus modelos ya usamos los atributos [Table] y [Column], 
            // no es estrictamente necesario escribir código Fluent API aquí para los nombres,
            // pero si necesitas definir relaciones complejas en el futuro, se hace en este método.
        }
    }
}