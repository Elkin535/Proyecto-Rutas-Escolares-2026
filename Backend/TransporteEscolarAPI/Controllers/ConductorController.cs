using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolarAPI.DTOs;
using TransporteEscolarAPI.Interfaces;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ConductorController : ControllerBase
    {
        private readonly IConductorRepository _conductorRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IVehiculoRepository _vehiculoRepository;

        public ConductorController(
            IConductorRepository conductorRepository,
            IUsuarioRepository usuarioRepository,
            IVehiculoRepository vehiculoRepository)
        {
            _conductorRepository = conductorRepository;
            _usuarioRepository = usuarioRepository;
            _vehiculoRepository = vehiculoRepository;
        }

        // Devuelve el mensaje de error si el vehículo no existe o ya tiene otro conductor; null si se puede asignar
        private async Task<string?> ValidarVehiculoAsync(int idVehiculo, int? idConductorActual)
        {
            var vehiculo = await _vehiculoRepository.ObtenerPorIdAsync(idVehiculo);
            if (vehiculo == null) return "El vehículo seleccionado no existe.";

            var asignado = await _conductorRepository.ObtenerPorIdVehiculoAsync(idVehiculo);
            if (asignado != null && asignado.IdConductor != idConductorActual)
            {
                var otro = await _usuarioRepository.ObtenerPorIdAsync(asignado.IdUsuario);
                var nombre = otro != null ? $"{otro.Nombre} {otro.Apellido}" : $"el conductor #{asignado.IdConductor}";
                return $"El vehículo {vehiculo.Placa} ya está asignado a {nombre}. Elige otro vehículo o déjalo sin asignar.";
            }
            return null;
        }

        [HttpGet("obtener-todos")]
        public async Task<IActionResult> GetConductores(
            [FromQuery] int? pagina,
            [FromQuery] int? limite,
            [FromQuery] string? busqueda)
        {
            if (pagina.HasValue || limite.HasValue || !string.IsNullOrWhiteSpace(busqueda))
            {
                int pageNum = pagina.HasValue && pagina.Value > 0 ? pagina.Value : 1;
                int pageSize = limite.HasValue && limite.Value > 0 ? limite.Value : 10;

                var (items, totalCount) = await _conductorRepository.ObtenerPaginadoAsync(pageNum, pageSize, busqueda);

                var itemsDTO = items.Select(c => new ConductorDTO
                {
                    IdConductor = c.IdConductor,
                    IdUsuario = c.IdUsuario,
                    IdVehiculo = c.IdVehiculo,
                    NumeroLicencia = c.NumeroLicencia,
                    CategoriaLicencia = c.CategoriaLicencia
                });

                var resultado = new ResultadoPaginadoDTO<ConductorDTO>
                {
                    Datos = itemsDTO,
                    TotalRegistros = totalCount,
                    PaginaActual = pageNum,
                    LimitePorPagina = pageSize
                };

                return Ok(resultado);
            }

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

        [HttpGet("obtener-por-id")]
        public async Task<ActionResult<ConductorDTO>> GetConductor([FromQuery] int id)
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

        [HttpPost("crear")]
        public async Task<ActionResult<ConductorDTO>> PostConductor([FromBody] ConductorCreateDTO conductorCreateDTO)
        {
            // 1. El usuario debe existir y no ser ya conductor
            var usuario = await _usuarioRepository.ObtenerPorIdAsync(conductorCreateDTO.IdUsuario);
            if (usuario == null)
            {
                return BadRequest(new { mensaje = "El usuario indicado no existe." });
            }

            var usuarioExistente = await _conductorRepository.ObtenerPorIdUsuarioAsync(conductorCreateDTO.IdUsuario);
            if (usuarioExistente != null)
            {
                return BadRequest(new { mensaje = "Este usuario ya está registrado como conductor." });
            }

            // 2. Si se envía vehículo: debe existir y no tener otro conductor
            if (conductorCreateDTO.IdVehiculo.HasValue)
            {
                var error = await ValidarVehiculoAsync(conductorCreateDTO.IdVehiculo.Value, null);
                if (error != null) return BadRequest(new { mensaje = error });
            }

            var conductor = new Conductor
            {
                IdUsuario = conductorCreateDTO.IdUsuario,
                IdVehiculo = conductorCreateDTO.IdVehiculo,
                NumeroLicencia = conductorCreateDTO.NumeroLicencia.Trim(),
                CategoriaLicencia = string.IsNullOrWhiteSpace(conductorCreateDTO.CategoriaLicencia)
                    ? null
                    : conductorCreateDTO.CategoriaLicencia.Trim().ToUpper()
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

        [HttpPut("actualizar")]
        public async Task<ActionResult<ConductorDTO>> PutConductor([FromQuery] int id, [FromBody] ConductorUpdateDTO conductorUpdateDTO)
        {
            var conductor = await _conductorRepository.ObtenerPorIdAsync(id);
            if (conductor == null) return NotFound(new { mensaje = "Conductor no encontrado" });

            // Validar si se está cambiando de vehículo y este ya tiene otro conductor asignado
            if (conductorUpdateDTO.IdVehiculo.HasValue && conductor.IdVehiculo != conductorUpdateDTO.IdVehiculo)
            {
                var error = await ValidarVehiculoAsync(conductorUpdateDTO.IdVehiculo.Value, id);
                if (error != null) return BadRequest(new { mensaje = error });
            }

            conductor.IdUsuario = conductorUpdateDTO.IdUsuario;
            conductor.IdVehiculo = conductorUpdateDTO.IdVehiculo;
            conductor.NumeroLicencia = conductorUpdateDTO.NumeroLicencia.Trim();
            conductor.CategoriaLicencia = string.IsNullOrWhiteSpace(conductorUpdateDTO.CategoriaLicencia)
                ? null
                : conductorUpdateDTO.CategoriaLicencia.Trim().ToUpper();

            var actualizado = await _conductorRepository.ActualizarAsync(conductor);
            if (!actualizado) return StatusCode(500, new { mensaje = "Error al actualizar el conductor" });

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

        [HttpDelete("eliminar")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> DeleteConductor([FromQuery] int id)
        {
            var eliminado = await _conductorRepository.EliminarAsync(id);
            if (!eliminado) return NotFound(new { mensaje = "Conductor no encontrado" });

            return Ok(new { mensaje = "Conductor eliminado con éxito" });
        }
    }
}