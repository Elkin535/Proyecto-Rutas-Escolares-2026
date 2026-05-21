using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TransporteEscolarAPI.Models
{
    [Table("conductor")]
    public class Conductor
    {
        [Key]
        [Column("id_conductor")]
        public int IdConductor { get; set; }

        [Column("id_usuario")]
        [Required]
        public int IdUsuario { get; set; }

        [Column("id_vehiculo")]
        public int? IdVehiculo { get; set; } // int? permite valores NULL en la base de datos

        [Column("numero_licencia")]
        [Required]
        [StringLength(50)]
        public string NumeroLicencia { get; set; } = string.Empty;

        [Column("categoria_licencia")]
        [StringLength(10)]
        public string? CategoriaLicencia { get; set; }
    }
}