using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Service
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;

        public AuthService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
        }

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

        public bool IsPasswordHashed(string storedPassword)
        {
            if (string.IsNullOrEmpty(storedPassword)) return false;

            return storedPassword.StartsWith("$2a$") ||
                   storedPassword.StartsWith("$2b$") ||
                   storedPassword.StartsWith("$2y$");
        }

        public string GenerateJwtToken(Usuario usuario, string roleName)
        {
            var jwtKey = _configuration["JwtSettings:Key"] 
                ?? throw new InvalidOperationException("Clave JWT no configurada en appsettings.json");
            var issuer = _configuration["JwtSettings:Issuer"] ?? "SchoolTrackAPI";
            var audience = _configuration["JwtSettings:Audience"] ?? "SchoolTrackWeb";
            var expirationHours = int.Parse(_configuration["JwtSettings:ExpirationHours"] ?? "8");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
                new Claim(ClaimTypes.Email, usuario.Correo),
                new Claim(ClaimTypes.Name, $"{usuario.Nombre} {usuario.Apellido}"),
                new Claim(ClaimTypes.Role, roleName),
                new Claim("idRol", usuario.IdRol.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expirationHours),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
