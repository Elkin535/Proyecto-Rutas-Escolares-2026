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
    }
}
