using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TransporteEscolarAPI.Models
{
    [Table("parada")]
    public class Parada
    {
        [Key]
        [Column("id_parada")]
        public int IdParada { get; set; }

        [Column("id_ruta")]
        [Required]
        public int IdRuta { get; set; }

        [Column("nombre_parada")]
        [Required]
        [StringLength(150)]
        public string NombreParada { get; set; } = string.Empty;

        [Column("latitud")]
        public decimal Latitud { get; set; }

        [Column("longitud")]
        public decimal Longitud { get; set; }

        [Column("orden_visita")]
        [Required]
        public int OrdenVisita { get; set; }
    }
}
