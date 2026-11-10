using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class UsuarioUpdateDTO
    {
        [Required(ErrorMessage = "El nombre es obligatorio.")]
        [StringLength(100, ErrorMessage = "El nombre no puede superar los 100 caracteres.")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "El apellido es obligatorio.")]
        [StringLength(150, ErrorMessage = "El apellido no puede superar los 150 caracteres.")]
        public string Apellido { get; set; } = string.Empty;

        [Required(ErrorMessage = "El correo es obligatorio.")]
        [StringLength(150, ErrorMessage = "El correo no puede superar los 150 caracteres.")]
        [EmailAddress(ErrorMessage = "El correo no tiene un formato válido.")]
        public string Correo { get; set; } = string.Empty;

        // Opcional: si viene vacía se conserva la contraseña actual
        [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener entre 6 y 100 caracteres.")]
        public string? Contrasena { get; set; }

        [RegularExpression(@"^\+?[0-9\s\-]{7,15}$", ErrorMessage = "El teléfono debe tener entre 7 y 15 dígitos.")]
        public string? Telefono { get; set; }
    }
}
