using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TransporteEscolarAPI.Models
{
    [Table("ruta")]
    public class Ruta
    {
        [Key]
        [Column("id_ruta")]
        public int IdRuta { get; set; }

        [Column("nombre_ruta")]
        [Required]
        [StringLength(100)]
        public string NombreRuta { get; set; } = string.Empty;

        [Column("descripcion")]
        [StringLength(250)]
        public string? Descripcion { get; set; }

        [Column("estado")]
        public bool Estado { get; set; } = true;
    }
}
