using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TransporteEscolarAPI.Data;
using TransporteEscolarAPI.Interfaces;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Repositories
{
    public class HistorialRepository : IHistorialRepository
    {
        private readonly AppDbContext _context;

        public HistorialRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Historial>> ObtenerTodosAsync()
        {
            return await _context.Historiales.ToListAsync();
        }

        public async Task<Historial?> ObtenerPorIdAsync(int id)
        {
            return await _context.Historiales.FindAsync(id);
        }

        public async Task<Historial?> ObtenerViajeActivoPorConductorAsync(int idConductor)
        {
            return await _context.Historiales
                .FirstOrDefaultAsync(h => h.IdConductor == idConductor && h.EstadoViaje == "En progreso");
        }

        public async Task<Historial> CrearAsync(Historial historial)
        {
            _context.Historiales.Add(historial);
            await _context.SaveChangesAsync();
            return historial;
        }

        public async Task<bool> ActualizarAsync(Historial historial)
        {
            _context.Entry(historial).State = EntityState.Modified;
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
    }
}