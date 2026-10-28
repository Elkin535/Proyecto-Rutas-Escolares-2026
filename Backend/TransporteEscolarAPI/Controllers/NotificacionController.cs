using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransporteEscolarAPI.Data;
using TransporteEscolarAPI.DTOs;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificacionController : ControllerBase
    {
        private readonly AppDbContext _db;

        public NotificacionController(AppDbContext db)
        {
            _db = db;
        }

        // El celular registra su token de Expo Push al iniciar sesión
        [HttpPost("registrar-token")]
        public async Task<IActionResult> RegistrarToken([FromBody] TokenPushDTO dto)
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var idUsuario)) return Unauthorized();
            if (!dto.Token.StartsWith("ExponentPushToken[") && !dto.Token.StartsWith("ExpoPushToken["))
                return BadRequest(new { mensaje = "Token de notificaciones inválido" });

            // Si el celular cambió de usuario, el token pasa al nuevo usuario
            var existente = await _db.DispositivosPush.FirstOrDefaultAsync(d => d.Token == dto.Token);
            if (existente == null)
                _db.DispositivosPush.Add(new DispositivoPush { IdUsuario = idUsuario, Token = dto.Token });
            else
                existente.IdUsuario = idUsuario;

            await _db.SaveChangesAsync();
            return Ok(new { mensaje = "Dispositivo registrado" });
        }

        // Al cerrar sesión el celular deja de recibir notificaciones de ese usuario
        [HttpDelete("eliminar-token")]
        public async Task<IActionResult> EliminarToken([FromQuery] string token)
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var idUsuario)) return Unauthorized();
            _db.DispositivosPush.RemoveRange(_db.DispositivosPush.Where(d => d.Token == token && d.IdUsuario == idUsuario));
            await _db.SaveChangesAsync();
            return Ok(new { mensaje = "Dispositivo eliminado" });
        }
    }
}
