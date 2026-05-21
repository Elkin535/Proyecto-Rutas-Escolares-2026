using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class ConductorCreateDTO
    {
        [Required]
        public int IdUsuario { get; set; }

        public int? IdVehiculo { get; set; }

        [Required]
        [StringLength(50)]
        public string NumeroLicencia { get; set; } = string.Empty;

        [StringLength(10)]
        public string? CategoriaLicencia { get; set; }
    }
}