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
    public class VehiculoController : ControllerBase
    {
        private readonly IVehiculoRepository _vehiculoRepository;

        public VehiculoController(IVehiculoRepository vehiculoRepository)
        {
            _vehiculoRepository = vehiculoRepository;
        }

        [HttpGet("obtener-todos")]
        public async Task<IActionResult> GetVehiculos(
            [FromQuery] int? pagina,
            [FromQuery] int? limite,
            [FromQuery] string? busqueda)
        {
            if (pagina.HasValue || limite.HasValue || !string.IsNullOrWhiteSpace(busqueda))
            {
                int pageNum = pagina.HasValue && pagina.Value > 0 ? pagina.Value : 1;
                int pageSize = limite.HasValue && limite.Value > 0 ? limite.Value : 10;

                var (items, totalCount) = await _vehiculoRepository.ObtenerPaginadoAsync(pageNum, pageSize, busqueda);

                var itemsDTO = items.Select(v => new VehiculoDTO
                {
                    IdVehiculo = v.IdVehiculo,
                    Placa = v.Placa,
                    Modelo = v.Modelo,
                    CapacidadPasajeros = v.CapacidadPasajeros,
                    SoatVencimiento = v.SoatVencimiento,
                    TecnomecanicaVencimiento = v.TecnomecanicaVencimiento
                });

                var resultado = new ResultadoPaginadoDTO<VehiculoDTO>
                {
                    Datos = itemsDTO,
                    TotalRegistros = totalCount,
                    PaginaActual = pageNum,
                    LimitePorPagina = pageSize
                };

                return Ok(resultado);
            }

            var vehiculos = await _vehiculoRepository.ObtenerTodosAsync();
            var vehiculosDTO = vehiculos.Select(v => new VehiculoDTO
            {
                IdVehiculo = v.IdVehiculo,
                Placa = v.Placa,
                Modelo = v.Modelo,
                CapacidadPasajeros = v.CapacidadPasajeros,
                SoatVencimiento = v.SoatVencimiento,
                TecnomecanicaVencimiento = v.TecnomecanicaVencimiento
            });

            return Ok(vehiculosDTO);
        }

        [HttpGet("obtener-por-id")]
        public async Task<ActionResult<VehiculoDTO>> GetVehiculo([FromQuery] int id)
        {
            var vehiculo = await _vehiculoRepository.ObtenerPorIdAsync(id);
            if (vehiculo == null) return NotFound(new { mensaje = "Vehículo no encontrado" });

            var vehiculoDTO = new VehiculoDTO
            {
                IdVehiculo = vehiculo.IdVehiculo,
                Placa = vehiculo.Placa,
                Modelo = vehiculo.Modelo,
                CapacidadPasajeros = vehiculo.CapacidadPasajeros,
                SoatVencimiento = vehiculo.SoatVencimiento,
                TecnomecanicaVencimiento = vehiculo.TecnomecanicaVencimiento
            };

            return Ok(vehiculoDTO);
        }

        [HttpPost("crear")]
        public async Task<ActionResult<VehiculoDTO>> PostVehiculo([FromBody] VehiculoCreateDTO vehiculoCreateDTO)
        {
            var vehiculoExistente = await _vehiculoRepository.ObtenerPorPlacaAsync(vehiculoCreateDTO.Placa);
            if (vehiculoExistente != null)
            {
                return BadRequest(new { mensaje = $"El vehículo con placa {vehiculoCreateDTO.Placa.ToUpper()} ya se encuentra registrado." });
            }

            var vehiculo = new Vehiculo
            {
                Placa = vehiculoCreateDTO.Placa.ToUpper(),
                Modelo = vehiculoCreateDTO.Modelo,
                CapacidadPasajeros = vehiculoCreateDTO.CapacidadPasajeros,
                SoatVencimiento = vehiculoCreateDTO.SoatVencimiento,
                TecnomecanicaVencimiento = vehiculoCreateDTO.TecnomecanicaVencimiento
            };

            var nuevoVehiculo = await _vehiculoRepository.CrearAsync(vehiculo);

            var vehiculoDTO = new VehiculoDTO
            {
                IdVehiculo = nuevoVehiculo.IdVehiculo,
                Placa = nuevoVehiculo.Placa,
                Modelo = nuevoVehiculo.Modelo,
                CapacidadPasajeros = nuevoVehiculo.CapacidadPasajeros,
                SoatVencimiento = nuevoVehiculo.SoatVencimiento,
                TecnomecanicaVencimiento = nuevoVehiculo.TecnomecanicaVencimiento
            };

            return CreatedAtAction(nameof(GetVehiculo), new { id = vehiculoDTO.IdVehiculo }, vehiculoDTO);
        }

        [HttpPut("actualizar")]
        public async Task<IActionResult> PutVehiculo([FromQuery] int id, [FromBody] VehiculoCreateDTO dto)
        {
            var vehiculo = await _vehiculoRepository.ObtenerPorIdAsync(id);
            if (vehiculo == null) return NotFound(new { mensaje = "Vehículo no encontrado" });

            // Validar si la placa cambió y ya existe en otro vehículo
            if (!string.Equals(vehiculo.Placa, dto.Placa, StringComparison.OrdinalIgnoreCase))
            {
                var existente = await _vehiculoRepository.ObtenerPorPlacaAsync(dto.Placa);
                if (existente != null && existente.IdVehiculo != id)
                {
                    return BadRequest(new { mensaje = $"La placa {dto.Placa.ToUpper()} ya está en uso." });
                }
            }

            vehiculo.Placa = dto.Placa.ToUpper();
            vehiculo.Modelo = dto.Modelo;
            vehiculo.CapacidadPasajeros = dto.CapacidadPasajeros;
            vehiculo.SoatVencimiento = dto.SoatVencimiento;
            vehiculo.TecnomecanicaVencimiento = dto.TecnomecanicaVencimiento;

            var actualizado = await _vehiculoRepository.ActualizarAsync(vehiculo);
            if (!actualizado) return StatusCode(500, new { mensaje = "Error al actualizar el vehículo" });

            return Ok(new { mensaje = "Vehículo actualizado con éxito" });
        }

        [HttpDelete("eliminar")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> DeleteVehiculo([FromQuery] int id)
        {
            var eliminado = await _vehiculoRepository.EliminarAsync(id);
            if (!eliminado) return NotFound(new { mensaje = "Vehículo no encontrado" });

            return Ok(new { mensaje = "Vehículo eliminado con éxito" });
        }
    }
}