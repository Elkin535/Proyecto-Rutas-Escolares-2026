using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TransporteEscolarAPI.Data;
using TransporteEscolarAPI.DTOs;
using TransporteEscolarAPI.Hubs;
using TransporteEscolarAPI.Models;
using TransporteEscolarAPI.Service;

namespace TransporteEscolarAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AlertaController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IHubContext<TrackingHub> _hub;
        private readonly INotificacionService _notificaciones;

        public AlertaController(AppDbContext db, IHubContext<TrackingHub> hub, INotificacionService notificaciones)
        {
            _db = db;
            _hub = hub;
            _notificaciones = notificaciones;
        }

        // El celular del conductor detectó ojos cerrados (microsueño) o parpadeo lento sostenido (fatiga)
        [HttpPost("somnolencia")]
        [Authorize(Roles = "Conductor")]
        public async Task<IActionResult> Somnolencia([FromBody] AlertaCreateDTO dto)
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var idUsuario)) return Unauthorized();

            var conductor = await _db.Conductores.FirstOrDefaultAsync(c => c.IdUsuario == idUsuario);
            if (conductor == null) return NotFound(new { mensaje = "El usuario no tiene perfil de conductor" });

            var nombre = User.FindFirstValue(ClaimTypes.Name) ?? "El conductor";
            var placa = await _db.Vehiculos.Where(v => v.IdVehiculo == conductor.IdVehiculo).Select(v => v.Placa).FirstOrDefaultAsync();
            var mensaje = dto.Tipo == "Microsueño"
                ? $"{nombre} cerró los ojos varios segundos ({placa ?? "sin placa"})."
                : $"{nombre} muestra señales de cansancio ({placa ?? "sin placa"}).";

            var alerta = new Alerta
            {
                Tipo = dto.Tipo,
                IdConductor = conductor.IdConductor,
                IdViaje = dto.IdViaje,
                Mensaje = mensaje,
                Latitud = dto.Latitud,
                Longitud = dto.Longitud,
            };
            _db.Alertas.Add(alerta);
            await _db.SaveChangesAsync();

            var payload = new { alerta.IdAlerta, alerta.Tipo, alerta.Mensaje, alerta.Fecha, alerta.Latitud, alerta.Longitud, alerta.IdViaje };
            await _hub.Clients.Group(TrackingHub.GRUPO_ADMINS).SendAsync("RecibirAlerta", payload);
            await _notificaciones.NotificarAdministradoresAsync(
                dto.Tipo == "Microsueño" ? "⚠️ Posible microsueño del conductor" : "⚠️ Conductor con señales de fatiga",
                mensaje,
                new { idAlerta = alerta.IdAlerta });

            return Ok(payload);
        }

        [HttpGet("obtener-recientes")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> ObtenerRecientes()
        {
            var desde = DateTime.UtcNow.AddDays(-7);
            var alertas = await _db.Alertas
                .Where(a => a.Fecha >= desde)
                .OrderByDescending(a => a.Fecha)
                .Take(30)
                .ToListAsync();
            return Ok(alertas);
        }

        [HttpPut("atender")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> Atender([FromQuery] int id)
        {
            var alerta = await _db.Alertas.FindAsync(id);
            if (alerta == null) return NotFound(new { mensaje = "Alerta no encontrada" });
            alerta.Atendida = true;
            await _db.SaveChangesAsync();
            return Ok(new { mensaje = "Alerta marcada como atendida" });
        }
    }
}
