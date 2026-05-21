using System.Collections.Generic;
using System.Threading.Tasks;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Interfaces
{
    public interface IAcudienteRepository
    {
        Task<IEnumerable<Acudiente>> ObtenerTodosAsync();
        Task<Acudiente?> ObtenerPorIdAsync(int id);
        Task<Acudiente?> ObtenerPorIdUsuarioAsync(int idUsuario);
        Task<Acudiente> CrearAsync(Acudiente acudiente);
        Task<bool> ActualizarAsync(Acudiente acudiente);
        Task<bool> EliminarAsync(int id);
    }
}