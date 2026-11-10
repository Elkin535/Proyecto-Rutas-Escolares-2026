using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class ConductorCreateDTO
    {
        [Range(1, int.MaxValue, ErrorMessage = "Debes indicar el usuario del conductor.")]
        public int IdUsuario { get; set; }

        public int? IdVehiculo { get; set; }

        [Required(ErrorMessage = "El número de licencia es obligatorio.")]
        [StringLength(50, ErrorMessage = "El número de licencia no puede superar los 50 caracteres.")]
        public string NumeroLicencia { get; set; } = string.Empty;

        [StringLength(10, ErrorMessage = "La categoría de licencia no puede superar los 10 caracteres.")]
        public string? CategoriaLicencia { get; set; }
    }
}
