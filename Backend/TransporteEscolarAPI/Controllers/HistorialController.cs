using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolarAPI.DTOs;
using TransporteEscolarAPI.Interfaces;
using TransporteEscolarAPI.Models;
using Microsoft.AspNetCore.SignalR;
using TransporteEscolarAPI.Hubs;

namespace TransporteEscolarAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HistorialController : ControllerBase
    {
        private readonly IHistorialRepository _historialRepository;
        private readonly IHubContext<TrackingHub> _hubContext;

        public HistorialController(IHistorialRepository historialRepository, IHubContext<TrackingHub> hubContext)
        {
            _historialRepository = historialRepository;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<HistorialDTO>>> GetHistoriales()
        {
            var viajes = await _historialRepository.ObtenerTodosAsync();
            return Ok(viajes.Select(v => new HistorialDTO
            {
                IdViaje = v.IdViaje, IdVehiculo = v.IdVehiculo, IdConductor = v.IdConductor,
                Fecha = v.Fecha, HoraInicio = v.HoraInicio, HoraFin = v.HoraFin,
                EstadoViaje = v.EstadoViaje, LatitudActual = v.LatitudActual, LongitudActual = v.LongitudActual
            }));
        }

        [HttpPost("iniciar")]
        public async Task<ActionResult<HistorialDTO>> IniciarViaje(HistorialCreateDTO dto)
        {
            var viajeActivo = await _historialRepository.ObtenerViajeActivoPorConductorAsync(dto.IdConductor);
            if (viajeActivo != null) return BadRequest(new { mensaje = "El conductor ya tiene un viaje activo en curso." });

            var historial = new Historial
            {
                IdVehiculo = dto.IdVehiculo,
                IdConductor = dto.IdConductor,
                Fecha = DateTime.Today,
                HoraInicio = DateTime.Now.TimeOfDay,
                EstadoViaje = "En progreso"
            };

            var nuevoViaje = await _historialRepository.CrearAsync(historial);
            return Ok(nuevoViaje);
        }

        [HttpPut("{idViaje}/gps")]
        public async Task<IActionResult> ActualizarGPS(int idViaje, UbicacionGPSDTO gpsDto)
        {
            var viaje = await _historialRepository.ObtenerPorIdAsync(idViaje);
            if (viaje == null || viaje.EstadoViaje != "En progreso") 
                return NotFound(new { mensaje = "Viaje activo no encontrado" });

            viaje.LatitudActual = gpsDto.LatitudActual;
            viaje.LongitudActual = gpsDto.LongitudActual;

            await _historialRepository.ActualizarAsync(viaje);

            // Broadcast the location update to all clients in this trip's group
            await _hubContext.Clients.Group($"viaje_{idViaje}").SendAsync("RecibirUbicacion", new {
                latitud = gpsDto.LatitudActual,
                longitud = gpsDto.LongitudActual
            });

            return Ok(new { mensaje = "Coordenadas GPS actualizadas con éxito" });
        }

        [HttpPut("{idViaje}/finalizar")]
        public async Task<IActionResult> FinalizarViaje(int idViaje)
        {
            var viaje = await _historialRepository.ObtenerPorIdAsync(idViaje);
            if (viaje == null) return NotFound(new { mensaje = "Viaje no encontrado" });

            viaje.HoraFin = DateTime.Now.TimeOfDay;
            viaje.EstadoViaje = "Finalizado";

            await _historialRepository.ActualizarAsync(viaje);
            return Ok(new { mensaje = "Viaje completado y guardado en el historial con éxito" });
        }
    }
}