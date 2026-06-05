using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TransporteEscolarAPI.Data;
using TransporteEscolarAPI.Interfaces;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Repositories
{
    public class ParadaRepository : IParadaRepository
    {
        private readonly AppDbContext _context;

        public ParadaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Parada>> ObtenerTodasAsync()
        {
            return await _context.Paradas.ToListAsync();
        }

        public async Task<Parada?> ObtenerPorIdAsync(int id)
        {
            return await _context.Paradas.FindAsync(id);
        }

        public async Task<IEnumerable<Parada>> ObtenerPorRutaAsync(int idRuta)
        {
            return await _context.Paradas
                                 .Where(p => p.IdRuta == idRuta)
                                 .OrderBy(p => p.OrdenVisita)
                                 .ToListAsync();
        }

        public async Task<Parada> CrearAsync(Parada parada)
        {
            _context.Paradas.Add(parada);
            await _context.SaveChangesAsync();
            return parada;
        }

        public async Task<bool> ActualizarAsync(Parada parada)
        {
            _context.Entry(parada).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
                return false;
            }
        }

        public async Task<bool> EliminarAsync(int id)
        {
            var parada = await _context.Paradas.FindAsync(id);
            if (parada == null) return false;

            _context.Paradas.Remove(parada);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
