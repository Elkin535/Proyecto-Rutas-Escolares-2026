using System;
using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class VehiculoCreateDTO
    {
        [Required(ErrorMessage = "La placa es obligatoria.")]
        [StringLength(15, MinimumLength = 5, ErrorMessage = "La placa debe tener entre 5 y 15 caracteres.")]
        public string Placa { get; set; } = string.Empty;

        [StringLength(50, ErrorMessage = "El modelo no puede superar los 50 caracteres.")]
        public string? Modelo { get; set; }

        [Range(1, 100, ErrorMessage = "La capacidad de pasajeros debe estar entre 1 y 100.")]
        public int CapacidadPasajeros { get; set; }

        public DateTime? SoatVencimiento { get; set; }

        public DateTime? TecnomecanicaVencimiento { get; set; }
    }
}
