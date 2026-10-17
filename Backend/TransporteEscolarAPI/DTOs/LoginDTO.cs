using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class LoginRequestDTO
    {
        [Required]
        [EmailAddress]
        public string Correo { get; set; } = string.Empty;

        [Required]
        public string Contrasena { get; set; } = string.Empty;

        /// <summary>
        /// "Guardar inicio de sesión": si es true el token dura más días (JwtSettings:RememberMeDays).
        /// </summary>
        public bool RecordarSesion { get; set; } = false;
    }

    public class LoginResponseDTO
    {
        public int IdUsuario { get; set; }
        public int IdRol { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string NombreRol { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public bool RecordarSesion { get; set; }
        public DateTime ExpiraEn { get; set; }
    }
}
