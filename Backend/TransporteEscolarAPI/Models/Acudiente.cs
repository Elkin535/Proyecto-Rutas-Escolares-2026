using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TransporteEscolarAPI.Models
{
    [Table("acudiente")]
    public class Acudiente
    {
        [Key]
        [Column("id_acudiente")]
        public int IdAcudiente { get; set; }

        [Column("id_usuario")]
        [Required]
        public int IdUsuario { get; set; }

        [Column("direccion_residencia")]
        [StringLength(200)]
        public string? DireccionResidencia { get; set; }
    }
}