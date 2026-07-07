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
    public class AcudienteController : ControllerBase
    {
        private readonly IAcudienteRepository _acudienteRepository;

        public AcudienteController(IAcudienteRepository acudienteRepository)
        {
            _acudienteRepository = acudienteRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AcudienteDTO>>> GetAcudientes()
        {
            var acudientes = await _acudienteRepository.ObtenerTodosAsync();
            var acudientesDTO = acudientes.Select(a => new AcudienteDTO
            {
                IdAcudiente = a.IdAcudiente,
                IdUsuario = a.IdUsuario,
                DireccionResidencia = a.DireccionResidencia
            });

            return Ok(acudientesDTO);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AcudienteDTO>> GetAcudiente(int id)
        {
            var acudiente = await _acudienteRepository.ObtenerPorIdAsync(id);
            if (acudiente == null) return NotFound(new { mensaje = "Acudiente no encontrado" });

            var acudienteDTO = new AcudienteDTO
            {
                IdAcudiente = acudiente.IdAcudiente,
                IdUsuario = acudiente.IdUsuario,
                DireccionResidencia = acudiente.DireccionResidencia
            };

            return Ok(acudienteDTO);
        }

        [HttpPost]
        public async Task<ActionResult<AcudienteDTO>> PostAcudiente(AcudienteCreateDTO acudienteCreateDTO)
        {
            // Opcional: Validar aquí si ya existe un acudiente con ese id_usuario antes de insertar
            var acudienteExistente = await _acudienteRepository.ObtenerPorIdUsuarioAsync(acudienteCreateDTO.IdUsuario);
            if (acudienteExistente != null)
            {
                return BadRequest(new { mensaje = "Este usuario ya tiene un perfil de acudiente registrado." });
            }

            var acudiente = new Acudiente
            {
                IdUsuario = acudienteCreateDTO.IdUsuario,
                DireccionResidencia = acudienteCreateDTO.DireccionResidencia
            };

            var nuevoAcudiente = await _acudienteRepository.CrearAsync(acudiente);

            var acudienteDTO = new AcudienteDTO
            {
                IdAcudiente = nuevoAcudiente.IdAcudiente,
                IdUsuario = nuevoAcudiente.IdUsuario,
                DireccionResidencia = nuevoAcudiente.DireccionResidencia
            };

            return CreatedAtAction(nameof(GetAcudiente), new { id = acudienteDTO.IdAcudiente }, acudienteDTO);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAcudiente(int id)
        {
            var eliminado = await _acudienteRepository.EliminarAsync(id);
            if (!eliminado) return NotFound(new { mensaje = "Acudiente no encontrado" });

            return Ok(new { mensaje = "Acudiente eliminado con éxito" });
        }
    }
}
//prueba