using System;
using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class VehiculoCreateDTO
    {
        [Required]
        [StringLength(15)]
        public string Placa { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Modelo { get; set; }

        [Required]
        public int CapacidadPasajeros { get; set; }

        public DateTime? SoatVencimiento { get; set; }
        public DateTime? TecnomecanicaVencimiento { get; set; }
    }
}