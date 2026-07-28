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

        [HttpGet]
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

        [HttpGet("{id}")]
        public async Task<ActionResult<VehiculoDTO>> GetVehiculo(int id)
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

        [HttpPost]
        public async Task<ActionResult<VehiculoDTO>> PostVehiculo(VehiculoCreateDTO vehiculoCreateDTO)
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

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> DeleteVehiculo(int id)
        {
            var eliminado = await _vehiculoRepository.EliminarAsync(id);
            if (!eliminado) return NotFound(new { mensaje = "Vehículo no encontrado" });

            return Ok(new { mensaje = "Vehículo eliminado con éxito" });
        }
    }
}