using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class UsuarioUpdateDTO
    {
        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string Apellido { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        [EmailAddress]
        public string Correo { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Contrasena { get; set; }

        [StringLength(100)]
        public string? Telefono { get; set; }
    }
}
