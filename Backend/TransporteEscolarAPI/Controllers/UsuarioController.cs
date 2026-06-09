using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolarAPI.DTOs;
using TransporteEscolarAPI.Interfaces;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuarioController : ControllerBase
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IRolRepository _rolRepository;

        public UsuarioController(IUsuarioRepository usuarioRepository, IRolRepository rolRepository)
        {
            _usuarioRepository = usuarioRepository;
            _rolRepository = rolRepository;
        }

        [HttpGet]
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
        public async Task<ActionResult<UsuarioDTO>> PostUsuario(UsuarioCreateDTO usuarioCreateDTO)
        {
            var usuario = new Usuario
            {
                IdRol = usuarioCreateDTO.IdRol,
                Nombre = usuarioCreateDTO.Nombre,
                Apellido = usuarioCreateDTO.Apellido,
                Correo = usuarioCreateDTO.Correo,
                Contrasena = usuarioCreateDTO.Contrasena, // Nota: Idealmente aplicar Hash aquí en el futuro
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
        public async Task<ActionResult<LoginResponseDTO>> Login(LoginRequestDTO loginRequest)
        {
            var usuario = await _usuarioRepository.ObtenerPorCorreoAsync(loginRequest.Correo);
            if (usuario == null || usuario.Contrasena != loginRequest.Contrasena)
            {
                return Unauthorized(new { mensaje = "Correo o contraseña incorrectos" });
            }

            var rol = await _rolRepository.ObtenerPorIdAsync(usuario.IdRol);
            var nombreRol = rol?.NombreRol ?? "Usuario";

            var response = new LoginResponseDTO
            {
                IdUsuario = usuario.IdUsuario,
                IdRol = usuario.IdRol,
                Nombre = usuario.Nombre,
                Apellido = usuario.Apellido,
                Correo = usuario.Correo,
                NombreRol = nombreRol
            };

            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            var eliminado = await _usuarioRepository.EliminarAsync(id);
            if (!eliminado) return NotFound(new { mensaje = "Usuario no encontrado" });

            return Ok(new { mensaje = "Usuario eliminado con éxito" });
        }
    }
}