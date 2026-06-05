using System.Collections.Generic;
using System.Threading.Tasks;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Interfaces
{
    public interface IRutaRepository
    {
        Task<IEnumerable<Ruta>> ObtenerTodasAsync();
        Task<Ruta?> ObtenerPorIdAsync(int id);
        Task<Ruta> CrearAsync(Ruta ruta);
        Task<bool> ActualizarAsync(Ruta ruta);
        Task<bool> EliminarAsync(int id);
    }
}
