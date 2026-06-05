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
    public class RutaController : ControllerBase
    {
        private readonly IRutaRepository _rutaRepository;

        public RutaController(IRutaRepository rutaRepository)
        {
            _rutaRepository = rutaRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RutaDTO>>> GetRutas()
        {
            var rutas = await _rutaRepository.ObtenerTodasAsync();
            var rutasDTO = rutas.Select(r => new RutaDTO
            {
                IdRuta = r.IdRuta,
                NombreRuta = r.NombreRuta,
                Descripcion = r.Descripcion,
                Estado = r.Estado
            });

            return Ok(rutasDTO);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RutaDTO>> GetRuta(int id)
        {
            var ruta = await _rutaRepository.ObtenerPorIdAsync(id);
            if (ruta == null) return NotFound(new { mensaje = "Ruta no encontrada" });

            var rutaDTO = new RutaDTO
            {
                IdRuta = ruta.IdRuta,
                NombreRuta = ruta.NombreRuta,
                Descripcion = ruta.Descripcion,
                Estado = ruta.Estado
            };

            return Ok(rutaDTO);
        }

        [HttpPost]
        public async Task<ActionResult<RutaDTO>> PostRuta(RutaCreateDTO rutaCreateDTO)
        {
            var ruta = new Ruta
            {
                NombreRuta = rutaCreateDTO.NombreRuta,
                Descripcion = rutaCreateDTO.Descripcion,
                Estado = true
            };

            var nuevaRuta = await _rutaRepository.CrearAsync(ruta);

            var rutaDTO = new RutaDTO
            {
                IdRuta = nuevaRuta.IdRuta,
                NombreRuta = nuevaRuta.NombreRuta,
                Descripcion = nuevaRuta.Descripcion,
                Estado = nuevaRuta.Estado
            };

            return CreatedAtAction(nameof(GetRuta), new { id = rutaDTO.IdRuta }, rutaDTO);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutRuta(int id, RutaDTO rutaDTO)
        {
            if (id != rutaDTO.IdRuta) return BadRequest(new { mensaje = "El ID no coincide" });

            var ruta = await _rutaRepository.ObtenerPorIdAsync(id);
            if (ruta == null) return NotFound(new { mensaje = "Ruta no encontrada" });

            ruta.NombreRuta = rutaDTO.NombreRuta;
            ruta.Descripcion = rutaDTO.Descripcion;
            ruta.Estado = rutaDTO.Estado;

            var actualizado = await _rutaRepository.ActualizarAsync(ruta);
            if (!actualizado) return BadRequest(new { mensaje = "No se pudo actualizar la ruta" });

            return Ok(new { mensaje = "Ruta actualizada con éxito" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRuta(int id)
        {
            var eliminado = await _rutaRepository.EliminarAsync(id);
            if (!eliminado) return NotFound(new { mensaje = "Ruta no encontrada" });

            return Ok(new { mensaje = "Ruta eliminada con éxito" });
        }
    }
}
