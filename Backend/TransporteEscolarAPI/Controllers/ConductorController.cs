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
    public class ConductorController : ControllerBase
    {
        private readonly IConductorRepository _conductorRepository;

        public ConductorController(IConductorRepository conductorRepository)
        {
            _conductorRepository = conductorRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConductorDTO>>> GetConductores()
        {
            var conductores = await _conductorRepository.ObtenerTodosAsync();
            var conductoresDTO = conductores.Select(c => new ConductorDTO
            {
                IdConductor = c.IdConductor,
                IdUsuario = c.IdUsuario,
                IdVehiculo = c.IdVehiculo,
                NumeroLicencia = c.NumeroLicencia,
                CategoriaLicencia = c.CategoriaLicencia
            });

            return Ok(conductoresDTO);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ConductorDTO>> GetConductor(int id)
        {
            var conductor = await _conductorRepository.ObtenerPorIdAsync(id);
            if (conductor == null) return NotFound(new { mensaje = "Conductor no encontrado" });

            var conductorDTO = new ConductorDTO
            {
                IdConductor = conductor.IdConductor,
                IdUsuario = conductor.IdUsuario,
                IdVehiculo = conductor.IdVehiculo,
                NumeroLicencia = conductor.NumeroLicencia,
                CategoriaLicencia = conductor.CategoriaLicencia
            };

            return Ok(conductorDTO);
        }

        [HttpPost]
        public async Task<ActionResult<ConductorDTO>> PostConductor(ConductorCreateDTO conductorCreateDTO)
        {
            // 1. Validar si el usuario ya es conductor
            var usuarioExistente = await _conductorRepository.ObtenerPorIdUsuarioAsync(conductorCreateDTO.IdUsuario);
            if (usuarioExistente != null)
            {
                return BadRequest(new { mensaje = "Este usuario ya está registrado como conductor." });
            }

            // 2. Validar si el vehículo ya tiene otro conductor asignado (si se envía un id_vehiculo)
            if (conductorCreateDTO.IdVehiculo.HasValue)
            {
                var vehiculoAsignado = await _conductorRepository.ObtenerPorIdVehiculoAsync(conductorCreateDTO.IdVehiculo.Value);
                if (vehiculoAsignado != null)
                {
                    return BadRequest(new { mensaje = "El vehículo seleccionado ya está asignado a otro conductor." });
                }
            }

            var conductor = new Conductor
            {
                IdUsuario = conductorCreateDTO.IdUsuario,
                IdVehiculo = conductorCreateDTO.IdVehiculo,
                NumeroLicencia = conductorCreateDTO.NumeroLicencia,
                CategoriaLicencia = conductorCreateDTO.CategoriaLicencia
            };

            var nuevoConductor = await _conductorRepository.CrearAsync(conductor);

            var conductorDTO = new ConductorDTO
            {
                IdConductor = nuevoConductor.IdConductor,
                IdUsuario = nuevoConductor.IdUsuario,
                IdVehiculo = nuevoConductor.IdVehiculo,
                NumeroLicencia = nuevoConductor.NumeroLicencia,
                CategoriaLicencia = nuevoConductor.CategoriaLicencia
            };

            return CreatedAtAction(nameof(GetConductor), new { id = conductorDTO.IdConductor }, conductorDTO);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConductor(int id)
        {
            var eliminado = await _conductorRepository.EliminarAsync(id);
            if (!eliminado) return NotFound(new { mensaje = "Conductor no encontrado" });

            return Ok(new { mensaje = "Conductor eliminado con éxito" });
        }
    }
}