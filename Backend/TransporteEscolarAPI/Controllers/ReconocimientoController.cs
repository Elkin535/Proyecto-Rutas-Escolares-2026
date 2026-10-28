using System;
using System.Threading.Tasks;
using Amazon.Rekognition;
using Amazon.Runtime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TransporteEscolarAPI.DTOs;
using TransporteEscolarAPI.Interfaces;
using TransporteEscolarAPI.Service;

namespace TransporteEscolarAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReconocimientoController : ControllerBase
    {
        // Límite de Rekognition para imágenes enviadas como bytes
        private const int MAX_BYTES = 5 * 1024 * 1024;

        private readonly IReconocimientoService _reconocimiento;
        private readonly IEstudianteRepository _estudianteRepository;
        private readonly ILogger<ReconocimientoController> _logger;

        public ReconocimientoController(
            IReconocimientoService reconocimiento,
            IEstudianteRepository estudianteRepository,
            ILogger<ReconocimientoController> logger)
        {
            _reconocimiento = reconocimiento;
            _estudianteRepository = estudianteRepository;
            _logger = logger;
        }

        private static byte[]? Decodificar(string base64)
        {
            var coma = base64.IndexOf(',');
            try
            {
                var bytes = Convert.FromBase64String(coma >= 0 ? base64[(coma + 1)..] : base64);
                return bytes.Length is > 0 and <= MAX_BYTES ? bytes : null;
            }
            catch (FormatException)
            {
                return null;
            }
        }

        // Errores de credenciales o de red con AWS: el resto de la app sigue funcionando
        private ObjectResult ServicioNoDisponible(Exception ex)
        {
            _logger.LogError(ex, "Error con AWS Rekognition");
            return StatusCode(503, new { mensaje = "El servicio de reconocimiento facial no está disponible. Revisa la configuración de AWS." });
        }

        [HttpPost("registrar-rostro")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> RegistrarRostro([FromQuery] int idEstudiante, [FromBody] ImagenRostroDTO dto)
        {
            if (!dto.ConsentimientoAcudiente)
                return BadRequest(new { mensaje = "Se requiere la autorización del acudiente para registrar datos biométricos del estudiante." });

            var estudiante = await _estudianteRepository.ObtenerPorIdAsync(idEstudiante);
            if (estudiante == null) return NotFound(new { mensaje = "Estudiante no encontrado" });

            var imagen = Decodificar(dto.ImagenBase64);
            if (imagen == null) return BadRequest(new { mensaje = "La imagen no es válida o supera los 5 MB." });

            try
            {
                if (!await _reconocimiento.RegistrarRostroAsync(idEstudiante, imagen))
                    return BadRequest(new { mensaje = "No se detectó un rostro claro. Toma la foto de frente y con buena luz." });
            }
            catch (Exception ex) when (ex is AmazonRekognitionException or AmazonClientException)
            {
                return ServicioNoDisponible(ex);
            }

            estudiante.RostroRegistrado = true;
            await _estudianteRepository.ActualizarAsync(estudiante);
            return Ok(new { mensaje = "Rostro registrado con éxito" });
        }

        [HttpDelete("eliminar-rostro")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> EliminarRostro([FromQuery] int idEstudiante)
        {
            var estudiante = await _estudianteRepository.ObtenerPorIdAsync(idEstudiante);
            if (estudiante == null) return NotFound(new { mensaje = "Estudiante no encontrado" });

            try
            {
                await _reconocimiento.EliminarRostroAsync(idEstudiante);
            }
            catch (Exception ex) when (ex is AmazonRekognitionException or AmazonClientException)
            {
                return ServicioNoDisponible(ex);
            }

            estudiante.RostroRegistrado = false;
            await _estudianteRepository.ActualizarAsync(estudiante);
            return Ok(new { mensaje = "Rostro eliminado" });
        }

        [HttpPost("identificar")]
        [Authorize(Roles = "Conductor,Administrador")]
        public async Task<IActionResult> Identificar([FromBody] ImagenRostroDTO dto)
        {
            var imagen = Decodificar(dto.ImagenBase64);
            if (imagen == null) return BadRequest(new { mensaje = "La imagen no es válida o supera los 5 MB." });

            try
            {
                var resultado = await _reconocimiento.IdentificarAsync(imagen);
                if (resultado == null)
                    return NotFound(new { mensaje = "No se reconoció al estudiante. Intenta de nuevo o márcalo manualmente." });

                var est = await _estudianteRepository.ObtenerPorIdAsync(resultado.Value.IdEstudiante);
                if (est == null) return NotFound(new { mensaje = "El rostro pertenece a un estudiante que ya no existe." });

                return Ok(new
                {
                    idEstudiante = est.IdEstudiante,
                    nombre = $"{est.Nombre} {est.Apellido}".Trim(),
                    similitud = Math.Round(resultado.Value.Similitud, 1),
                });
            }
            catch (Exception ex) when (ex is AmazonRekognitionException or AmazonClientException)
            {
                return ServicioNoDisponible(ex);
            }
        }
    }
}
