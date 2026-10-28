using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransporteEscolarAPI.Data;
using TransporteEscolarAPI.DTOs;
using TransporteEscolarAPI.Interfaces;
using TransporteEscolarAPI.Models;
using TransporteEscolarAPI.Service;

namespace TransporteEscolarAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsuarioController : ControllerBase
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IRolRepository _rolRepository;
        private readonly IAuthService _authService;
        private readonly AppDbContext _context;

        public UsuarioController(IUsuarioRepository usuarioRepository, IRolRepository rolRepository, IAuthService authService, AppDbContext context)
        {
            _usuarioRepository = usuarioRepository;
            _rolRepository = rolRepository;
            _authService = authService;
            _context = context;
        }

        [HttpGet("dashboard-metricas")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> GetDashboardMetricas()
        {
            var totalRutas = await _context.Rutas.CountAsync();
            var totalConductores = await _context.Conductores.CountAsync();
            var totalVehiculos = await _context.Vehiculos.CountAsync();
            var totalEstudiantes = await _context.Estudiantes.CountAsync();

            return Ok(new
            {
                totalRutas,
                totalConductores,
                totalVehiculos,
                totalEstudiantes
            });
        }

        [HttpGet("obtener-todos")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<IEnumerable<UsuarioDTO>>> GetUsuarios()
        {
            var usuarios = await _usuarioRepository.ObtenerTodosAsync();
            var usuariosDTO = usuarios.Select(u => new UsuarioDTO
            {
                IdUsuario = u.IdUsuario,
                IdRol = u.IdRol,
                Nombre = u.Nombre,
                Apellido = u.Apellido,
                Correo = u.Correo,
                Telefono = u.Telefono,
                FechaCreacion = u.FechaCreacion
            });

            return Ok(usuariosDTO);
        }

        [HttpGet("obtener-por-id")]
        public async Task<ActionResult<UsuarioDTO>> GetUsuario([FromQuery] int id)
        {
            var usuario = await _usuarioRepository.ObtenerPorIdAsync(id);
            if (usuario == null) return NotFound(new { mensaje = "Usuario no encontrado" });

            var usuarioDTO = new UsuarioDTO
            {
                IdUsuario = usuario.IdUsuario,
                IdRol = usuario.IdRol,
                Nombre = usuario.Nombre,
                Apellido = usuario.Apellido,
                Correo = usuario.Correo,
                Telefono = usuario.Telefono,
                FechaCreacion = usuario.FechaCreacion
            };

            return Ok(usuarioDTO);
        }

        [HttpPost("crear")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<UsuarioDTO>> PostUsuario([FromBody] UsuarioCreateDTO usuarioCreateDTO)
        {
            var usuario = new Usuario
            {
                IdRol = usuarioCreateDTO.IdRol,
                Nombre = usuarioCreateDTO.Nombre,
                Apellido = usuarioCreateDTO.Apellido,
                Correo = usuarioCreateDTO.Correo,
                Contrasena = _authService.HashPassword(usuarioCreateDTO.Contrasena),
                Telefono = usuarioCreateDTO.Telefono,
                FechaCreacion = DateTime.UtcNow
            };

            var nuevoUsuario = await _usuarioRepository.CrearAsync(usuario);

            var usuarioDTO = new UsuarioDTO
            {
                IdUsuario = nuevoUsuario.IdUsuario,
                IdRol = nuevoUsuario.IdRol,
                Nombre = nuevoUsuario.Nombre,
                Apellido = nuevoUsuario.Apellido,
                Correo = nuevoUsuario.Correo,
                Telefono = nuevoUsuario.Telefono,
                FechaCreacion = nuevoUsuario.FechaCreacion
            };

            return CreatedAtAction(nameof(GetUsuario), new { id = usuarioDTO.IdUsuario }, usuarioDTO);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<LoginResponseDTO>> Login(LoginRequestDTO loginRequest)
        {
            var usuario = await _usuarioRepository.ObtenerPorCorreoAsync(loginRequest.Correo);
            if (usuario == null)
            {
                return Unauthorized(new { mensaje = "Correo o contraseña incorrectos" });
            }

            bool esValido = false;

            if (_authService.IsPasswordHashed(usuario.Contrasena))
            {
                esValido = _authService.VerifyPassword(loginRequest.Contrasena, usuario.Contrasena);
            }
            else
            {
                // Migración transparente si la contraseña antigua estaba en texto plano
                if (usuario.Contrasena == loginRequest.Contrasena)
                {
                    esValido = true;
                    usuario.Contrasena = _authService.HashPassword(loginRequest.Contrasena);
                    await _usuarioRepository.ActualizarAsync(usuario);
                }
            }

            if (!esValido)
            {
                return Unauthorized(new { mensaje = "Correo o contraseña incorrectos" });
            }

            var rol = await _rolRepository.ObtenerPorIdAsync(usuario.IdRol);
            var nombreRol = rol?.NombreRol ?? "Usuario";

            var token = _authService.GenerateJwtToken(usuario, nombreRol, loginRequest.RecordarSesion, out var expiraEn);

            var response = new LoginResponseDTO
            {
                IdUsuario = usuario.IdUsuario,
                IdRol = usuario.IdRol,
                Nombre = usuario.Nombre,
                Apellido = usuario.Apellido,
                Correo = usuario.Correo,
                NombreRol = nombreRol,
                Token = token,
                RecordarSesion = loginRequest.RecordarSesion,
                ExpiraEn = expiraEn
            };

            return Ok(response);
        }

        /// <summary>
        /// Valida el token guardado en el dispositivo (sesión recordada) y devuelve los datos actuales del usuario.
        /// Si el token expiró o es inválido, el middleware JWT responde 401 automáticamente.
        /// </summary>
        [HttpGet("validar-sesion")]
        public async Task<ActionResult<LoginResponseDTO>> ValidarSesion()
        {
            var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idClaim, out var idUsuario))
            {
                return Unauthorized(new { mensaje = "Sesión inválida" });
            }

            // Si el usuario fue eliminado después de guardar la sesión, se invalida
            var usuario = await _usuarioRepository.ObtenerPorIdAsync(idUsuario);
            if (usuario == null)
            {
                return Unauthorized(new { mensaje = "Sesión inválida" });
            }

            var rol = await _rolRepository.ObtenerPorIdAsync(usuario.IdRol);
            var nombreRol = rol?.NombreRol ?? "Usuario";

            var expClaim = User.FindFirst("exp")?.Value;
            var expiraEn = long.TryParse(expClaim, out var exp)
                ? DateTimeOffset.FromUnixTimeSeconds(exp).UtcDateTime
                : DateTime.UtcNow;

            return Ok(new LoginResponseDTO
            {
                IdUsuario = usuario.IdUsuario,
                IdRol = usuario.IdRol,
                Nombre = usuario.Nombre,
                Apellido = usuario.Apellido,
                Correo = usuario.Correo,
                NombreRol = nombreRol,
                Token = string.Empty, // el cliente conserva el token que ya tiene
                RecordarSesion = User.FindFirst("recordarSesion")?.Value == "true",
                ExpiraEn = expiraEn
            });
        }

        [HttpPut("actualizar")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<UsuarioDTO>> PutUsuario([FromQuery] int id, [FromBody] UsuarioUpdateDTO usuarioUpdateDTO)
        {
            var usuario = await _usuarioRepository.ObtenerPorIdAsync(id);
            if (usuario == null) return NotFound(new { mensaje = "Usuario no encontrado" });

            usuario.Nombre = usuarioUpdateDTO.Nombre;
            usuario.Apellido = usuarioUpdateDTO.Apellido;
            usuario.Correo = usuarioUpdateDTO.Correo;
            if (!string.IsNullOrEmpty(usuarioUpdateDTO.Contrasena))
            {
                usuario.Contrasena = _authService.HashPassword(usuarioUpdateDTO.Contrasena);
            }
            usuario.Telefono = usuarioUpdateDTO.Telefono;

            var actualizado = await _usuarioRepository.ActualizarAsync(usuario);
            if (!actualizado) return StatusCode(500, new { mensaje = "Error al actualizar el usuario" });

            var usuarioDTO = new UsuarioDTO
            {
                IdUsuario = usuario.IdUsuario,
                IdRol = usuario.IdRol,
                Nombre = usuario.Nombre,
                Apellido = usuario.Apellido,
                Correo = usuario.Correo,
                Telefono = usuario.Telefono,
                FechaCreacion = usuario.FechaCreacion
            };

            return Ok(usuarioDTO);
        }

        // Cualquier usuario autenticado cambia SOLO su propia contraseña (el id sale del token, no del cliente)
        [HttpPut("cambiar-contrasena")]
        public async Task<IActionResult> CambiarContrasena([FromBody] CambiarContrasenaDTO dto)
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var idUsuario)) return Unauthorized();

            var usuario = await _usuarioRepository.ObtenerPorIdAsync(idUsuario);
            if (usuario == null) return NotFound(new { mensaje = "Usuario no encontrado" });

            // Misma verificación que el login: admite contraseñas antiguas guardadas sin cifrar
            var actualValida = _authService.IsPasswordHashed(usuario.Contrasena)
                ? _authService.VerifyPassword(dto.ContrasenaActual, usuario.Contrasena)
                : usuario.Contrasena == dto.ContrasenaActual;
            if (!actualValida) return BadRequest(new { mensaje = "La contraseña actual no es correcta." });

            if (dto.ContrasenaNueva == dto.ContrasenaActual)
                return BadRequest(new { mensaje = "La nueva contraseña debe ser distinta de la actual." });

            usuario.Contrasena = _authService.HashPassword(dto.ContrasenaNueva);
            var actualizado = await _usuarioRepository.ActualizarAsync(usuario);
            if (!actualizado) return StatusCode(500, new { mensaje = "No se pudo cambiar la contraseña" });

            return Ok(new { mensaje = "Contraseña actualizada con éxito" });
        }

        [HttpDelete("eliminar")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> DeleteUsuario([FromQuery] int id)
        {
            var eliminado = await _usuarioRepository.EliminarAsync(id);
            if (!eliminado) return NotFound(new { mensaje = "Usuario no encontrado" });

            return Ok(new { mensaje = "Usuario eliminado con éxito" });
        }
    }
}