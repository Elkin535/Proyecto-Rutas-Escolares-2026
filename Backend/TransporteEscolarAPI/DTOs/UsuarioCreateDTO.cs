using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class UsuarioCreateDTO
    {
        [Required]
        public int IdRol { get; set; }
        [Required]
        public string Nombre { get; set; } = string.Empty;
        [Required]
        public string Apellido { get; set; } = string.Empty;
        [Required]
        public string Contrasena { get; set; } = string.Empty;
        public string? Telefono { get; set; }
    }
}