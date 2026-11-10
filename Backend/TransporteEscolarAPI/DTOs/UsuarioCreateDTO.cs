using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class UsuarioCreateDTO
    {
        [Range(1, 3, ErrorMessage = "El rol seleccionado no es válido.")]
        public int IdRol { get; set; }

        [Required(ErrorMessage = "El nombre es obligatorio.")]
        [StringLength(100, ErrorMessage = "El nombre no puede superar los 100 caracteres.")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "El apellido es obligatorio.")]
        [StringLength(150, ErrorMessage = "El apellido no puede superar los 150 caracteres.")]
        public string Apellido { get; set; } = string.Empty;

        [Required(ErrorMessage = "El correo es obligatorio.")]
        [EmailAddress(ErrorMessage = "El correo no tiene un formato válido.")]
        [StringLength(150, ErrorMessage = "El correo no puede superar los 150 caracteres.")]
        public string Correo { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contraseña es obligatoria.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener entre 6 y 100 caracteres.")]
        public string Contrasena { get; set; } = string.Empty;

        [RegularExpression(@"^\+?[0-9\s\-]{7,15}$", ErrorMessage = "El teléfono debe tener entre 7 y 15 dígitos.")]
        public string? Telefono { get; set; }
    }
}
