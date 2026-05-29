using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TransporteEscolarAPI.Models
{
    [Table("usuario")]
    public class Usuario
    {
        [Key]
        [Column("id_usuario")]
        public int IdUsuario { get; set; }

        [Column("id_rol")]
        public int IdRol { get; set; }

        [Column("nombre")]
        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Column("apellido")]
        [Required]
        [StringLength(150)]
        public string Apellido { get; set; } = string.Empty;

        [Column("correo")]
        [Required]
        [StringLength(150)]
        public string Correo { get; set; } = string.Empty;
        
        [Column("contrasena")]
        [Required]
        [StringLength(255)]
        public string Contrasena { get; set; } = string.Empty;

        [Column("telefono")]
        [StringLength(100)]
        public string? Telefono { get; set; }

        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    }
}
