using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TransporteEscolarAPI.Data;
using TransporteEscolarAPI.Interfaces;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Repositories
{
    public class AcudienteRepository : IAcudienteRepository
    {
        private readonly AppDbContext _context;

        public AcudienteRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Acudiente>> ObtenerTodosAsync()
        {
            return await _context.Acudientes.ToListAsync();
        }

        public async Task<Acudiente?> ObtenerPorIdAsync(int id)
        {
            return await _context.Acudientes.FindAsync(id);
        }

        public async Task<Acudiente?> ObtenerPorIdUsuarioAsync(int idUsuario)
        {
            return await _context.Acudientes.FirstOrDefaultAsync(a => a.IdUsuario == idUsuario);
        }

        public async Task<Acudiente> CrearAsync(Acudiente acudiente)
        {
            _context.Acudientes.Add(acudiente);
            await _context.SaveChangesAsync();
            return acudiente;
        }

        public async Task<bool> ActualizarAsync(Acudiente acudiente)
        {
            _context.Entry(acudiente).State = EntityState.Modified;
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
            var acudiente = await _context.Acudientes.FindAsync(id);
            if (acudiente == null) return false;

            _context.Acudientes.Remove(acudiente);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}