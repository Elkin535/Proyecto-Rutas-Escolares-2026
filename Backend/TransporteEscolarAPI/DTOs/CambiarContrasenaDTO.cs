using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class CambiarContrasenaDTO
    {
        [Required]
        public string ContrasenaActual { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "La nueva contraseña debe tener al menos 8 caracteres.")]
        public string ContrasenaNueva { get; set; } = string.Empty;
    }
}
