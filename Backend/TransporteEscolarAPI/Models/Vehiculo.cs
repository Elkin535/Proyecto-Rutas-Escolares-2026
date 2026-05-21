using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TransporteEscolarAPI.Models
{
    [Table("vehiculo")]
    public class Vehiculo
    {
        [Key]
        [Column("id_vehiculo")]
        public int IdVehiculo { get; set; }

        [Column("placa")]
        [Required]
        [StringLength(15)]
        public string Placa { get; set; } = string.Empty;

        [Column("modelo")]
        [StringLength(50)]
        public string? Modelo { get; set; }

        [Column("capacidad_pasajeros")]
        [Required]
        public int CapacidadPasajeros { get; set; }

        [Column("soat_vencimiento")]
        public DateTime? SoatVencimiento { get; set; }

        [Column("tecnomecanica_vencimiento")]
        public DateTime? TecnomecanicaVencimiento { get; set; }
    }
}