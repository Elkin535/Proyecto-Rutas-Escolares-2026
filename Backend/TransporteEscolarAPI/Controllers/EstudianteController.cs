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
    public class EstudianteController : ControllerBase
    {
        private readonly IEstudianteRepository _estudianteRepository;

        public EstudianteController(IEstudianteRepository estudianteRepository)
        {
            _estudianteRepository = estudianteRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EstudianteDTO>>> GetEstudiantes()
        {
            var estudiantes = await _estudianteRepository.ObtenerTodosAsync();
            var estudiantesDTO = estudiantes.Select(e => new EstudianteDTO
            {
                IdEstudiante = e.IdEstudiante,
                IdAcudiente = e.IdAcudiente,
                Nombre = e.Nombre,
                Apellido = e.Apellido,
                Colegio = e.Colegio,
                CursoGrado = e.CursoGrado,
                Estado = e.Estado
            });

            return Ok(estudiantesDTO);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EstudianteDTO>> GetEstudiante(int id)
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
                Estado = estudiante.Estado
            };

            return Ok(estudianteDTO);
        }

        // Nuevo endpoint para traer los estudiantes de un acudiente en específico
        [HttpGet("acudiente/{idAcudiente}")]
        public async Task<ActionResult<IEnumerable<EstudianteDTO>>> GetEstudiantesPorAcudiente(int idAcudiente)
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
                Estado = e.Estado
            });

            return Ok(estudiantesDTO);
        }

        [HttpPost]
        public async Task<ActionResult<EstudianteDTO>> PostEstudiante(EstudianteCreateDTO estudianteCreateDTO)
        {
            var estudiante = new Estudiante
            {
                IdAcudiente = estudianteCreateDTO.IdAcudiente,
                Nombre = estudianteCreateDTO.Nombre,
                Apellido = estudianteCreateDTO.Apellido,
                Colegio = estudianteCreateDTO.Colegio,
                CursoGrado = estudianteCreateDTO.CursoGrado,
                Estado = true // Por defecto activo al crearse
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
                Estado = nuevoEstudiante.Estado
            };

            return CreatedAtAction(nameof(GetEstudiante), new { id = estudianteDTO.IdEstudiante }, estudianteDTO);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEstudiante(int id)
        {
            var eliminado = await _estudianteRepository.EliminarAsync(id);
            if (!eliminado) return NotFound(new { mensaje = "Estudiante no encontrado" });

            return Ok(new { mensaje = "Estudiante eliminado con éxito" });
        }
    }
}