using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TransporteEscolarAPI.Data;
using TransporteEscolarAPI.Interfaces;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Repositories
{
    public class ConductorRepository : IConductorRepository
    {
        private readonly AppDbContext _context;

        public ConductorRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Conductor>> ObtenerTodosAsync()
        {
            return await _context.Conductores.ToListAsync();
        }

        public async Task<Conductor?> ObtenerPorIdAsync(int id)
        {
            return await _context.Conductores.FindAsync(id);
        }

        public async Task<Conductor?> ObtenerPorIdUsuarioAsync(int idUsuario)
        {
            return await _context.Conductores.FirstOrDefaultAsync(c => c.IdUsuario == idUsuario);
        }

        public async Task<Conductor?> ObtenerPorIdVehiculoAsync(int idVehiculo)
        {
            return await _context.Conductores.FirstOrDefaultAsync(c => c.IdVehiculo == idVehiculo);
        }

        public async Task<Conductor> CrearAsync(Conductor conductor)
        {
            _context.Conductores.Add(conductor);
            await _context.SaveChangesAsync();
            return conductor;
        }

        public async Task<bool> ActualizarAsync(Conductor conductor)
        {
            _context.Entry(conductor).State = EntityState.Modified;
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
            var conductor = await _context.Conductores.FindAsync(id);
            if (conductor == null) return false;

            _context.Conductores.Remove(conductor);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}