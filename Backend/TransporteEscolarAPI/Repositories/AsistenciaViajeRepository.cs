using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TransporteEscolarAPI.Data;
using TransporteEscolarAPI.Interfaces;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Repositories
{
    public class AsistenciaViajeRepository : IAsistenciaViajeRepository
    {
        private readonly AppDbContext _context;

        public AsistenciaViajeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AsistenciaViaje>> ObtenerPorViajeAsync(int idViaje)
        {
            return await _context.AsistenciasViajes
                                 .Where(av => av.IdViaje == idViaje)
                                 .ToListAsync();
        }

        public async Task<AsistenciaViaje?> ObtenerPorIdAsync(int id)
        {
            return await _context.AsistenciasViajes.FindAsync(id);
        }

        public async Task<AsistenciaViaje?> ObtenerPorEstudianteYViajeAsync(int idEstudiante, int idViaje)
        {
            return await _context.AsistenciasViajes
                                 .FirstOrDefaultAsync(av => av.IdEstudiante == idEstudiante && av.IdViaje == idViaje);
        }

        public async Task<AsistenciaViaje> CrearAsync(AsistenciaViaje asistencia)
        {
            _context.AsistenciasViajes.Add(asistencia);
            await _context.SaveChangesAsync();
            return asistencia;
        }

        public async Task<bool> ActualizarAsync(AsistenciaViaje asistencia)
        {
            _context.Entry(asistencia).State = EntityState.Modified;
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
            var asistencia = await _context.AsistenciasViajes.FindAsync(id);
            if (asistencia == null) return false;

            _context.AsistenciasViajes.Remove(asistencia);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
