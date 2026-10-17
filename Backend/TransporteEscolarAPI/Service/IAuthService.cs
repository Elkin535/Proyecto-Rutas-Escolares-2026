using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Service
{
    public interface IAuthService
    {
        /// <summary>
        /// Genera un hash BCrypt de la contraseña proporcionada (Work Factor 12).
        /// </summary>
        string HashPassword(string password);

        /// <summary>
        /// Verifica si una contraseña en texto plano coincide con un hash BCrypt.
        /// </summary>
        bool VerifyPassword(string password, string hash);

        /// <summary>
        /// Determina si una cadena dada ya representa un hash BCrypt válido.
        /// </summary>
        bool IsPasswordHashed(string storedPassword);

        /// <summary>
        /// Genera un Token JWT firmado conteniendo los claims del usuario (ID, Correo, Nombre, Rol).
        /// Si recordarSesion es true, la expiración usa JwtSettings:RememberMeDays en lugar de ExpirationHours.
        /// </summary>
        string GenerateJwtToken(Usuario usuario, string roleName, bool recordarSesion, out DateTime expiraEn);

        /// <summary>
        /// Sobrecarga de compatibilidad: token de duración normal.
        /// </summary>
        string GenerateJwtToken(Usuario usuario, string roleName);
    }
}
