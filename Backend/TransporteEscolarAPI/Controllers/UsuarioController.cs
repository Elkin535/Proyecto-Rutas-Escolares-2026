using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

        public UsuarioController(IUsuarioRepository usuarioRepository, IRolRepository rolRepository, IAuthService authService)
        {
            _usuarioRepository = usuarioRepository;
            _rolRepository = rolRepository;
            _authService = authService;
        }

        [HttpGet]
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

        [HttpGet("{id}")]
        public async Task<ActionResult<UsuarioDTO>> GetUsuario(int id)
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

        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<UsuarioDTO>> PostUsuario(UsuarioCreateDTO usuarioCreateDTO)
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

            var token = _authService.GenerateJwtToken(usuario, nombreRol);

            var response = new LoginResponseDTO
            {
                IdUsuario = usuario.IdUsuario,
                IdRol = usuario.IdRol,
                Nombre = usuario.Nombre,
                Apellido = usuario.Apellido,
                Correo = usuario.Correo,
                NombreRol = nombreRol,
                Token = token
            };

            return Ok(response);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<UsuarioDTO>> PutUsuario(int id, UsuarioUpdateDTO usuarioUpdateDTO)
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

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            var eliminado = await _usuarioRepository.EliminarAsync(id);
            if (!eliminado) return NotFound(new { mensaje = "Usuario no encontrado" });

            return Ok(new { mensaje = "Usuario eliminado con éxito" });
        }
    }
}