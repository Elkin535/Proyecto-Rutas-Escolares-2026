using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolarAPI.DTOs;
using TransporteEscolarAPI.Interfaces;
using TransporteEscolarAPI.Models;
using TransporteEscolarAPI.Service;
using System;
using Microsoft.Extensions.Logging;

namespace TransporteEscolarAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EstudianteController : ControllerBase
    {
        private readonly IEstudianteRepository _estudianteRepository;
        private readonly IReconocimientoService _reconocimiento;
        private readonly ILogger<EstudianteController> _logger;

        public EstudianteController(
            IEstudianteRepository estudianteRepository,
            IReconocimientoService reconocimiento,
            ILogger<EstudianteController> logger)
        {
            _estudianteRepository = estudianteRepository;
            _reconocimiento = reconocimiento;
            _logger = logger;
        }

        [HttpGet("obtener-todos")]
        public async Task<IActionResult> GetEstudiantes(
            [FromQuery] int? pagina,
            [FromQuery] int? limite,
            [FromQuery] string? busqueda)
        {
            if (pagina.HasValue || limite.HasValue || !string.IsNullOrWhiteSpace(busqueda))
            {
                int pageNum = pagina.HasValue && pagina.Value > 0 ? pagina.Value : 1;
                int pageSize = limite.HasValue && limite.Value > 0 ? limite.Value : 10;

                var (items, totalCount) = await _estudianteRepository.ObtenerPaginadoAsync(pageNum, pageSize, busqueda);

                var itemsDTO = items.Select(e => new EstudianteDTO
                {
                    IdEstudiante = e.IdEstudiante,
                    IdAcudiente = e.IdAcudiente,
                    Nombre = e.Nombre,
                    Apellido = e.Apellido,
                    Colegio = e.Colegio,
                    CursoGrado = e.CursoGrado,
                    Estado = e.Estado,
                    IdRuta = e.IdRuta,
                    IdParada = e.IdParada,
                    RostroRegistrado = e.RostroRegistrado
                });

                var resultado = new ResultadoPaginadoDTO<EstudianteDTO>
                {
                    Datos = itemsDTO,
                    TotalRegistros = totalCount,
                    PaginaActual = pageNum,
                    LimitePorPagina = pageSize
                };

                return Ok(resultado);
            }

            var estudiantes = await _estudianteRepository.ObtenerTodosAsync();
            var estudiantesDTO = estudiantes.Select(e => new EstudianteDTO
            {
                IdEstudiante = e.IdEstudiante,
                IdAcudiente = e.IdAcudiente,
                Nombre = e.Nombre,
                Apellido = e.Apellido,
                Colegio = e.Colegio,
                CursoGrado = e.CursoGrado,
                Estado = e.Estado,
                IdRuta = e.IdRuta,
                IdParada = e.IdParada,
                RostroRegistrado = e.RostroRegistrado
            });

            return Ok(estudiantesDTO);
        }

        [HttpGet("obtener-por-id")]
        public async Task<ActionResult<EstudianteDTO>> GetEstudiante([FromQuery] int id)
        {
            var estudiante = await _estudianteRepository.ObtenerPorIdAsync(id);
            if (estudiante == null) return NotFound(new { mensaje = "Estudiante no encontrado" });

            var estudianteDTO = new EstudianteDTO
            {
                IdEstudiante = estudiante.IdEstudiante,
                IdAcudiente = estudiante.IdAcudiente,
                Nombre = estudiante.Nombre,
                Apellido = estudiante.Apellido,
                Colegio = estudiante.Colegio,
                CursoGrado = estudiante.CursoGrado,
                Estado = estudiante.Estado,
                IdRuta = estudiante.IdRuta,
                IdParada = estudiante.IdParada,
                RostroRegistrado = estudiante.RostroRegistrado
            };

            return Ok(estudianteDTO);
        }

        // Nuevo endpoint para traer los estudiantes de un acudiente en específico
        [HttpGet("obtener-por-acudiente")]
        public async Task<ActionResult<IEnumerable<EstudianteDTO>>> GetEstudiantesPorAcudiente([FromQuery] int idAcudiente)
        {
            var estudiantes = await _estudianteRepository.ObtenerPorAcudienteAsync(idAcudiente);
            var estudiantesDTO = estudiantes.Select(e => new EstudianteDTO
            {
                IdEstudiante = e.IdEstudiante,
                IdAcudiente = e.IdAcudiente,
                Nombre = e.Nombre,
                Apellido = e.Apellido,
                Colegio = e.Colegio,
                CursoGrado = e.CursoGrado,
                Estado = e.Estado,
                IdRuta = e.IdRuta,
                IdParada = e.IdParada,
                RostroRegistrado = e.RostroRegistrado
            });

            return Ok(estudiantesDTO);
        }

        [HttpPost("crear")]
        public async Task<ActionResult<EstudianteDTO>> PostEstudiante([FromBody] EstudianteCreateDTO estudianteCreateDTO)
        {
            var estudiante = new Estudiante
            {
                IdAcudiente = estudianteCreateDTO.IdAcudiente,
                Nombre = estudianteCreateDTO.Nombre,
                Apellido = estudianteCreateDTO.Apellido,
                Colegio = estudianteCreateDTO.Colegio,
                CursoGrado = estudianteCreateDTO.CursoGrado,
                Estado = true, // Por defecto activo al crearse
                IdRuta = estudianteCreateDTO.IdRuta,
                IdParada = estudianteCreateDTO.IdParada
            };

            var nuevoEstudiante = await _estudianteRepository.CrearAsync(estudiante);

            var estudianteDTO = new EstudianteDTO
            {
                IdEstudiante = nuevoEstudiante.IdEstudiante,
                IdAcudiente = nuevoEstudiante.IdAcudiente,
                Nombre = nuevoEstudiante.Nombre,
                Apellido = nuevoEstudiante.Apellido,
                Colegio = nuevoEstudiante.Colegio,
                CursoGrado = nuevoEstudiante.CursoGrado,
                Estado = nuevoEstudiante.Estado,
                IdRuta = nuevoEstudiante.IdRuta,
                IdParada = nuevoEstudiante.IdParada,
                RostroRegistrado = nuevoEstudiante.RostroRegistrado
            };

            return CreatedAtAction(nameof(GetEstudiante), new { id = estudianteDTO.IdEstudiante }, estudianteDTO);
        }

        [HttpPut("actualizar")]
        public async Task<ActionResult<EstudianteDTO>> PutEstudiante([FromQuery] int id, [FromBody] EstudianteUpdateDTO estudianteUpdateDTO)
        {
            var estudiante = await _estudianteRepository.ObtenerPorIdAsync(id);
            if (estudiante == null) return NotFound(new { mensaje = "Estudiante no encontrado" });

            estudiante.IdAcudiente = estudianteUpdateDTO.IdAcudiente;
            estudiante.Nombre = estudianteUpdateDTO.Nombre;
            estudiante.Apellido = estudianteUpdateDTO.Apellido;
            estudiante.Colegio = estudianteUpdateDTO.Colegio;
            estudiante.CursoGrado = estudianteUpdateDTO.CursoGrado;
            estudiante.Estado = estudianteUpdateDTO.Estado;
            estudiante.IdRuta = estudianteUpdateDTO.IdRuta;
            estudiante.IdParada = estudianteUpdateDTO.IdParada;

            var actualizado = await _estudianteRepository.ActualizarAsync(estudiante);
            if (!actualizado) return StatusCode(500, new { mensaje = "Error al actualizar el estudiante" });

            var estudianteDTO = new EstudianteDTO
            {
                IdEstudiante = estudiante.IdEstudiante,
                IdAcudiente = estudiante.IdAcudiente,
                Nombre = estudiante.Nombre,
                Apellido = estudiante.Apellido,
                Colegio = estudiante.Colegio,
                CursoGrado = estudiante.CursoGrado,
                Estado = estudiante.Estado,
                IdRuta = estudiante.IdRuta,
                IdParada = estudiante.IdParada,
                RostroRegistrado = estudiante.RostroRegistrado
            };

            return Ok(estudianteDTO);
        }

        [HttpDelete("eliminar")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> DeleteEstudiante([FromQuery] int id)
        {
            var estudiante = await _estudianteRepository.ObtenerPorIdAsync(id);
            var eliminado = await _estudianteRepository.EliminarAsync(id);
            if (!eliminado) return NotFound(new { mensaje = "Estudiante no encontrado" });

            // Sus datos biométricos también se borran de AWS; si AWS falla, el estudiante igual queda eliminado
            if (estudiante?.RostroRegistrado == true)
            {
                try { await _reconocimiento.EliminarRostroAsync(id); }
                catch (Exception ex) { _logger.LogError(ex, "No se pudo borrar el rostro del estudiante {Id} en Rekognition", id); }
            }

            return Ok(new { mensaje = "Estudiante eliminado con éxito" });
        }
    }
}