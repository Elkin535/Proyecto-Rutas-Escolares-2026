using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TransporteEscolarAPI.Models
{
    [Table("estudiante")]
    public class Estudiante
    {
        [Key]
        [Column("id_estudiante")]
        public int IdEstudiante { get; set; }

        [Column("id_acudiente")]
        [Required]
        public int IdAcudiente { get; set; }

        [Column("nombre")]
        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Column("apellido")]
        [Required]
        [StringLength(100)]
        public string Apellido { get; set; } = string.Empty;

        [Column("colegio")]
        [StringLength(100)]
        public string? Colegio { get; set; }

        [Column("curso_grado")]
        [StringLength(50)]
        public string? CursoGrado { get; set; }

        [Column("estado")]
        public bool Estado { get; set; } = true;

        [Column("id_ruta")]
        public int? IdRuta { get; set; }

        [Column("id_parada")]
        public int? IdParada { get; set; }
    }
}