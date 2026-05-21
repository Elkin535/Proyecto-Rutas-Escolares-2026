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
    public class RolController : ControllerBase
    {
        private readonly IRolRepository _rolRepository;

        public RolController(IRolRepository rolRepository)
        {
            _rolRepository = rolRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RolDTO>>> GetRoles()
        {
            var roles = await _rolRepository.ObtenerTodosAsync();
            var rolesDTO = roles.Select(r => new RolDTO
            {
                IdRol = r.IdRol,
                NombreRol = r.NombreRol
            });

            return Ok(rolesDTO);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RolDTO>> GetRol(int id)
        {
            var rol = await _rolRepository.ObtenerPorIdAsync(id);
            if (rol == null) return NotFound(new { mensaje = "Rol no encontrado" });

            var rolDTO = new RolDTO
            {
                IdRol = rol.IdRol,
                NombreRol = rol.NombreRol
            };

            return Ok(rolDTO);
        }

        [HttpPost]
        public async Task<ActionResult<RolDTO>> PostRol(RolCreateDTO rolCreateDTO)
        {
            var rol = new Rol
            {
                NombreRol = rolCreateDTO.NombreRol
            };

            var nuevoRol = await _rolRepository.CrearAsync(rol);

            var rolDTO = new RolDTO
            {
                IdRol = nuevoRol.IdRol,
                NombreRol = nuevoRol.NombreRol
            };

            return CreatedAtAction(nameof(GetRol), new { id = rolDTO.IdRol }, rolDTO);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRol(int id)
        {
            var eliminado = await _rolRepository.EliminarAsync(id);
            if (!eliminado) return NotFound(new { mensaje = "Rol no encontrado o no se pudo eliminar" });

            return Ok(new { mensaje = "Rol eliminado con éxito" });
        }
    }
}