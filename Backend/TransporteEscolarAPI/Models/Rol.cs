using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TransporteEscolarAPI.Models
{
    [Table("rol")] // Asegúrate de que coincida con el nombre exacto en Postgres
    public class Rol
    {
        [Key]
        [Column("id_rol")]
        public int IdRol { get; set; }

        [Column("nombre_rol")]
        [Required]
        [StringLength(50)]
        public string NombreRol { get; set; } = string.Empty;
    }
}