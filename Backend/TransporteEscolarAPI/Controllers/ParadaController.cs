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
    public class ParadaController : ControllerBase
    {
        private readonly IParadaRepository _paradaRepository;

        public ParadaController(IParadaRepository paradaRepository)
        {
            _paradaRepository = paradaRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ParadaDTO>>> GetParadas()
        {
            var paradas = await _paradaRepository.ObtenerTodasAsync();
            var paradasDTO = paradas.Select(p => new ParadaDTO
            {
                IdParada = p.IdParada,
                IdRuta = p.IdRuta,
                NombreParada = p.NombreParada,
                Latitud = p.Latitud,
                Longitud = p.Longitud,
                OrdenVisita = p.OrdenVisita
            });

            return Ok(paradasDTO);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ParadaDTO>> GetParada(int id)
        {
            var parada = await _paradaRepository.ObtenerPorIdAsync(id);
            if (parada == null) return NotFound(new { mensaje = "Parada no encontrada" });

            var paradaDTO = new ParadaDTO
            {
                IdParada = parada.IdParada,
                IdRuta = parada.IdRuta,
                NombreParada = parada.NombreParada,
                Latitud = parada.Latitud,
                Longitud = parada.Longitud,
                OrdenVisita = parada.OrdenVisita
            };

            return Ok(paradaDTO);
        }

        [HttpGet("ruta/{idRuta}")]
        public async Task<ActionResult<IEnumerable<ParadaDTO>>> GetParadasPorRuta(int idRuta)
        {
            var paradas = await _paradaRepository.ObtenerPorRutaAsync(idRuta);
            var paradasDTO = paradas.Select(p => new ParadaDTO
            {
                IdParada = p.IdParada,
                IdRuta = p.IdRuta,
                NombreParada = p.NombreParada,
                Latitud = p.Latitud,
                Longitud = p.Longitud,
                OrdenVisita = p.OrdenVisita
            });

            return Ok(paradasDTO);
        }

        [HttpPost]
        public async Task<ActionResult<ParadaDTO>> PostParada(ParadaCreateDTO paradaCreateDTO)
        {
            var parada = new Parada
            {
                IdRuta = paradaCreateDTO.IdRuta,
                NombreParada = paradaCreateDTO.NombreParada,
                Latitud = paradaCreateDTO.Latitud,
                Longitud = paradaCreateDTO.Longitud,
                OrdenVisita = paradaCreateDTO.OrdenVisita
            };

            var nuevaParada = await _paradaRepository.CrearAsync(parada);

            var paradaDTO = new ParadaDTO
            {
                IdParada = nuevaParada.IdParada,
                IdRuta = nuevaParada.IdRuta,
                NombreParada = nuevaParada.NombreParada,
                Latitud = nuevaParada.Latitud,
                Longitud = nuevaParada.Longitud,
                OrdenVisita = nuevaParada.OrdenVisita
            };

            return CreatedAtAction(nameof(GetParada), new { id = paradaDTO.IdParada }, paradaDTO);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutParada(int id, ParadaDTO paradaDTO)
        {
            if (id != paradaDTO.IdParada) return BadRequest(new { mensaje = "El ID no coincide" });

            var parada = await _paradaRepository.ObtenerPorIdAsync(id);
            if (parada == null) return NotFound(new { mensaje = "Parada no encontrada" });

            parada.IdRuta = paradaDTO.IdRuta;
            parada.NombreParada = paradaDTO.NombreParada;
            parada.Latitud = paradaDTO.Latitud;
            parada.Longitud = paradaDTO.Longitud;
            parada.OrdenVisita = paradaDTO.OrdenVisita;

            var actualizado = await _paradaRepository.ActualizarAsync(parada);
            if (!actualizado) return BadRequest(new { mensaje = "No se pudo actualizar la parada" });

            return Ok(new { mensaje = "Parada actualizada con éxito" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteParada(int id)
        {
            var eliminado = await _paradaRepository.EliminarAsync(id);
            if (!eliminado) return NotFound(new { mensaje = "Parada no encontrada" });

            return Ok(new { mensaje = "Parada eliminada con éxito" });
        }
    }
}
