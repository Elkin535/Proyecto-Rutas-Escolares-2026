using System.Collections.Generic;
using System.Threading.Tasks;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Interfaces
{
    public interface IRutaRepository
    {
        Task<IEnumerable<Ruta>> ObtenerTodasAsync();
        Task<(IEnumerable<Ruta> Items, int TotalCount)> ObtenerPaginadoAsync(int pagina, int limite, string? busqueda);
        Task<Ruta?> ObtenerPorIdAsync(int id);
        Task<Ruta> CrearAsync(Ruta ruta);
        Task<bool> ActualizarAsync(Ruta ruta);
        Task<bool> EliminarAsync(int id);
    }
}
