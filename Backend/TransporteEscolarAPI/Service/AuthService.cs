using System;

namespace TransporteEscolarAPI.Service
{
    public class AuthService : IAuthService
    {
        /// <summary>
        /// Hashea una contraseña usando BCrypt con Work Factor 12.
        /// </summary>
        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
        }

        /// <summary>
        /// Verifica si la contraseña en texto plano coincide con el hash almacenado.
        /// </summary>
        public bool VerifyPassword(string password, string hash)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, hash);
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Comprueba si la cadena almacenada tiene el prefijo de un hash BCrypt ($2a$, $2b$, o $2y$).
        /// </summary>
        public bool IsPasswordHashed(string storedPassword)
        {
            if (string.IsNullOrEmpty(storedPassword)) return false;

            return storedPassword.StartsWith("$2a$") ||
                   storedPassword.StartsWith("$2b$") ||
                   storedPassword.StartsWith("$2y$");
        }
    }
}
