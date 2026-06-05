using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TransporteEscolarAPI.Data;
using TransporteEscolarAPI.Interfaces;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Repositories
{
    public class RutaRepository : IRutaRepository
    {
        private readonly AppDbContext _context;

        public RutaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Ruta>> ObtenerTodasAsync()
        {
            return await _context.Rutas.ToListAsync();
        }

        public async Task<Ruta?> ObtenerPorIdAsync(int id)
        {
            return await _context.Rutas.FindAsync(id);
        }

        public async Task<Ruta> CrearAsync(Ruta ruta)
        {
            _context.Rutas.Add(ruta);
            await _context.SaveChangesAsync();
            return ruta;
        }

        public async Task<bool> ActualizarAsync(Ruta ruta)
        {
            _context.Entry(ruta).State = EntityState.Modified;
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
            var ruta = await _context.Rutas.FindAsync(id);
            if (ruta == null) return false;

            _context.Rutas.Remove(ruta);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
