using System;
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
    public class AsistenciaViajeController : ControllerBase
    {
        private readonly IAsistenciaViajeRepository _asistenciaRepository;

        public AsistenciaViajeController(IAsistenciaViajeRepository asistenciaRepository)
        {
            _asistenciaRepository = asistenciaRepository;
        }

        [HttpGet("viaje/{idViaje}")]
        public async Task<ActionResult<IEnumerable<AsistenciaViajeDTO>>> GetAsistenciasPorViaje(int idViaje)
        {
            var asistencias = await _asistenciaRepository.ObtenerPorViajeAsync(idViaje);
            var dtos = asistencias.Select(av => new AsistenciaViajeDTO
            {
                IdAsistencia = av.IdAsistencia,
                IdViaje = av.IdViaje,
                IdEstudiante = av.IdEstudiante,
                EstadoAbordaje = av.EstadoAbordaje,
                HoraAbordaje = av.HoraAbordaje,
                HoraEntrega = av.HoraEntrega
            });

            return Ok(dtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AsistenciaViajeDTO>> GetAsistencia(int id)
        {
            var av = await _asistenciaRepository.ObtenerPorIdAsync(id);
            if (av == null) return NotFound(new { mensaje = "Registro de asistencia no encontrado" });

            var dto = new AsistenciaViajeDTO
            {
                IdAsistencia = av.IdAsistencia,
                IdViaje = av.IdViaje,
                IdEstudiante = av.IdEstudiante,
                EstadoAbordaje = av.EstadoAbordaje,
                HoraAbordaje = av.HoraAbordaje,
                HoraEntrega = av.HoraEntrega
            };

            return Ok(dto);
        }

        [HttpPost]
        public async Task<ActionResult<AsistenciaViajeDTO>> PostAsistencia(AsistenciaViajeCreateDTO createDTO)
        {
            // Validar si ya existe el registro del estudiante en este viaje
            var existente = await _asistenciaRepository.ObtenerPorEstudianteYViajeAsync(createDTO.IdEstudiante, createDTO.IdViaje);
            if (existente != null)
            {
                return BadRequest(new { mensaje = "El estudiante ya está registrado en este viaje" });
            }

            var av = new AsistenciaViaje
            {
                IdViaje = createDTO.IdViaje,
                IdEstudiante = createDTO.IdEstudiante,
                EstadoAbordaje = "Pendiente",
                HoraAbordaje = null,
                HoraEntrega = null
            };

            var nuevaAsistencia = await _asistenciaRepository.CrearAsync(av);

            var dto = new AsistenciaViajeDTO
            {
                IdAsistencia = nuevaAsistencia.IdAsistencia,
                IdViaje = nuevaAsistencia.IdViaje,
                IdEstudiante = nuevaAsistencia.IdEstudiante,
                EstadoAbordaje = nuevaAsistencia.EstadoAbordaje,
                HoraAbordaje = nuevaAsistencia.HoraAbordaje,
                HoraEntrega = nuevaAsistencia.HoraEntrega
            };

            return CreatedAtAction(nameof(GetAsistencia), new { id = dto.IdAsistencia }, dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutAsistencia(int id, AsistenciaViajeUpdateDTO updateDTO)
        {
            var av = await _asistenciaRepository.ObtenerPorIdAsync(id);
            if (av == null) return NotFound(new { mensaje = "Registro de asistencia no encontrado" });

            string anteriorEstado = av.EstadoAbordaje;
            av.EstadoAbordaje = updateDTO.EstadoAbordaje;

            // Lógica automática para marcar las horas de eventos
            if (updateDTO.EstadoAbordaje.Equals("Abordo", StringComparison.OrdinalIgnoreCase) && 
                !anteriorEstado.Equals("Abordo", StringComparison.OrdinalIgnoreCase))
            {
                av.HoraAbordaje = DateTime.Now.TimeOfDay;
            }
            else if (updateDTO.EstadoAbordaje.Equals("Entregado", StringComparison.OrdinalIgnoreCase) && 
                     !anteriorEstado.Equals("Entregado", StringComparison.OrdinalIgnoreCase))
            {
                av.HoraEntrega = DateTime.Now.TimeOfDay;
            }
            else if (updateDTO.EstadoAbordaje.Equals("Pendiente", StringComparison.OrdinalIgnoreCase))
            {
                av.HoraAbordaje = null;
                av.HoraEntrega = null;
            }

            var actualizado = await _asistenciaRepository.ActualizarAsync(av);
            if (!actualizado) return BadRequest(new { mensaje = "No se pudo actualizar la asistencia" });

            return Ok(new { mensaje = "Estado de asistencia actualizado", horaAbordaje = av.HoraAbordaje, horaEntrega = av.HoraEntrega });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsistencia(int id)
        {
            var eliminado = await _asistenciaRepository.EliminarAsync(id);
            if (!eliminado) return NotFound(new { mensaje = "Registro de asistencia no encontrado" });

            return Ok(new { mensaje = "Registro de asistencia eliminado con éxito" });
        }
    }
}
